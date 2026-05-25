import { createEmptyCanvas } from '@/types/canvas'
import { saveCanvas } from '@/persist/db'
import { wallCanvasId } from '@/persist/constants'
import {
  createLocalSession,
  deleteLocalSession,
  findUserByUsername,
  getUserById,
  getValidSession,
  insertLocalUser,
} from '@/persist/auth-db'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { usernameValidationError } from '@/lib/auth/reserved'
import type { AuthBackend } from '@/lib/auth/types'

export const localAuth: AuthBackend = {
  async signup(username, password, email) {
    const name = username.toLowerCase().trim()
    const usernameErr = usernameValidationError(name)
    if (usernameErr) throw new Error(usernameErr)
    if (password.length < 10) throw new Error('Password must be at least 10 characters')

    const existing = await findUserByUsername(name)
    if (existing) throw new Error('Username is already taken')

    const { hash, salt } = await hashPassword(password)
    const id = crypto.randomUUID()
    await insertLocalUser({
      id,
      username: name,
      passwordHash: hash,
      passwordSalt: salt,
      email,
      createdAt: new Date().toISOString(),
    })

    const wall = createEmptyCanvas(wallCanvasId(name))
    wall.title = `${name}'s Wall`
    await saveCanvas(wall)

    const { token } = await createLocalSession(id)
    return { user: { id, username: name, email }, token }
  },

  async login(username, password) {
    const name = username.toLowerCase().trim()
    const record = await findUserByUsername(name)
    if (!record) throw new Error('Invalid username or password')

    const ok = await verifyPassword(password, record.passwordHash, record.passwordSalt)
    if (!ok) throw new Error('Invalid username or password')

    const { token } = await createLocalSession(record.id)
    return {
      user: { id: record.id, username: record.username, email: record.email },
      token,
    }
  },

  async me(token) {
    if (!token) return null
    const session = await getValidSession(token)
    if (!session) return null
    const user = await getUserById(session.userId)
    if (!user) return null
    return { id: user.id, username: user.username, email: user.email }
  },

  async logout(token) {
    if (token) await deleteLocalSession(token)
  },
}
