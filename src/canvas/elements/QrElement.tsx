import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import type { CanvasElement, QrContent } from '@/types/canvas'
import { cn } from '@/lib/cn'

type Props = {
  element: CanvasElement
  selected?: boolean
}

export function QrElement({ element, selected }: Props) {
  const { url } = element.content as QrContent
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    void QRCode.toDataURL(url, { margin: 1, width: 256, color: { dark: '#1a1814' } }).then(
      setDataUrl,
    )
  }, [url])

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-white',
        selected && 'ring-2 ring-[var(--accent)] ring-offset-2',
      )}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`QR code for ${url}`}
          className="min-h-0 flex-1 w-full object-contain p-2"
          draggable={false}
        />
      ) : (
        <div className="min-h-0 flex-1 w-full animate-pulse bg-[var(--bg-muted)]" />
      )}
      <p className="max-w-full shrink-0 truncate px-2 pb-1.5 text-[9px] text-[var(--text-tertiary)]">
        {url}
      </p>
    </div>
  )
}
