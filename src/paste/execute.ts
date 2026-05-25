import { resolveWallUrl } from '@/lib/resolve-wall-url'
import { wallActions } from '@/editor/wall-actions'
import type { PasteRoute } from '@/paste/router'
import { normalizeCalEmbedUrl } from '@/paste/router'

export type PastePlacement = { x?: number; y?: number }

/** Run a classified paste route on the wall editor. */
export async function executePasteRoute(route: PasteRoute, at?: PastePlacement): Promise<void> {
  const { x, y } = at ?? {}

  switch (route.kind) {
    case 'image-file':
      await wallActions.pasteImageFile(route.file)
      break
    case 'audio-file':
      await wallActions.addAudioFromFile(route.file)
      break
    case 'embed': {
      const resolved = await resolveWallUrl(route.url)
      if (resolved.action === 'embed' && resolved.embedUrl) {
        wallActions.addEmbed(resolved.url, resolved.embedUrl)
      } else {
        await wallActions.addLink(resolved.url, x, y, resolved.meta)
      }
      break
    }
    case 'asset-image':
      await wallActions.addImageFromUrl(route.url, x, y)
      break
    case 'asset-video':
      wallActions.addVideoClip(route.url, { title: 'Video' }, x, y)
      break
    case 'rss-feed':
      wallActions.addWidget('rss', { label: 'Feed', feedUrl: route.feedUrl, feedLimit: 5 }, x, y)
      break
    case 'calendar-embed':
      wallActions.addCalendarEmbed(normalizeCalEmbedUrl(route.url), x, y)
      break
    case 'carbon-code':
      wallActions.addCodeCard(route.code, route.language, x, y)
      break
    case 'quickchart':
      await wallActions.addImageFromUrl(route.chartUrl, x, y, 'Chart')
      break
    case 'link': {
      const resolved = await resolveWallUrl(route.url)
      if (resolved.action === 'embed' && resolved.embedUrl) {
        wallActions.addEmbed(resolved.url, resolved.embedUrl)
      } else {
        await wallActions.addLink(resolved.url, x, y, resolved.meta)
      }
      break
    }
    case 'html':
      wallActions.addSticky(route.plain.slice(0, 2000), 'yellow', x, y)
      break
    case 'code':
      wallActions.addCodeCard(route.text, route.language, x, y)
      break
    case 'sticky':
      wallActions.addSticky(route.text.slice(0, 2000), 'yellow', x, y)
      break
  }

  wallActions.markEditComplete('paste')
}

