import { useCallback, useEffect, useState } from 'react'
import { getWallEditor, onHistoryChange } from '@/editor/wall-editor-api'
import {
  canTimelineRedo,
  canTimelineUndo,
  getTimelineState,
} from '@/editor/wall-timeline-history'

export function useWallHistory() {
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [timeline, setTimeline] = useState({ total: 1, index: 0 })

  const refresh = useCallback(() => {
    const editor = getWallEditor()
    setCanUndo(canTimelineUndo(editor))
    setCanRedo(canTimelineRedo(editor))
    setTimeline(getTimelineState())
  }, [])

  useEffect(() => {
    refresh()
    return onHistoryChange(refresh)
  }, [refresh])

  useEffect(() => {
    const id = window.setInterval(refresh, 800)
    return () => window.clearInterval(id)
  }, [refresh])

  return { canUndo, canRedo, timeline, refresh }
}
