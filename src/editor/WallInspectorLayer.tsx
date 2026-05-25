/**
 * Inspector inside tldraw (useEditor) with fixed HUD positioning above the dock.
 */
import { useOmniStore } from '@/store/omni.store'
import { WallInspector } from '@/editor/WallInspector'

export function WallInspectorLayer() {
  const omniOpen = useOmniStore((s) => s.open)
  if (omniOpen) return null

  return (
    <div className="wall-editor-hud wall-editor-hud-layer" aria-live="polite">
      <WallInspector />
    </div>
  )
}
