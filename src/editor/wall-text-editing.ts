import type { Editor, TLShape, TLShapeId } from '@tldraw/editor'

export function isWallRichTextShape(shape: TLShape | null | undefined): boolean {
  return shape?.type === 'text' || shape?.type === 'note'
}

/** Enter tldraw rich-text edit mode (select tool + editing_shape state). */
export function startWallTextEditing(
  editor: Editor,
  shapeId: TLShapeId,
  opts?: { selectAll?: boolean },
) {
  const shape = editor.getShape(shapeId)
  if (!shape || !isWallRichTextShape(shape) || !editor.canEditShape(shape)) return

  editor.run(() => {
    editor.markHistoryStoppingPoint('editing wall text')
    editor.select(shapeId)
    editor.setEditingShape(shape)
    editor.setCurrentTool('select.editing_shape', {
      target: 'shape',
      shape,
    })
    if (opts?.selectAll) {
      editor.emit('select-all-text', { shapeId })
    }
  })
  editor.focus()
}

export function isCanvasTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return !!target.closest('[contenteditable="true"]')
}

export function isEditingWallText(editor: Editor | null | undefined): boolean {
  if (!editor) return false
  const id = editor.getEditingShapeId()
  if (!id) return false
  return isWallRichTextShape(editor.getShape(id))
}
