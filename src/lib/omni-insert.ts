import type { OmniItem } from '@/providers/types'
import { getInsertPoint } from '@/lib/omni-cursor'
import { wallActions } from '@/editor/wall-actions'
import { WIDGET_CATALOG, type CatalogWidget } from '@/widgets/catalog'
import toast from 'react-hot-toast'

export async function insertOmniItem(item: OmniItem) {
  const { x, y } = getInsertPoint()

  if (item.kind === 'action' && item.payload?.run) {
    ;(item.payload.run as () => void)()
    return
  }

  try {
    switch (item.kind) {
      case 'image': {
        const url = String(item.payload?.url ?? item.previewUrl ?? '')
        const attribution = item.payload?.attribution as string | undefined
        await wallActions.addImageFromUrl(url, x, y, attribution)
        break
      }
      case 'gif': {
        const url = String(item.payload?.url ?? item.previewUrl ?? '')
        await wallActions.addGifAt(url, x, y)
        break
      }
      case 'audio': {
        const payload = item.payload as {
          src?: string
          title?: string
          artist?: string
          cover?: string
          badge?: string
        }
        if (payload.src) {
          await wallActions.addStreamingAudio(
            {
              src: payload.src,
              title: payload.title,
              artist: payload.artist,
              cover: payload.cover,
              badge: payload.badge,
            },
            x,
            y,
          )
        } else {
          toast.error('No audio preview available')
        }
        break
      }
      case 'emoji':
        wallActions.addEmoji(item.emoji ?? '✨', x, y)
        break
      case 'icon':
        wallActions.addIcon(item.icon ?? '⚡')
        break
      case 'widget': {
        const catalogId = item.payload?.catalogId as string | undefined
        const widget = WIDGET_CATALOG.find((w) => w.id === catalogId)
        if (widget) wallActions.insertCatalogWidget(widget, x, y)
        else toast.error('Widget not found')
        break
      }
      case 'link':
        if (item.url) {
          const payload = item.payload as { title?: string; description?: string } | undefined
          await wallActions.addLink(item.url, x, y, {
            title: item.title ?? payload?.title,
            description: item.subtitle ?? payload?.description,
          })
        }
        break
      default:
        break
    }
    toast.success('Added to wall')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not add item')
  }
}

export function insertCatalogWidgetFromLibrary(widget: CatalogWidget) {
  const { x, y } = getInsertPoint()
  wallActions.insertCatalogWidget(widget, x, y)
}
