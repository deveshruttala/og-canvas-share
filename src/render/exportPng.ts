import { toPng } from 'html-to-image'
import { dataUrlToBlob } from '@/lib/compress-image'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/types/canvas'

export async function exportCanvasToPng(
  element: HTMLElement,
  filename = 'wall.png',
): Promise<void> {
  const dataUrl = await toPng(element, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    pixelRatio: 1,
    cacheBust: true,
  })

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

export async function exportCanvasToPngBlob(element: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(element, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    pixelRatio: 1,
    cacheBust: true,
  })
  return dataUrlToBlob(dataUrl)
}
