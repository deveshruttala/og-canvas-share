/**
 * Wall API — Deno Deploy backend (auth, walls, widgets, stats, SSE, protocol).
 */
import { compare, hash } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'
import { create, getNumericDate, verify } from 'https://deno.land/x/djwt@v3.0.2/mod.ts'

import { handleAiChat } from './ai.ts'
import { proxyAssetUrl, proxyMicrolink, proxyOpenverse, proxyWallAudioSearch, proxyWallImageSearch } from './proxy.ts'
import { renderResponse } from './render.ts'
import { buildRssFeed } from './rss.ts'
import { handlePing, getStatsSummary } from './stats.ts'
import { subscribe, sseResponse, sendSnapshot, sendReaction } from './sse.ts'
import { buildWallliveDoc } from './walllive.ts'
import { fireWebhook } from './webhooks.ts'
import {
  createWidget,
  deleteWidget,
  getWidget,
  listOwnerWidgets,
  updateWidget,
} from './widgets.ts'

const kv = await Deno.openKv()
const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? 'dev-secret-change-me'
const FRONTEND_ORIGIN = Deno.env.get('FRONTEND_ORIGIN') ?? 'http://localhost:5173'
const PORT = Number(Deno.env.get('PORT') ?? 8000)

function authCookie(token: string) {
  const isLocal = FRONTEND_ORIGIN.includes('localhost') || FRONTEND_ORIGIN.includes('127.0.0.1')
  const secure = isLocal ? '' : ' Secure;'
  return `wall_token=${token}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${7 * 86400}`
}

const RESERVED = new Set([
  'admin', 'api', 'auth', 'edit', 'embed', 'u', 'w', 'login', 'signup', 'settings', 'local', 'widgets', 'docs',
])

type User = { id: string; username: string; passwordHash: string; email?: string; createdAt: string }

function cors(headers = new Headers()) {
  headers.set('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  return headers
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: cors(new Headers({ 'Content-Type': 'application/json' })),
  })
}

function bad(message: string, status = 400) {
  return json({ error: message }, status)
}

async function signToken(userId: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
  return await create({ alg: 'HS256', typ: 'JWT', exp: getNumericDate(60 * 60 * 24 * 7) }, { sub: userId }, key)
}

async function userFromRequest(req: Request): Promise<User | null> {
  const auth = req.headers.get('Authorization')
  const cookie = req.headers.get('Cookie') ?? ''
  const token =
    auth?.startsWith('Bearer ') ? auth.slice(7) : cookie.match(/wall_token=([^;]+)/)?.[1]
  if (!token) return null
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    )
    const payload = await verify(token, key)
    const userId = payload.sub as string
    const session = await kv.get(['sessions', token])
    if (!session.value) return null
    const usernameEntry = await kv.get<string>(['users-by-id', userId])
    if (!usernameEntry.value) return null
    const userEntry = await kv.get<User>(['users', usernameEntry.value])
    return userEntry.value ?? null
  } catch {
    return null
  }
}

function validUsername(username: string) {
  return /^[a-z0-9-]{3,24}$/.test(username) && !RESERVED.has(username)
}

async function handleSignup(body: { username?: string; password?: string; email?: string }) {
  const username = body.username?.toLowerCase().trim() ?? ''
  const password = body.password ?? ''
  if (!validUsername(username)) return bad('Invalid username')
  if (password.length < 10) return bad('Password too short')
  const existing = await kv.get(['users', username])
  if (existing.value) return bad('Username taken')
  const id = crypto.randomUUID()
  const passwordHash = await hash(password)
  const user: User = { id, username, passwordHash, email: body.email, createdAt: new Date().toISOString() }
  await kv.atomic()
    .set(['users', username], user)
    .set(['users-by-id', id], username)
    .set(['walls', username], {
      version: 1,
      id: username,
      title: `${username}'s Wall`,
      theme: 'corkboard',
      accent: '#ff6b35',
      width: 1600,
      height: 1000,
      elements: [],
      reactions: {},
      meta: { createdAt: user.createdAt, updatedAt: user.createdAt, ownerGithub: '', shareVersion: 1 },
    })
    .commit()
  const token = await signToken(id)
  await kv.set(['sessions', token], { userId: id, expiresAt: Date.now() + 7 * 864e5 })
  const headers = cors(new Headers({ 'Content-Type': 'application/json' }))
  headers.append('Set-Cookie', authCookie(token))
  return new Response(JSON.stringify({ user: { id, username, email: user.email }, token }), { status: 201, headers })
}

async function handleLogin(body: { username?: string; password?: string }) {
  const username = body.username?.toLowerCase().trim() ?? ''
  const entry = await kv.get<User>(['users', username])
  if (!entry.value) return bad('Invalid credentials', 401)
  const ok = await compare(body.password ?? '', entry.value.passwordHash)
  if (!ok) return bad('Invalid credentials', 401)
  const token = await signToken(entry.value.id)
  await kv.set(['sessions', token], { userId: entry.value.id, expiresAt: Date.now() + 7 * 864e5 })
  const headers = cors(new Headers({ 'Content-Type': 'application/json' }))
  headers.append('Set-Cookie', authCookie(token))
  return new Response(
    JSON.stringify({ user: { id: entry.value.id, username: entry.value.username, email: entry.value.email }, token }),
    { headers },
  )
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() })

  const url = new URL(req.url)
  const path = url.pathname

  if (req.method === 'GET' && path === '/asset-proxy') {
    const target = url.searchParams.get('url')
    if (!target) return bad('Missing url')
    return proxyAssetUrl(target, cors)
  }

  if (req.method === 'GET' && path.startsWith('/openverse-api')) {
    return proxyOpenverse(path.replace(/^\/openverse-api/, '') + url.search, cors)
  }

  const imgApi = path.match(/^\/wall-img-api\/(wikimedia|pixabay|pexels|unsplash)$/)
  if (req.method === 'GET' && imgApi) {
    return proxyWallImageSearch(imgApi[1], url.search, req, cors)
  }

  const audioApi = path.match(/^\/wall-audio-api\/(pixabay|freesound)$/)
  if (req.method === 'GET' && audioApi) {
    return proxyWallAudioSearch(audioApi[1], url.search, req, cors)
  }

  if (req.method === 'GET' && path.startsWith('/microlink-api')) {
    return proxyMicrolink(url.search, cors)
  }

  // Auth
  if (req.method === 'POST' && path === '/auth/signup') return handleSignup(await req.json())
  if (req.method === 'POST' && path === '/auth/login') return handleLogin(await req.json())
  if (req.method === 'GET' && path === '/auth/me') {
    const user = await userFromRequest(req)
    if (!user) return bad('Unauthorized', 401)
    return json({ user: { id: user.id, username: user.username, email: user.email } })
  }

  if (req.method === 'POST' && path === '/ai/chat') {
    const user = await userFromRequest(req)
    if (!user) return bad('Sign in to use Wall Agent', 401)
    const body = await req.json()
    const result = await handleAiChat(body)
    if (result.error) return bad(result.error, result.status ?? 500)
    return json(result.data)
  }

  // Widget extension routes (.png, .json, etc.)
  const widgetExt = path.match(/^\/w\/([a-z0-9-]+)(\.(png|svg|json))$/)
  if (widgetExt) {
    const widgetId = widgetExt[1]!
    const ext = widgetExt[2]!
    const widget = await getWidget(kv, widgetId)
    if (!widget || widget.visibility === 'private') return bad('Not found', 404)
    if (ext === 'json') return json(widget)
    return renderResponse(url, widget.name ?? widgetId, widget.widgetId, ext === 'svg' ? 'svg' : 'png')
  }

  const widgetWellKnown = path.match(/^\/w\/([a-z0-9-]+)\/\.well-known\/walllive$/)
  if (widgetWellKnown && req.method === 'GET') {
    const widgetId = widgetWellKnown[1]!
    const widget = await getWidget(kv, widgetId)
    if (!widget || widget.visibility === 'private') return bad('Not found', 404)
    return json(buildWallliveDoc({
      kind: 'widget',
      id: widgetId,
      title: widget.name,
      owner: widget.ownerUsername,
      updatedAt: widget.updatedAt,
      etag: `v${widget.shareVersion ?? 1}-${widget.updatedAt}`,
    }))
  }

  const widgetEvents = path.match(/^\/w\/([a-z0-9-]+)\/events$/)
  if (widgetEvents && req.method === 'GET') {
    const widgetId = widgetEvents[1]!
    const widget = await getWidget(kv, widgetId)
    if (!widget || widget.visibility === 'private') return bad('Not found', 404)
    const stream = subscribe('widget', widgetId)
    void sendSnapshot('widget', widgetId, widget)
    return sseResponse(stream, cors())
  }

  const widgetPing = path.match(/^\/w\/([a-z0-9-]+)\/ping$/)
  if (widgetPing && req.method === 'POST') {
    const widgetId = widgetPing[1]!
    const res = await handlePing(kv, 'widget', widgetId, await req.json(), req)
    res.headers.set('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
    return res
  }

  const widgetStats = path.match(/^\/w\/([a-z0-9-]+)\/stats$/)
  if (widgetStats && req.method === 'GET') {
    const widgetId = widgetStats[1]!
    const widget = await getWidget(kv, widgetId)
    if (!widget) return bad('Not found', 404)
    const user = await userFromRequest(req)
    if (!user || user.id !== widget.ownerId) return bad('Forbidden', 403)
    return json(await getStatsSummary(kv, 'widget', widgetId))
  }

  // Standalone widgets CRUD
  if (path === '/w' && req.method === 'POST') {
    const user = await userFromRequest(req)
    if (!user) return bad('Unauthorized', 401)
    const result = await createWidget(kv, user, await req.json())
    if (result.error) return bad(result.error, result.status ?? 400)
    return json(result.widget, 201)
  }

  const widgetBase = path.match(/^\/w\/([a-z0-9-]+)$/)
  if (widgetBase) {
    const widgetId = widgetBase[1]!
    if (req.method === 'GET') {
      const widget = await getWidget(kv, widgetId)
      if (!widget || widget.visibility === 'private') return bad('Not found', 404)
      return json(widget)
    }
    if (req.method === 'PUT') {
      const user = await userFromRequest(req)
      if (!user) return bad('Unauthorized', 401)
      const result = await updateWidget(kv, user, widgetId, await req.json())
      if (result.error) return bad(result.error, result.status ?? 400)
      await sendSnapshot('widget', widgetId, result.widget)
      return json(result.widget)
    }
    if (req.method === 'DELETE') {
      const user = await userFromRequest(req)
      if (!user) return bad('Unauthorized', 401)
      const result = await deleteWidget(kv, user, widgetId)
      if (result.error) return bad(result.error, result.status ?? 400)
      return json({ ok: true })
    }
  }

  if (req.method === 'GET' && path === '/w/mine') {
    const user = await userFromRequest(req)
    if (!user) return bad('Unauthorized', 401)
    return json(await listOwnerWidgets(kv, user.username))
  }

  // Wall routes
  const wallMatch = path.match(/^\/u\/([a-z0-9-]+)$/)
  if (wallMatch) {
    const username = wallMatch[1]!
    if (req.method === 'GET') {
      const wall = await kv.get(['walls', username])
      if (!wall.value) return bad('Not found', 404)
      return json(wall.value)
    }
    if (req.method === 'PUT') {
      const user = await userFromRequest(req)
      if (!user || user.username !== username) return bad('Forbidden', 403)
      const doc = await req.json()
      doc.meta = { ...doc.meta, updatedAt: new Date().toISOString() }
      await kv.set(['walls', username], doc)
      await sendSnapshot('wall', username, doc)
      void fireWebhook(kv, username, { title: doc.title, updatedAt: doc.meta.updatedAt })
      return json({ ok: true })
    }
  }

  const wallExt = path.match(/^\/u\/([a-z0-9-]+)(\.(png|svg|json))$/)
  if (wallExt) {
    const username = wallExt[1]!
    const ext = wallExt[2]!
    const wallEntry = await kv.get<Record<string, unknown>>(['walls', username])
    if (!wallEntry.value) return bad('Not found', 404)
    if (ext === 'json') return json(wallEntry.value)
    const title = String(wallEntry.value.title ?? `${username}'s Wall`)
    return renderResponse(url, title, `@${username}`, ext === 'svg' ? 'svg' : 'png')
  }

  const wallWellKnown = path.match(/^\/u\/([a-z0-9-]+)\/\.well-known\/walllive$/)
  if (wallWellKnown && req.method === 'GET') {
    const username = wallWellKnown[1]!
    const wallEntry = await kv.get<Record<string, unknown>>(['walls', username])
    if (!wallEntry.value) return bad('Not found', 404)
    const meta = wallEntry.value.meta as { updatedAt?: string; shareVersion?: number } | undefined
    return json(buildWallliveDoc({
      kind: 'wall',
      id: username,
      title: String(wallEntry.value.title ?? `${username}'s wall`),
      owner: username,
      updatedAt: meta?.updatedAt,
      etag: `v${meta?.shareVersion ?? 1}-${meta?.updatedAt ?? '0'}`,
    }))
  }

  const wallEvents = path.match(/^\/u\/([a-z0-9-]+)\/events$/)
  if (wallEvents && req.method === 'GET') {
    const username = wallEvents[1]!
    const wallEntry = await kv.get(['walls', username])
    const stream = subscribe('wall', username)
    if (wallEntry.value) void sendSnapshot('wall', username, wallEntry.value)
    return sseResponse(stream, cors())
  }

  const wallPing = path.match(/^\/u\/([a-z0-9-]+)\/ping$/)
  if (wallPing && req.method === 'POST') {
    const username = wallPing[1]!
    const res = await handlePing(kv, 'wall', username, await req.json(), req)
    res.headers.set('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
    return res
  }

  const wallFeed = path.match(/^\/u\/([a-z0-9-]+)\/feed\.xml$/)
  if (wallFeed && req.method === 'GET') {
    const username = wallFeed[1]!
    const wallEntry = await kv.get(['walls', username])
    if (!wallEntry.value) return bad('Not found', 404)
    return new Response(buildRssFeed(username, wallEntry.value as Parameters<typeof buildRssFeed>[1]), {
      headers: cors(new Headers({ 'Content-Type': 'application/rss+xml' })),
    })
  }

  const wallStats = path.match(/^\/u\/([a-z0-9-]+)\/stats$/)
  if (wallStats && req.method === 'GET') {
    const username = wallStats[1]!
    const user = await userFromRequest(req)
    if (!user || user.username !== username) return bad('Forbidden', 403)
    return json(await getStatsSummary(kv, 'wall', username))
  }

  const wallWebhook = path.match(/^\/u\/([a-z0-9-]+)\/webhook$/)
  if (wallWebhook && req.method === 'POST') {
    const username = wallWebhook[1]!
    const user = await userFromRequest(req)
    if (!user || user.username !== username) return bad('Forbidden', 403)
    const { url: webhookUrl } = await req.json()
    await kv.set(['webhooks', username], { url: webhookUrl, registeredAt: new Date().toISOString() })
    return json({ ok: true })
  }

  const wallReact = path.match(/^\/u\/([a-z0-9-]+)\/react$/)
  if (wallReact && req.method === 'POST') {
    const username = wallReact[1]!
    const { emoji } = await req.json()
    const key = ['reactions', username, emoji] as const
    const current = (await kv.get<number>(key)).value ?? 0
    const count = current + 1
    await kv.set(key, count)
    sendReaction('wall', username, emoji, count)
    return json({ count })
  }

  return bad('Not found', 404)
}

Deno.serve({ port: PORT }, handler)
console.log(`Wall API listening on http://localhost:${PORT}`)
