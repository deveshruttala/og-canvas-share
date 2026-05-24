import { create } from 'zustand'
import type { ElementType } from '@/types/canvas'

export type ToolId = 'select' | ElementType | 'pan'

type UiState = {
  activeTool: ToolId
  showShareModal: boolean
  showHelpOverlay: boolean
  showAddPicker: boolean
  showGifPicker: boolean
  showEmojiPicker: boolean
  showIconPicker: boolean
  showCommandPalette: boolean
  showAiPanel: boolean
  showAiSettings: boolean
  showWidgetPicker: boolean
  showConnections: boolean
  snapToGrid: boolean
  zoomScale: number
  brushColor: string
  brushSize: 's' | 'm' | 'l' | 'xl'
  brushOpacity: number
  brushStabilizer: number
  setTool: (tool: ToolId) => void
  setShowShareModal: (show: boolean) => void
  setShowHelpOverlay: (show: boolean) => void
  setShowAddPicker: (show: boolean) => void
  setShowGifPicker: (show: boolean) => void
  setShowEmojiPicker: (show: boolean) => void
  setShowIconPicker: (show: boolean) => void
  setShowCommandPalette: (show: boolean) => void
  setShowAiPanel: (show: boolean) => void
  setShowAiSettings: (show: boolean) => void
  setShowWidgetPicker: (show: boolean) => void
  setShowConnections: (show: boolean) => void
  toggleSnapToGrid: () => void
  setZoomScale: (scale: number) => void
  setBrushColor: (color: string) => void
  setBrushSize: (size: 's' | 'm' | 'l' | 'xl') => void
  setBrushOpacity: (opacity: number) => void
  setBrushStabilizer: (v: number) => void
}

export const useUiStore = create<UiState>((set) => ({
  activeTool: 'select',
  showShareModal: false,
  showHelpOverlay: false,
  showAddPicker: false,
  showGifPicker: false,
  showEmojiPicker: false,
  showIconPicker: false,
  showCommandPalette: false,
  showAiPanel: false,
  showAiSettings: false,
  showWidgetPicker: false,
  showConnections: false,
  snapToGrid: false,
  zoomScale: 1,
  brushColor: 'light-green',
  brushSize: 'm',
  brushOpacity: 1,
  brushStabilizer: 0.35,
  setTool: (tool) => set({ activeTool: tool }),
  setShowShareModal: (show) => set({ showShareModal: show }),
  setShowHelpOverlay: (show) => set({ showHelpOverlay: show }),
  setShowAddPicker: (show) => set({ showAddPicker: show }),
  setShowGifPicker: (show) => set({ showGifPicker: show }),
  setShowEmojiPicker: (show) => set({ showEmojiPicker: show }),
  setShowIconPicker: (show) => set({ showIconPicker: show }),
  setShowCommandPalette: (show) => set({ showCommandPalette: show }),
  setShowAiPanel: (show) => set({ showAiPanel: show }),
  setShowAiSettings: (show) => set({ showAiSettings: show }),
  setShowWidgetPicker: (show) => set({ showWidgetPicker: show }),
  setShowConnections: (show) => set({ showConnections: show }),
  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
  setZoomScale: (scale) => set({ zoomScale: scale }),
  setBrushColor: (brushColor) => set({ brushColor }),
  setBrushSize: (brushSize) => set({ brushSize }),
  setBrushOpacity: (brushOpacity) => set({ brushOpacity }),
  setBrushStabilizer: (brushStabilizer) => set({ brushStabilizer }),
}))
