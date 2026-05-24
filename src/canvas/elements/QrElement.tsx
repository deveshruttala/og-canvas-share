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
        'flex h-full w-full flex-col items-center justify-center p-3',
        selected && 'ring-2 ring-[var(--accent)] ring-offset-2',
      )}
      style={{
        background: element.style.bg ?? '#fff',
        borderRadius: element.style.borderRadius ?? 8,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {dataUrl ? (
        <img src={dataUrl} alt={`QR code for ${url}`} className="max-h-[80%] w-full object-contain" />
      ) : (
        <div className="h-24 w-24 animate-pulse rounded bg-[var(--bg-muted)]" />
      )}
      <p className="mt-2 max-w-full truncate text-[10px] text-[var(--text-tertiary)]">{url}</p>
    </div>
  )
}
