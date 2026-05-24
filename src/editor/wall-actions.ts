/**
 * Dock + paste actions backed by the tldraw editor instance.
 */
import { createEmptyBookmarkShape, createShapeId, toRichText, type Editor } from 'tldraw'
import { AssetRecordType } from '@tldraw/tlschema'
import { getWallEditor, wallCenter, WALL_FRAME_ID, ZOOM_STEPS } from '@/editor/wall-editor-api'
import { detectLinkPlatform, getEmbedUrl } from '@/lib/link-resolver'
import { blobToDataUrl, compressImage } from '@/lib/compress-image'
import QRCode from 'qrcode'
import type { CatalogWidget } from '@/widgets/catalog'

export type LinkTo = {
  url: string
  label?: string
  openInNewTab?: boolean
}

function ed(): Editor {
  const editor = getWallEditor()
  if (!editor) throw new Error('Editor not ready')
  return editor
}

function place(x?: number, y?: number) {
  if (x != null && y != null) return { x, y }
  const c = wallCenter(ed())
  return { x: c.x - 120, y: c.y - 80 }
}

function isWallShape(shape: { id: string; meta?: Record<string, unknown> }) {
  return shape.id !== WALL_FRAME_ID && !shape.meta?.wallFrame
}

export type WallSearchItem = {
  id: string
  label: string
  type: string
  category: 'element' | 'action'
}

type WallShapeLike = {
  type: string
  props: object
  meta?: Record<string, unknown>
}

function shapeUrl(props: Record<string, unknown>): string {
  const u = props.url
  if (typeof u === 'string' && u.length > 0) return u
  return 'Link'
}

function shapeLabel(shape: WallShapeLike): string {
  const props = shape.props as Record<string, unknown>
  const rt = props.richText as { content?: Array<{ content?: Array<{ text?: string }> }> } | undefined
  if (rt?.content) {
    const text = rt.content
      .flatMap((block) => block.content?.map((n) => n.text ?? '') ?? [])
      .join('')
      .trim()
    if (text) return text.slice(0, 60)
  }
  const meta = shape.meta
  if (meta?.wallType === 'widget') {
    const data = meta.wallData as { type?: string; label?: string; repo?: string }
    return `${data.type ?? 'widget'}${data.label ? `: ${data.label}` : ''}${data.repo ? `: ${data.repo}` : ''}`
  }
  if (meta?.wallType === 'audio') {
    const data = meta.wallData as { title?: string }
    return data.title ?? 'Audio'
  }
  if (meta?.wallType === 'progress') {
    const data = meta.wallData as { title?: string }
    return data.title ?? 'Progress'
  }
  if (meta?.wallType === 'soundpad') {
    const data = meta.wallData as { label?: string }
    return data.label ?? 'Sound Pad'
  }
  if (meta?.wallType === 'polaroid') {
    const data = meta.wallData as { caption?: string }
    return data.caption ?? 'Polaroid'
  }
  if (meta?.wallType === 'qr') return 'QR code'
  if (shape.type === 'embed' || shape.type === 'bookmark') return shapeUrl(props)
  if (shape.type === 'image') return String(props.altText ?? 'Image')
  if (shape.type === 'note') return 'Sticky note'
  if (shape.type === 'draw') return 'Drawing'
  return shape.type
}

/** Human-readable element kind for the inspector chip */
export function getWallShapeKind(shape: WallShapeLike): string {
  const meta = shape.meta
  if (meta?.wallType === 'widget') {
    const t = (meta.wallData as { type?: string })?.type
    if (t === 'clock') return 'Clock Widget'
    if (t === 'weather') return 'Weather Widget'
    if (t === 'spotify') return 'Spotify Widget'
    if (t === 'github') return 'GitHub Widget'
    return 'Widget'
  }
  if (meta?.wallType === 'audio') return 'Audio'
  if (meta?.wallType === 'qr') return 'QR Code'
  if (meta?.wallType === 'progress') return 'Progress'
  if (meta?.wallType === 'soundpad') return 'Sound Pad'
  if (meta?.wallType === 'polaroid') return 'Polaroid'
  if (shape.type === 'note') return 'Sticky Note'
  if (shape.type === 'text') return 'Text'
  if (shape.type === 'image') return 'Image'
  if (shape.type === 'embed') return 'Embed'
  if (shape.type === 'bookmark') return 'Link'
  if (shape.type === 'draw') return 'Drawing'
  if (shape.type === 'geo') return 'Shape'
  return 'Element'
}

export function getWallShapeLabel(shape: WallShapeLike): string {
  return shapeLabel(shape)
}

export const wallActions = {
  addSticky(text = 'Double-click to edit', color: 'yellow' | 'light-green' | 'light-blue' | 'light-violet' | 'light-red' | 'orange' = 'yellow', x?: number, y?: number) {
    const { x: px, y: py } = place(x, y)
    ed().createShape({
      id: createShapeId(),
      type: 'note',
      x: px,
      y: py,
      rotation: ((Math.random() * 4 - 2) * Math.PI) / 180,
      props: {
        color,
        size: 'm',
        richText: toRichText(text),
        align: 'middle',
        verticalAlign: 'middle',
        font: 'draw',
        fontSizeAdjustment: 0,
        growY: 0,
        url: '',
        scale: 1,
      },
    })
    ed().setCurrentTool('select')
  },

  addTextBlock(text = 'Heading', size: 's' | 'm' | 'l' | 'xl' = 'l', x?: number, y?: number) {
    const { x: px, y: py } = place(x, y)
    ed().createShape({
      id: createShapeId(),
      type: 'text',
      x: px,
      y: py,
      props: {
        richText: toRichText(text),
        color: 'black',
        size,
        font: 'sans',
        textAlign: 'start',
        autoSize: true,
        w: 280,
        scale: 1,
      },
    })
  },

  async addImageFromFile(file: File) {
    const blob = await compressImage(file)
    const src = await blobToDataUrl(blob)
    const { x, y } = place()
    const assetId = AssetRecordType.createId()
    ed().createAssets([
      {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: {
          name: file.name,
          src,
          w: 800,
          h: 600,
          mimeType: file.type,
          isAnimated: file.type === 'image/gif',
        },
        meta: {},
      },
    ])
    ed().createShape({
      id: createShapeId(),
      type: 'image',
      x: x - 140,
      y: y - 100,
      props: { assetId, w: 280, h: 200, playing: true, url: '', crop: null, flipX: false, flipY: false, altText: file.name },
    })
  },

  addGif(url: string) {
    const { x, y } = place()
    const assetId = AssetRecordType.createId()
    ed().createAssets([
      {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: { name: 'gif', src: url, w: 400, h: 300, mimeType: 'image/gif', isAnimated: true },
        meta: {},
      },
    ])
    ed().createShape({
      id: createShapeId(),
      type: 'image',
      x: x - 160,
      y: y - 120,
      props: { assetId, w: 320, h: 240, playing: true, url: '', crop: null, flipX: false, flipY: false, altText: 'GIF' },
    })
  },

  addEmoji(emoji: string, x?: number, y?: number, linkTo?: LinkTo) {
    const { x: px, y: py } = place(x, y)
    ed().createShape({
      id: createShapeId(),
      type: 'text',
      x: px,
      y: py,
      meta: linkTo ? { linkTo } : {},
      props: {
        richText: toRichText(emoji),
        color: 'black',
        size: 'xl',
        font: 'sans',
        textAlign: 'middle',
        autoSize: true,
        w: 96,
        scale: 2.5,
      },
    })
  },

  addEmojiAt(emoji: string, x?: number, y?: number) {
    wallActions.addEmoji(emoji, x, y)
  },

  addIcon(label: string) {
    const { x, y } = place()
    ed().createShape({
      id: createShapeId(),
      type: 'geo',
      x,
      y,
      props: {
        geo: 'rectangle',
        w: 72,
        h: 72,
        dash: 'draw',
        color: 'light-blue',
        fill: 'semi',
        size: 'm',
        font: 'sans',
        align: 'middle',
        verticalAlign: 'middle',
        growY: 0,
        url: '',
        scale: 1,
        richText: toRichText(label),
      },
    })
  },

  async addLink(url: string, x?: number, y?: number) {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`
    const platform = detectLinkPlatform(normalized)
    const embedUrl = getEmbedUrl(normalized, platform)
    const { x: px, y: py } = place(x, y)

    if (embedUrl && ['youtube', 'spotify', 'vimeo', 'soundcloud'].includes(platform)) {
      ed().createShape({
        id: createShapeId(),
        type: 'embed',
        x: px - 200,
        y: py - 120,
        props: {
          w: platform === 'spotify' ? 400 : 480,
          h: platform === 'spotify' ? 152 : 270,
          url: embedUrl,
        },
      })
      return
    }

    createEmptyBookmarkShape(ed(), normalized, { x: px, y: py })
  },

  async addLinkAt(url: string, x?: number, y?: number) {
    return wallActions.addLink(url, x, y)
  },

  async addAudioFromFile(file: File, title?: string) {
    const src = await blobToDataUrl(file)
    const { x, y } = place()
    ed().createShape({
      id: createShapeId(),
      type: 'geo',
      x: x - 160,
      y: y - 60,
      props: {
        geo: 'rectangle',
        w: 320,
        h: 120,
        dash: 'draw',
        color: 'black',
        fill: 'solid',
        size: 's',
        font: 'sans',
        align: 'start',
        verticalAlign: 'start',
        growY: 0,
        url: '',
        scale: 1,
        richText: toRichText(title ?? file.name.replace(/\.[^.]+$/, '')),
      },
      meta: { wallType: 'audio', wallData: { src, title: title ?? file.name } },
    })
  },

  async addQr(url: string, x?: number, y?: number) {
    const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 256 })
    const { x: px, y: py } = place(x, y)
    ed().createShape({
      id: createShapeId(),
      type: 'geo',
      x: px - 90,
      y: py - 100,
      props: {
        geo: 'rectangle',
        w: 180,
        h: 200,
        dash: 'draw',
        color: 'white',
        fill: 'solid',
        size: 's',
        font: 'mono',
        align: 'middle',
        verticalAlign: 'middle',
        growY: 0,
        url: '',
        scale: 1,
        richText: toRichText(''),
      },
      meta: { wallType: 'qr', wallData: { url, dataUrl } },
    })
  },

  async addQrAt(url: string, x?: number, y?: number) {
    return wallActions.addQr(url, x, y)
  },

  addWidget(type: 'clock' | 'weather' | 'spotify' | 'github', extra?: Record<string, string>, x?: number, y?: number) {
    const { x: px, y: py } = place(x, y)
    const sizes = { clock: [280, 140], weather: [300, 160], spotify: [360, 200], github: [380, 240] } as const
    const [w, h] = sizes[type]
    ed().createShape({
      id: createShapeId(),
      type: 'geo',
      x: px - w / 2,
      y: py - h / 2,
      props: {
        geo: 'rectangle',
        w,
        h,
        dash: 'draw',
        color: 'black',
        fill: 'solid',
        size: 's',
        font: 'sans',
        align: 'start',
        verticalAlign: 'start',
        growY: 0,
        url: '',
        scale: 1,
        richText: toRichText(''),
      },
      meta: { wallType: 'widget', wallData: { type, ...extra } },
    })
  },

  addWidgetAt(type: 'clock' | 'weather' | 'spotify' | 'github', x?: number, y?: number) {
    wallActions.addWidget(type, undefined, x, y)
  },

  setDrawTool() {
    ed().setCurrentTool('draw')
  },

  setSelectTool() {
    ed().setCurrentTool('select')
  },

  zoomIn() {
    ed().zoomIn()
  },

  zoomOut() {
    ed().zoomOut()
  },

  zoomTo(step: number) {
    const editor = ed()
    const cx = editor.getViewportScreenCenter().x
    const cy = editor.getViewportScreenCenter().y
    editor.setCamera({ ...editor.getCamera(), z: step }, { immediate: false })
    editor.centerOnPoint({ x: cx, y: cy })
  },

  zoomToPreset(index: number) {
    const step = ZOOM_STEPS[Math.max(0, Math.min(ZOOM_STEPS.length - 1, index))]
    wallActions.zoomTo(step)
  },

  fitWall() {
    ed().zoomToFit({ animation: { duration: 300 } })
  },

  resetZoom() {
    wallActions.zoomTo(1)
  },

  async pasteUrl(url: string) {
    await wallActions.addLink(url)
  },

  async pasteText(text: string) {
    wallActions.addSticky(text.slice(0, 2000))
  },

  async pasteImageFile(file: File) {
    await wallActions.addImageFromFile(file)
  },

  undo() {
    ed().undo()
  },

  redo() {
    ed().redo()
  },

  canUndo() {
    try {
      return ed().getCanUndo()
    } catch {
      return false
    }
  },

  canRedo() {
    try {
      return ed().getCanRedo()
    } catch {
      return false
    }
  },

  addEmbed(url: string) {
    const { x, y } = place()
    ed().createShape({
      id: createShapeId(),
      type: 'embed',
      x: x - 250,
      y: y - 150,
      props: { w: 500, h: 300, url },
    })
  },

  autoArrange() {
    const editor = ed()
    const shapes = editor.getCurrentPageShapes().filter(isWallShape)
    if (shapes.length === 0) return

    const startX = 80
    const startY = 120
    const padding = 40
    const colWidth = 460
    const rowHeight = 260

    editor.run(() => {
      shapes.forEach((shape, idx) => {
        const col = idx % 3
        const row = Math.floor(idx / 3)
        editor.updateShape({
          id: shape.id,
          type: shape.type,
          x: startX + col * (colWidth + padding),
          y: startY + row * (rowHeight + padding),
          rotation: ((idx % 2 === 0 ? 1 : -1) * (1 + (idx % 3)) * Math.PI) / 180,
        })
      })
    })
    editor.zoomToFit({ animation: { duration: 300 } })
  },

  focusShape(id: string) {
    const editor = ed()
    editor.select(id as never)
    const bounds = editor.getShapePageBounds(id as never)
    if (bounds) {
      editor.zoomToBounds(bounds, { animation: { duration: 250 }, inset: 80 })
    }
  },

  listSearchItems(): WallSearchItem[] {
    try {
      const editor = ed()
      return editor
        .getCurrentPageShapes()
        .filter(isWallShape)
        .map((shape) => ({
          id: shape.id,
          label: shapeLabel(shape as never),
          type: shape.type,
          category: 'element' as const,
        }))
    } catch {
      return []
    }
  },

  addGifAt(url: string, x?: number, y?: number) {
    const { x: px, y: py } = place(x, y)
    const assetId = AssetRecordType.createId()
    ed().createAssets([
      {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: { name: 'gif', src: url, w: 400, h: 300, mimeType: 'image/gif', isAnimated: true },
        meta: {},
      },
    ])
    ed().createShape({
      id: createShapeId(),
      type: 'image',
      x: px - 160,
      y: py - 120,
      props: { assetId, w: 320, h: 240, playing: true, url: '', crop: null, flipX: false, flipY: false, altText: 'GIF' },
    })
  },

  async addImageFromUrl(url: string, x?: number, y?: number, attribution?: string) {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Could not fetch image URL')
    const blob = await res.blob()
    const { x: px, y: py } = place(x, y)
    const src = await blobToDataUrl(blob)
    const assetId = AssetRecordType.createId()
    ed().createAssets([
      {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: { name: 'image', src, w: 800, h: 600, mimeType: blob.type, isAnimated: false },
        meta: {},
      },
    ])
    ed().createShape({
      id: createShapeId(),
      type: 'image',
      x: px - 140,
      y: py - 100,
      meta: attribution ? { imageAttribution: attribution } : {},
      props: { assetId, w: 280, h: 200, playing: true, url: '', crop: null, flipX: false, flipY: false, altText: 'Image' },
    })
  },

  clearWall() {
    const editor = ed()
    const ids = editor.getCurrentPageShapes().filter(isWallShape).map((s) => s.id)
    if (ids.length) editor.deleteShapes(ids)
  },

  addProgress(title = 'My Goal', current = 42, max = 100, color = '#beee1d', x?: number, y?: number) {
    const { x: px, y: py } = place(x, y)
    ed().createShape({
      id: createShapeId(),
      type: 'geo',
      x: px - 160,
      y: py - 70,
      props: {
        geo: 'rectangle',
        w: 320,
        h: 140,
        dash: 'draw',
        color: 'black',
        fill: 'solid',
        size: 's',
        font: 'sans',
        align: 'start',
        verticalAlign: 'start',
        growY: 0,
        url: '',
        scale: 1,
        richText: toRichText(''),
      },
      meta: { wallType: 'progress', wallData: { title, current, max, color } },
    })
  },

  addSoundPad(label = 'Synth Pad', frequency = 440, wave: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine', x?: number, y?: number) {
    const { x: px, y: py } = place(x, y)
    ed().createShape({
      id: createShapeId(),
      type: 'geo',
      x: px - 120,
      y: py - 90,
      props: {
        geo: 'rectangle',
        w: 240,
        h: 180,
        dash: 'draw',
        color: 'black',
        fill: 'solid',
        size: 's',
        font: 'sans',
        align: 'start',
        verticalAlign: 'start',
        growY: 0,
        url: '',
        scale: 1,
        richText: toRichText(''),
      },
      meta: { wallType: 'soundpad', wallData: { label, frequency, wave } },
    })
  },

  async addPolaroid(src: string, caption = 'Write a caption…', x?: number, y?: number) {
    const { x: px, y: py } = place(x, y)
    ed().createShape({
      id: createShapeId(),
      type: 'geo',
      x: px - 110,
      y: py - 140,
      props: {
        geo: 'rectangle',
        w: 220,
        h: 280,
        dash: 'draw',
        color: 'white',
        fill: 'solid',
        size: 's',
        font: 'sans',
        align: 'start',
        verticalAlign: 'start',
        growY: 0,
        url: '',
        scale: 1,
        richText: toRichText(''),
      },
      meta: { wallType: 'polaroid', wallData: { src, caption } },
    })
  },

  async convertSelectionToPolaroid() {
    const editor = ed()
    const selected = editor.getSelectedShapes().filter((s) => s.type === 'image')
    if (selected.length === 0) throw new Error('Select an image first')
    const img = selected[0]!
    const assetId = (img.props as { assetId?: string }).assetId
    let src = ''
    if (assetId) {
      const asset = editor.getAsset(assetId as never) as { props?: { src?: string } } | undefined
      src = asset?.props?.src ?? ''
    }
    if (!src) throw new Error('Could not read image')
    editor.deleteShapes([img.id])
    await wallActions.addPolaroid(src, 'Write a caption…', img.x, img.y)
  },

  deleteSelected() {
    const editor = ed()
    const ids = editor.getSelectedShapeIds().filter((id) => id !== WALL_FRAME_ID)
    if (ids.length) editor.deleteShapes(ids)
  },

  resetPan() {
    ed().zoomToFit({ animation: { duration: 300 } })
  },

  async addStreamingAudio(
    data: { src: string; title?: string; artist?: string; cover?: string; badge?: string },
    x?: number,
    y?: number,
  ) {
    const { x: px, y: py } = place(x, y)
    ed().createShape({
      id: createShapeId(),
      type: 'geo',
      x: px - 160,
      y: py - 60,
      props: {
        geo: 'rectangle',
        w: 320,
        h: 120,
        dash: 'draw',
        color: 'black',
        fill: 'solid',
        size: 's',
        font: 'sans',
        align: 'start',
        verticalAlign: 'start',
        growY: 0,
        url: '',
        scale: 1,
        richText: toRichText(data.title ?? 'Audio'),
      },
      meta: {
        wallType: 'audio',
        wallData: {
          src: data.src,
          title: data.title ?? 'Track',
          artist: data.artist,
          cover: data.cover,
          badge: data.badge ?? 'Audio',
        },
      },
    })
  },

  insertCatalogWidget(widget: CatalogWidget, x?: number, y?: number) {
    const cfg = widget.config ?? {}
    const str = (k: string, fallback = '') => String(cfg[k] ?? fallback)
    const num = (k: string, fallback: number) => Number(cfg[k] ?? fallback)

    switch (widget.template) {
      case 'clock':
        wallActions.addWidget('clock', { location: str('location', widget.name), label: widget.name }, x, y)
        break
      case 'weather':
        wallActions.addWidget('weather', { location: str('location', 'Your City') }, x, y)
        break
      case 'spotify':
        wallActions.addWidget('spotify', { label: str('label', widget.name) }, x, y)
        break
      case 'github':
        wallActions.addWidget('github', { repo: str('repo', 'user/repo') }, x, y)
        break
      case 'progress':
        wallActions.addProgress(str('title', widget.name), num('current', 42), num('max', 100), str('color', '#beee1d'), x, y)
        break
      case 'soundpad':
        wallActions.addSoundPad(
          str('label', widget.name),
          num('frequency', 440),
          (str('wave', 'sine') as 'sine' | 'square' | 'sawtooth' | 'triangle') || 'sine',
          x,
          y,
        )
        break
      case 'qr':
        void wallActions.addQr(str('url', 'https://example.com'), x, y)
        break
      case 'link':
        void wallActions.addLink(str('url', 'https://example.com'), x, y)
        break
      case 'emoji': {
        const linkUrl = str('linkUrl')
        wallActions.addEmoji(
          str('emoji', widget.icon || '🔗'),
          x,
          y,
          linkUrl ? { url: linkUrl, label: widget.name, openInNewTab: true } : undefined,
        )
        break
      }
      case 'polaroid':
        void wallActions.addPolaroid(str('src', ''), str('caption', widget.name), x, y)
        break
      case 'sticky':
        wallActions.addSticky(str('text', widget.name), 'yellow', x, y)
        break
      default:
        wallActions.addSticky(widget.name, 'light-green', x, y)
    }
  },

  setShapeLinkTo(shapeId: string, linkTo: LinkTo | null) {
    const editor = ed()
    const shape = editor.getShape(shapeId as never)
    if (!shape) return
    const meta = { ...shape.meta }
    if (linkTo) meta.linkTo = linkTo
    else delete meta.linkTo
    editor.updateShape({ id: shape.id, type: shape.type, meta: meta as typeof shape.meta })
  },

  setSelectionLink(url: string, label?: string) {
    const editor = ed()
    const ids = editor.getSelectedShapeIds().filter((id) => id !== WALL_FRAME_ID)
    for (const id of ids) {
      wallActions.setShapeLinkTo(id, { url, label, openInNewTab: true })
    }
  },
}
