import { clamp } from '@/lib/cn'

const MAX_LONG_EDGE = 1400
const MAX_BYTES = 800_000
const HARD_MAX_BYTES = 2_000_000

export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const longEdge = Math.max(bitmap.width, bitmap.height)
  const scale = longEdge > MAX_LONG_EDGE ? MAX_LONG_EDGE / longEdge : 1
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  let quality = 0.75
  let blob: Blob | null = await encode(canvas, 'image/avif', quality)

  if (!blob) {
    blob = await encode(canvas, 'image/webp', quality)
  }

  if (!blob) {
    blob = await encode(canvas, 'image/jpeg', quality)
  }

  if (!blob) throw new Error('Could not compress image')

  let result: Blob = blob
  for (let i = 0; i < 3 && result.size > MAX_BYTES; i++) {
    quality = clamp(quality - 0.05, 0.3, 1)
    const next = await encode(canvas, result.type, quality)
    if (next) result = next
  }

  if (result.size > HARD_MAX_BYTES) {
    throw new Error('That image was too big — try a smaller file')
  }

  return result
}

async function encode(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality)
  })
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
