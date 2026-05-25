import { useCanvasStore } from '@/store/canvas.store'
import { getTheme } from '@/themes'
import { cn } from '@/lib/cn'

/** Workspace surround outside the artboard — reacts to theme without remounting tldraw. */
export function WallThemeBackground() {
  const themeId = useCanvasStore((s) => s.doc.theme)
  const customWorkspace = useCanvasStore((s) => s.doc.customWorkspaceBackground)
  const theme = getTheme(themeId)

  return (
    <div
      className={cn('wall-workspace-bg pointer-events-none absolute inset-0', theme.workspaceClass)}
      style={{ background: customWorkspace?.trim() || theme.background }}
      data-wall-theme={theme.id}
      data-wall-layer="workspace"
      aria-hidden
    />
  )
}
