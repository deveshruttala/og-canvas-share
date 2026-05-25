/**
 * Dock + paste actions backed by the tldraw editor instance.
 */
import { createShapeId, toRichText, type Editor } from 'tldraw'
import {
  createStickyNoteShape,
  createTextBoxShape,
  setTextDisplayMode,
  updateTextTypography,
} from '@/editor/wall-text-actions'
import { startWallTextEditing } from '@/editor/wall-text-editing'
import {
  readWallTextBoxStyle,
  TEXT_STYLE_PRESETS,
  type WallTextBoxStyle,
} from '@/lib/wall-text-style'
import { AssetRecordType } from '@tldraw/tlschema'
import {
  getWallEditor,
  wallCenter,
  WALL_FRAME_ID,
  ZOOM_STEPS,
  zoomToWallPage,
} from '@/editor/wall-editor-api'
import {
  canTimelineRedo,
  canTimelineUndo,
  pushTimelineMark,
  timelineRedo,
  timelineUndo,
} from '@/editor/wall-timeline-history'
import { createWallLinkShape, wallHostGeoProps } from '@/editor/wall-host-shape'
import { detectLinkPlatform, getEmbedUrl } from '@/lib/link-resolver'
import { blobToDataUrl, compressImage, probeImageSize } from '@/lib/compress-image'
import { fetchExternalAssetAsDataUrl, isRemoteHttpUrl } from '@/lib/asset-proxy'
import { getSoundPadSize } from '@/lib/sound-pad-samples'
import { toJsonMeta } from '@/lib/json-meta'
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
  if (meta?.wallType === 'link') {
    const data = meta.wallData as { title?: string; url?: string }
    return data.title ?? data.url ?? 'Link'
  }
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
  if (meta?.wallType === 'link') return 'Link'
  if (shape.type === 'note') return 'Sticky note'
  if (shape.type === 'text') return 'Text box'
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
  addTextBox(text = 'Type here', x?: number, y?: number, style?: Partial<WallTextBoxStyle>) {
    const { x: px, y: py } = place(x, y)
    const editor = ed()
    const boxW = 320
    const id = createTextBoxShape(editor, {
      x: px - boxW / 2,
      y: py - 28,
      text,
      style,
    })
    editor.select(id)
    editor.setCurrentTool('select')
    requestAnimationFrame(() => {
      const bounds = editor.getShapePageBounds(id)
      if (bounds) {
        editor.centerOnPoint({ x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 })
      }
      startWallTextEditing(editor, id, { selectAll: true })
    })
    wallActions.markEditComplete('text')
  },

  /** @deprecated Use addTextBox — kept for explicit sticky notes */
  addSticky(
    text = 'Double-click to edit',
    color: 'yellow' | 'light-green' | 'light-blue' | 'light-violet' | 'light-red' | 'orange' = 'yellow',
    x?: number,
    y?: number,
  ) {
    const { x: px, y: py } = place(x, y)
    const editor = ed()
    const id = createStickyNoteShape(editor, { x: px, y: py, text, color })
    editor.select(id)
    editor.setCurrentTool('select')
    requestAnimationFrame(() => startWallTextEditing(editor, id, { selectAll: true }))
  },

  addTextBlock(text = 'Heading', size: 's' | 'm' | 'l' | 'xl' = 'l', x?: number, y?: number) {
    wallActions.addTextBox(text, x, y, { size, font: 'sans' })
  },

  setTextBoxDisplayMode(shapeId: string, mode: WallTextBoxStyle['mode'], extras?: Partial<WallTextBoxStyle>) {
    return setTextDisplayMode(ed(), shapeId, mode, extras)
  },

  updateTextBoxTypography(
    shapeIds: string[],
    patch: Parameters<typeof updateTextTypography>[2],
  ) {
    updateTextTypography(ed(), shapeIds, patch)
  },

  applyTextStylePreset(shapeIds: string[], presetId: string) {
    const preset = TEXT_STYLE_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    const { mode, cardBg, stickyColor, ...typography } = preset.style
    updateTextTypography(ed(), shapeIds, typography)
    if (mode) {
      for (const id of shapeIds) {
        setTextDisplayMode(ed(), id, mode, preset.style)
      }
      return
    }
    if (cardBg || stickyColor) {
      const editor = ed()
      editor.run(() => {
        for (const id of shapeIds) {
          const shape = editor.getShape(id as never)
          if (!shape) continue
          editor.updateShape({
            id: shape.id,
            type: shape.type,
            meta: toJsonMeta({
              ...(shape.meta as Record<string, unknown>),
              wallTextBox: {
                ...readWallTextBoxStyle(shape.meta as Record<string, unknown>),
                ...(cardBg ? { cardBg } : {}),
                ...(stickyColor ? { stickyColor } : {}),
              },
            }),
          })
        }
      })
    }
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
    void wallActions.addGifAt(url, x, y)
  },

  addEmoji(emoji: string, x?: number, y?: number, linkTo?: LinkTo) {
    const { x: px, y: py } = place(x, y)
    ed().createShape({
      id: createShapeId(),
      type: 'text',
      x: px,
      y: py,
      meta: linkTo ? toJsonMeta({ linkTo }) : {},
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

  async addLink(
    url: string,
    x?: number,
    y?: number,
    hints?: { title?: string; description?: string; image?: string },
  ) {
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

    await createWallLinkShape(ed(), normalized, { x: px, y: py }, hints)
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
      opacity: 0.001,
      props: wallHostGeoProps(320, 120),
      meta: toJsonMeta({ wallType: 'audio', wallData: { src, title: title ?? file.name } }),
    })
  },

  async addQr(url: string, x?: number, y?: number) {
    const { x: px, y: py } = place(x, y)
    const size = 180
    ed().createShape({
      id: createShapeId(),
      type: 'geo',
      x: px - size / 2,
      y: py - size / 2,
      opacity: 0.001,
      props: wallHostGeoProps(size, size),
      meta: toJsonMeta({ wallType: 'qr', wallData: { url } }),
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
      opacity: 0.001,
      props: wallHostGeoProps(w, h),
      meta: toJsonMeta({ wallType: 'widget', wallData: { type, ...extra } }),
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
    zoomToWallPage(ed(), { animate: true })
  },

  resetZoom() {
    wallActions.zoomTo(1)
  },

  async pasteUrl(url: string) {
    await wallActions.addLink(url)
  },

  async pasteText(text: string) {
    wallActions.addTextBox(text.slice(0, 2000))
  },

  async pasteImageFile(file: File) {
    await wallActions.addImageFromFile(file)
  },

  undo() {
    timelineUndo(ed())
  },

  redo() {
    timelineRedo(ed())
  },

  canUndo() {
    return canTimelineUndo(getWallEditor())
  },

  canRedo() {
    return canTimelineRedo(getWallEditor())
  },

  /** Record a timeline step after programmatic canvas changes (widgets, text, etc.). */
  markEditComplete(label = 'wall-action') {
    const editor = getWallEditor()
    if (editor) pushTimelineMark(editor, label)
  },

  addEmbed(url: string) {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`
    const platform = detectLinkPlatform(normalized)
    const embedUrl = getEmbedUrl(normalized, platform)
    const { x, y } = place()

    if (embedUrl && ['youtube', 'spotify', 'vimeo', 'soundcloud'].includes(platform)) {
      ed().createShape({
        id: createShapeId(),
        type: 'embed',
        x: x - 250,
        y: y - 150,
        props: { w: 500, h: 300, url: embedUrl },
      })
      return
    }

    void wallActions.addLink(normalized, x, y)
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
        const bounds = editor.getShapePageBounds(shape.id)
        const w = bounds?.w ?? 280
        const h = bounds?.h ?? 200
        const cellW = Math.max(colWidth, w + padding)
        const cellH = Math.max(rowHeight, h + padding)
        const x = startX + col * cellW
        const y = startY + row * cellH
        editor.updateShape({
          id: shape.id,
          type: shape.type,
          x,
          y,
          rotation: 0,
        })
      })
    })
    zoomToWallPage(editor)
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

  async addGifAt(url: string, x?: number, y?: number) {
    const { x: px, y: py } = place(x, y)
    let src = url
    const mimeType = 'image/gif'
    if (isRemoteHttpUrl(url)) {
      try {
        src = await fetchExternalAssetAsDataUrl(url)
      } catch {
        src = url
      }
    }
    let w = 400
    let h = 300
    try {
      const dims = await probeImageSize(src)
      w = dims.w
      h = dims.h
    } catch {
      /* defaults */
    }
    const assetId = AssetRecordType.createId()
    ed().createAssets([
      {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: { name: 'gif', src, w, h, mimeType, isAnimated: true },
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
    const trimmed = url.trim()
    if (!trimmed) throw new Error('Image URL is empty')

    const { x: px, y: py } = place(x, y)
    let w = 800
    let h = 600
    let src = trimmed
    let mimeType = 'image/jpeg'

    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
      try {
        const dims = await probeImageSize(trimmed)
        w = dims.w
        h = dims.h
        if (trimmed.startsWith('data:')) {
          mimeType = trimmed.slice(5, trimmed.indexOf(';')) || mimeType
        }
      } catch {
        /* keep defaults */
      }
    } else if (isRemoteHttpUrl(trimmed)) {
      try {
        src = await fetchExternalAssetAsDataUrl(trimmed)
        const dims = await probeImageSize(src)
        w = dims.w
        h = dims.h
        mimeType =
          src.startsWith('data:image/png') ? 'image/png'
          : src.startsWith('data:image/webp') ? 'image/webp'
          : src.startsWith('data:image/gif') ? 'image/gif'
          : 'image/jpeg'
      } catch {
        throw new Error('Could not load image from URL — try another source or paste a direct image link')
      }
    } else {
      throw new Error('Enter a valid image URL')
    }

    const assetId = AssetRecordType.createId()
    ed().createAssets([
      {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: { name: 'image', src, w, h, mimeType, isAnimated: false },
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
      opacity: 0.001,
      props: wallHostGeoProps(320, 140),
      meta: toJsonMeta({ wallType: 'progress', wallData: { title, current, max, color } }),
    })
  },

  addSoundPad(
    data: {
      label?: string
      sound?: string
      frequency?: number
      wave?: 'sine' | 'square' | 'sawtooth' | 'triangle'
    } = {},
    x?: number,
    y?: number,
  ) {
    const size = getSoundPadSize(data)
    const { x: px, y: py } = place(x, y)
    ed().createShape({
      id: createShapeId(),
      type: 'geo',
      x: px - size.w / 2,
      y: py - size.h / 2,
      opacity: 0.001,
      props: wallHostGeoProps(size.w, size.h),
      meta: toJsonMeta({ wallType: 'soundpad', wallData: data }),
    })
  },

  async addPolaroid(src: string, caption = 'Write a caption…', x?: number, y?: number) {
    const { x: px, y: py } = place(x, y)
    ed().createShape({
      id: createShapeId(),
      type: 'geo',
      x: px - 110,
      y: py - 140,
      opacity: 0.001,
      props: wallHostGeoProps(220, 280),
      meta: toJsonMeta({ wallType: 'polaroid', wallData: { src, caption } }),
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
    zoomToWallPage(ed(), { animate: true })
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
      opacity: 0.001,
      props: wallHostGeoProps(320, 120),
      meta: toJsonMeta({
        wallType: 'audio',
        wallData: {
          src: data.src,
          title: data.title ?? 'Track',
          artist: data.artist,
          cover: data.cover,
          badge: data.badge ?? 'Audio',
        },
      }),
    })
  },

  insertCatalogWidget(widget: CatalogWidget, x?: number, y?: number) {
    const cfg = widget.config ?? {}
    const str = (k: string, fallback = '') => String(cfg[k] ?? fallback)
    const num = (k: string, fallback: number) => Number(cfg[k] ?? fallback)

    switch (widget.template) {
      case 'clock':
        wallActions.addWidget(
          'clock',
          {
            location: str('location', widget.name),
            label: widget.name,
            timezone: str('timezone', ''),
          },
          x,
          y,
        )
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
      case 'soundpad': {
        const sound = str('sound', '')
        wallActions.addSoundPad(
          sound
            ? { label: str('label', widget.name), sound }
            : {
                label: str('label', widget.name),
                frequency: num('frequency', 440),
                wave: (str('wave', 'sine') as 'sine' | 'square' | 'sawtooth' | 'triangle') || 'sine',
              },
          x,
          y,
        )
        break
      }
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
    wallActions.markEditComplete('widget')
  },

  setShapeLinkTo(shapeId: string, linkTo: LinkTo | null) {
    const editor = ed()
    const shape = editor.getShape(shapeId as never)
    if (!shape) return
    const next = { ...(shape.meta as Record<string, unknown>) }
    if (linkTo) next.linkTo = linkTo
    else delete next.linkTo
    editor.updateShape({ id: shape.id, type: shape.type, meta: toJsonMeta(next) })
  },

  setSelectionLink(url: string, label?: string) {
    const editor = ed()
    const ids = editor.getSelectedShapeIds().filter((id) => id !== WALL_FRAME_ID)
    for (const id of ids) {
      wallActions.setShapeLinkTo(id, { url, label, openInNewTab: true })
    }
  },
}
