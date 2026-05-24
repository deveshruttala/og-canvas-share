import { wallActions } from '@/editor/wall-actions'
import { getWallEditor } from '@/editor/wall-editor-api'
import { useCanvasStore } from '@/store/canvas.store'
import type { ThemeId } from '@/types/canvas'
import type { AgentToolCall } from '@/lib/wall-agent-tools'

type StickyColor = 'yellow' | 'light-green' | 'light-blue' | 'light-violet' | 'light-red' | 'orange'

/** Execute a single agent tool call on the live canvas */
export async function executeAgentTool(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case 'add_sticky':
        wallActions.addSticky(
          String(args.text ?? ''),
          (args.color as StickyColor) ?? 'yellow',
          args.x as number | undefined,
          args.y as number | undefined,
        )
        return `Added sticky: "${String(args.text).slice(0, 40)}"`

      case 'add_text':
        wallActions.addTextBlock(
          String(args.text ?? ''),
          (args.size as 's' | 'm' | 'l' | 'xl') ?? 'l',
          args.x as number | undefined,
          args.y as number | undefined,
        )
        return `Added text block`

      case 'add_link':
        await wallActions.addLinkAt(String(args.url ?? ''), args.x as number | undefined, args.y as number | undefined)
        return `Added link: ${args.url}`

      case 'add_emoji':
        wallActions.addEmojiAt(String(args.emoji ?? '✨'), args.x as number | undefined, args.y as number | undefined)
        return `Added emoji ${args.emoji}`

      case 'add_qr':
        await wallActions.addQrAt(String(args.url ?? ''), args.x as number | undefined, args.y as number | undefined)
        return `Added QR for ${args.url}`

      case 'add_widget':
        wallActions.addWidgetAt(
          (args.type as 'clock' | 'weather' | 'spotify' | 'github') ?? 'clock',
          args.x as number | undefined,
          args.y as number | undefined,
        )
        return `Added ${args.type} widget`

      case 'set_theme':
        useCanvasStore.getState().setTheme(args.theme as ThemeId)
        return `Theme set to ${args.theme}`

      case 'fit_wall':
        wallActions.fitWall()
        return 'Fitted wall to viewport'

      case 'delete_selected': {
        const editor = getWallEditor()
        if (!editor) return 'Editor not ready'
        const ids = editor.getSelectedShapeIds()
        if (ids.length === 0) return 'Nothing selected to delete'
        editor.deleteShapes(ids)
        return `Deleted ${ids.length} shape(s)`
      }

      case 'auto_arrange':
        wallActions.autoArrange()
        return 'Auto-arranged all elements into a grid'

      case 'set_wall_title':
        useCanvasStore.getState().setTitle(String(args.title ?? 'My Wall'))
        return `Wall title set to "${args.title}"`

      case 'add_embed':
        wallActions.addEmbed(String(args.url ?? ''))
        return `Added embed: ${args.url}`

      case 'add_image_url':
        await wallActions.addImageFromUrl(String(args.url ?? ''), args.x as number | undefined, args.y as number | undefined)
        return `Added image from ${args.url}`

      case 'add_gif':
        wallActions.addGifAt(String(args.url ?? ''), args.x as number | undefined, args.y as number | undefined)
        return `Added GIF`

      case 'clear_wall':
        wallActions.clearWall()
        return 'Cleared all canvas elements'

      default:
        return `Unknown tool: ${name}`
    }
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : 'failed'}`
  }
}

export async function executeAgentToolCalls(calls: AgentToolCall[]): Promise<Array<{ id: string; result: string }>> {
  const results: Array<{ id: string; result: string }> = []
  for (const call of calls) {
    const result = await executeAgentTool(call.name, call.arguments)
    results.push({ id: call.id, result })
  }
  return results
}

export type ChatMessage =
  | { role: 'user' | 'assistant'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }> }
  | { role: 'tool'; tool_call_id: string; content: string }
