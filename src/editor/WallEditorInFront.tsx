/**
 * Editor-only canvas overlays — inspector, snap guides (inside tldraw context).
 */
import { WallInspector } from '@/editor/WallInspector'
import { WallSnapGuides } from '@/editor/WallSnapGuides'

export function WallEditorInFront() {
  return (
    <>
      <WallSnapGuides />
      <div className="wall-editor-hud">
        <WallInspector />
      </div>
    </>
  )
}
