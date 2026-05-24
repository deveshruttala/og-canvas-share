import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/types/canvas'

export function getCanvasRoot(): HTMLElement | null {
  return document.querySelector('[data-canvas-root]')
}

export function getCanvasScale(): { scaleX: number; scaleY: number } {
  const root = getCanvasRoot()
  if (!root) return { scaleX: 1, scaleY: 1 }
  const rect = root.getBoundingClientRect()
  return {
    scaleX: rect.width / CANVAS_WIDTH,
    scaleY: rect.height / CANVAS_HEIGHT,
  }
}

export function screenDeltaToCanvas(dx: number, dy: number): { dx: number; dy: number } {
  const { scaleX, scaleY } = getCanvasScale()
  return { dx: dx / scaleX, dy: dy / scaleY }
}

export function clientToCanvas(clientX: number, clientY: number): { x: number; y: number } {
  const root = getCanvasRoot()
  if (!root) return { x: 0, y: 0 }
  const rect = root.getBoundingClientRect()
  return {
    x: ((clientX - rect.left) / rect.width) * CANVAS_WIDTH,
    y: ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
  }
}

export function elementCenterOnScreen(element: {
  x: number
  y: number
  w: number
  h: number
}): { x: number; y: number } {
  const root = getCanvasRoot()
  if (!root) return { x: 0, y: 0 }
  const rect = root.getBoundingClientRect()
  return {
    x: rect.left + ((element.x + element.w / 2) / CANVAS_WIDTH) * rect.width,
    y: rect.top + ((element.y + element.h / 2) / CANVAS_HEIGHT) * rect.height,
  }
}
