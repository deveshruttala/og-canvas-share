/**
 * Session timeline — tldraw history marks for scrubbing + undo/redo.
 */
import type { Editor } from '@tldraw/editor'
import { notifyHistoryChange } from '@/editor/wall-editor-api'

const marks: string[] = []
let markIndex = 0
const MAX_MARKS = 40

export function resetTimelineMarks(editor: Editor) {
  marks.length = 0
  markIndex = 0
  const id = editor.markHistoryStoppingPoint('wall-session')
  marks.push(id)
}

/** Call after a completed edit gesture (pointer up) or major action. */
export function pushTimelineMark(editor: Editor, label = 'wall-edit') {
  const id = editor.markHistoryStoppingPoint(label)
  if (markIndex < marks.length - 1) {
    marks.splice(markIndex + 1)
  }
  marks.push(id)
  if (marks.length > MAX_MARKS) {
    marks.shift()
    markIndex = Math.max(0, markIndex - 1)
  }
  markIndex = marks.length - 1
  notifyHistoryChange()
}

export function getTimelineState() {
  return {
    total: marks.length,
    index: markIndex,
  }
}

export function canTimelineUndo(editor: Editor | null): boolean {
  if (!editor) return false
  try {
    return markIndex > 0 || editor.getCanUndo()
  } catch {
    return markIndex > 0
  }
}

export function canTimelineRedo(editor: Editor | null): boolean {
  if (!editor) return false
  try {
    return markIndex < marks.length - 1 || editor.getCanRedo()
  } catch {
    return markIndex < marks.length - 1
  }
}

export function timelineUndo(editor: Editor): boolean {
  if (markIndex > 0) {
    markIndex -= 1
    editor.bailToMark(marks[markIndex])
    notifyHistoryChange()
    return true
  }
  if (editor.getCanUndo()) {
    editor.undo()
    markIndex = Math.max(0, markIndex - 1)
    notifyHistoryChange()
    return true
  }
  return false
}

export function timelineRedo(editor: Editor): boolean {
  if (markIndex < marks.length - 1) {
    markIndex += 1
    editor.bailToMark(marks[markIndex])
    notifyHistoryChange()
    return true
  }
  if (editor.getCanRedo()) {
    editor.redo()
    markIndex = Math.min(marks.length - 1, markIndex + 1)
    notifyHistoryChange()
    return true
  }
  return false
}

export function goToTimelineMark(editor: Editor, index: number) {
  if (!marks.length) return
  const i = Math.max(0, Math.min(index, marks.length - 1))
  const id = marks[i]
  if (!id) return
  markIndex = i
  editor.bailToMark(id)
  notifyHistoryChange()
}
