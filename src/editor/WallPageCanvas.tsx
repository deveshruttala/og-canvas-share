import { useEditor, useValue } from '@tldraw/editor'
import { useCanvasStore } from '@/store/canvas.store'
import { getTheme } from '@/themes'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/types/canvas'
import { cn } from '@/lib/cn'
import { resolvePageBackgroundStyle } from '@/editor/wall-page-background'

/**
 * The 1600×1000 artboard — lives in tldraw's OnTheCanvas layer so it pans/zooms
 * with the page. Workspace surround is WallThemeBackground (Behind shapes).
 */
export function WallPageCanvas() {
  const editor = useEditor()
  const themeId = useCanvasStore((s) => s.doc.theme)
  const customPageBackground = useCanvasStore((s) => s.doc.customPageBackground)
  const customPageBackgroundSize = useCanvasStore((s) => s.doc.customPageBackgroundSize)
  const theme = getTheme(themeId)

  void useValue('wall-page-camera', () => editor.getCamera(), [editor])

  const pageStyle = resolvePageBackgroundStyle(customPageBackground, customPageBackgroundSize, theme)

  return (
    <div
      className={cn('wall-page-canvas pointer-events-none', theme.canvasClass, theme.pageClass)}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        ...pageStyle,
      }}
      data-wall-page
      data-wall-theme={theme.id}
      aria-hidden
    />
  )
}
