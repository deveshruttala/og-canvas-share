import { createShapeId, toRichText, type Editor } from 'tldraw'
import type { TLNoteShape, TLTextShape } from '@tldraw/tlschema'
import {
  DEFAULT_TEXT_BOX_STYLE,
  type WallStickyColor,
  type WallTextBoxStyle,
  type WallTextColor,
  type WallTextDisplayMode,
  type WallTextFont,
  type WallTextSize,
  readWallTextBoxStyle,
} from '@/lib/wall-text-style'

function richTextFromShape(props: { richText?: unknown }): ReturnType<typeof toRichText> {
  const rt = props.richText
  if (rt && typeof rt === 'object') return rt as ReturnType<typeof toRichText>
  return toRichText('')
}

export function createTextBoxShape(
  editor: Editor,
  opts: {
    id?: ReturnType<typeof createShapeId>
    x: number
    y: number
    text?: string
    style?: Partial<WallTextBoxStyle>
    rotation?: number
  },
) {
  const style = { ...DEFAULT_TEXT_BOX_STYLE, ...opts.style }
  const id = opts.id ?? createShapeId()
  editor.createShape({
    id,
    type: 'text',
    x: opts.x,
    y: opts.y,
    rotation: opts.rotation ?? 0,
    props: {
      richText: toRichText(opts.text ?? 'Type here'),
      color: style.color,
      size: style.size,
      font: style.font,
      textAlign: 'start',
      autoSize: true,
      w: 320,
      scale: 1,
    },
    meta: { wallTextBox: style },
  })
  return id
}

export function createStickyNoteShape(
  editor: Editor,
  opts: {
    id?: ReturnType<typeof createShapeId>
    x: number
    y: number
    text?: string
    color?: WallStickyColor
    rotation?: number
    style?: Partial<WallTextBoxStyle>
  },
) {
  const stickyColor = opts.color ?? 'yellow'
  const id = opts.id ?? createShapeId()
  editor.createShape({
    id,
    type: 'note',
    x: opts.x,
    y: opts.y,
    rotation: opts.rotation ?? ((Math.random() * 4 - 2) * Math.PI) / 180,
    props: {
      color: stickyColor,
      size: 'm',
      richText: toRichText(opts.text ?? 'Double-click to edit'),
      align: 'middle',
      verticalAlign: 'middle',
      font: 'draw',
      fontSizeAdjustment: 0,
      growY: 0,
      url: '',
      scale: 1,
    },
    meta: {
      wallTextBox: { ...DEFAULT_TEXT_BOX_STYLE, mode: 'sticky', stickyColor, ...opts.style },
    },
  })
  return id
}

export function applyTextBoxStyleToShape(
  editor: Editor,
  shapeId: string,
  patch: Partial<WallTextBoxStyle> & { richText?: ReturnType<typeof toRichText> },
) {
  const shape = editor.getShape(shapeId as never)
  if (!shape) return

  const { richText, ...stylePatch } = patch
  const wallTextBox: WallTextBoxStyle = {
    ...readWallTextBoxStyle(shape.meta as Record<string, unknown>),
    ...stylePatch,
  }

  if (shape.type === 'text') {
    const props = shape.props as TLTextShape['props']
    editor.updateShape({
      id: shape.id,
      type: 'text',
      meta: { ...shape.meta, wallTextBox },
      props: {
        ...props,
        ...(stylePatch.color ? { color: stylePatch.color } : {}),
        ...(stylePatch.size ? { size: stylePatch.size } : {}),
        ...(stylePatch.font ? { font: stylePatch.font } : {}),
        ...(richText ? { richText } : {}),
      },
    })
    return
  }

  if (shape.type === 'note') {
    const props = shape.props as TLNoteShape['props']
    editor.updateShape({
      id: shape.id,
      type: 'note',
      meta: { ...shape.meta, wallTextBox },
      props: {
        ...props,
        ...(stylePatch.stickyColor ? { color: stylePatch.stickyColor } : {}),
        ...(stylePatch.font ? { font: stylePatch.font } : {}),
        ...(richText ? { richText } : {}),
      },
    })
  }
}

/** Switch between plain text box, card background, or sticky note shape. */
export function setTextDisplayMode(
  editor: Editor,
  shapeId: string,
  mode: WallTextDisplayMode,
  extras?: Partial<WallTextBoxStyle>,
): string | null {
  const shape = editor.getShape(shapeId as never)
  if (!shape || (shape.type !== 'text' && shape.type !== 'note')) return null

  const style = { ...readWallTextBoxStyle(shape.meta as Record<string, unknown>), ...extras, mode }
  const rt = richTextFromShape(shape.props as { richText?: unknown })
  const bounds = editor.getShapePageBounds(shape.id)
  const x = bounds?.x ?? shape.x
  const y = bounds?.y ?? shape.y
  const rotation = shape.rotation
  const newId = createShapeId()

  editor.run(() => {
    editor.deleteShapes([shape.id])
    if (mode === 'sticky') {
      createStickyNoteShape(editor, { id: newId, x, y, color: style.stickyColor, rotation, style })
    } else {
      createTextBoxShape(editor, { id: newId, x, y, style, rotation })
    }
    applyTextBoxStyleToShape(editor, newId, { ...style, richText: rt })
    editor.select(newId)
  })

  return newId
}

export function updateTextTypography(
  editor: Editor,
  shapeIds: string[],
  patch: { font?: WallTextFont; size?: WallTextSize; color?: WallTextColor },
) {
  editor.run(() => {
    for (const id of shapeIds) {
      const shape = editor.getShape(id as never)
      if (!shape || (shape.type !== 'text' && shape.type !== 'note')) continue
      applyTextBoxStyleToShape(editor, id, patch)
    }
  })
}
