import { getWallEditor, WALL_FRAME_ID } from '@/editor/wall-editor-api'

function shapeText(shape: { type: string; props: Record<string, unknown> }): string {
  const rt = shape.props.richText as { content?: Array<{ content?: Array<{ text?: string }> }> } | undefined
  if (rt?.content) {
    return rt.content
      .flatMap((block) => block.content?.map((n) => n.text ?? '') ?? [])
      .join('')
      .trim()
  }
  if (shape.type === 'embed' || shape.type === 'bookmark') {
    const u = shape.props.url
    return typeof u === 'string' ? u : ''
  }
  if (shape.type === 'image') return String(shape.props.altText ?? 'image')
  const meta = shape as { meta?: { wallType?: string; wallData?: Record<string, unknown> } }
  if (meta.meta?.wallType) return `${meta.meta.wallType}: ${JSON.stringify(meta.meta.wallData ?? {})}`
  return ''
}

/** Compact summary of canvas state for the AI agent */
export function getCanvasSummary(): string {
  const editor = getWallEditor()
  if (!editor) return 'Canvas not loaded yet.'

  const shapes = editor
    .getCurrentPageShapes()
    .filter((s) => s.id !== WALL_FRAME_ID && !(s.meta as { wallFrame?: boolean })?.wallFrame)

  if (shapes.length === 0) return 'The wall is empty (1600×1000 canvas).'

  const lines = shapes.slice(0, 40).map((s) => {
    const text = shapeText(s as never)
    const label = text ? `"${text.slice(0, 80)}"` : '(no text)'
    return `- ${s.type} at (${Math.round(s.x)}, ${Math.round(s.y)}) ${label}`
  })

  const extra = shapes.length > 40 ? `\n… and ${shapes.length - 40} more shapes` : ''
  return `Wall has ${shapes.length} elements:\n${lines.join('\n')}${extra}`
}
