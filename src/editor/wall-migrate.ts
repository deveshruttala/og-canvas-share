import type { Editor } from '@tldraw/editor'
import { AssetRecordType, createShapeId, toRichText } from '@tldraw/tlschema'
import type { CanvasElement } from '@/types/canvas'
import { detectLinkPlatform, getEmbedUrl } from '@/lib/link-resolver'
import { buildWallLinkMeta, wallHostGeoProps, WALL_LINK_H, WALL_LINK_W } from '@/editor/wall-host-shape'

/** One-time migration from legacy CanvasElement[] to tldraw shapes */
export function migrateLegacyElements(editor: Editor, elements: CanvasElement[]) {
  for (const el of elements) {
    const id = createShapeId(el.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || undefined)

    if (el.type === 'text') {
      const text = (el.content as { text?: string }).text ?? ''
      editor.createShape({
        id,
        type: 'note',
        x: el.x,
        y: el.y,
        rotation: (el.rotation * Math.PI) / 180,
        props: {
          color: 'yellow',
          size: 'm',
          richText: toRichText(text),
          align: 'middle',
          verticalAlign: 'middle',
          font: 'draw',
          fontSizeAdjustment: 0,
          growY: 0,
          url: '',
          scale: 1,
        },
      })
      continue
    }

    if (el.type === 'image') {
      const src = (el.content as { src: string }).src
      const assetId = AssetRecordType.createId()
      editor.createAssets([
        {
          id: assetId,
          typeName: 'asset',
          type: 'image',
          props: { name: 'image', src, w: el.w, h: el.h, mimeType: 'image/png', isAnimated: src.includes('.gif') },
          meta: {},
        },
      ])
      editor.createShape({
        id,
        type: 'image',
        x: el.x,
        y: el.y,
        rotation: (el.rotation * Math.PI) / 180,
        props: { assetId, w: el.w, h: el.h, playing: true, url: '', crop: null, flipX: false, flipY: false, altText: '' },
      })
      continue
    }

    if (el.type === 'link') {
      const c = el.content as { url: string; title?: string; description?: string; image?: string }
      editor.createShape({
        id,
        type: 'geo',
        x: el.x,
        y: el.y,
        rotation: (el.rotation * Math.PI) / 180,
        opacity: 0.001,
        props: wallHostGeoProps(el.w || WALL_LINK_W, el.h || WALL_LINK_H),
        meta: buildWallLinkMeta(c.url, {
          title: c.title,
          description: c.description,
          image: c.image,
        }),
      })
      continue
    }

    if (el.type === 'embed') {
      const c = el.content as { embedUrl: string; url?: string }
      editor.createShape({
        id,
        type: 'embed',
        x: el.x,
        y: el.y,
        props: { w: el.w, h: el.h, url: c.embedUrl ?? c.url ?? '' },
      })
      continue
    }

    if (el.type === 'emoji') {
      editor.createShape({
        id,
        type: 'text',
        x: el.x,
        y: el.y,
        props: {
          richText: toRichText((el.content as { emoji: string }).emoji),
          color: 'black',
          size: 'xl',
          font: 'sans',
          textAlign: 'middle',
          autoSize: true,
          w: el.w,
          scale: 2,
        },
      })
      continue
    }

    if (el.type === 'audio' || el.type === 'qr' || el.type === 'widget') {
      editor.createShape({
        id,
        type: 'geo',
        x: el.x,
        y: el.y,
        rotation: (el.rotation * Math.PI) / 180,
        props: {
          geo: 'rectangle',
          w: el.w,
          h: el.h,
          dash: 'draw',
          color: 'black',
          fill: 'solid',
          size: 's',
          font: 'sans',
          align: 'start',
          verticalAlign: 'start',
          growY: 0,
          url: '',
          scale: 1,
          richText: toRichText(''),
        },
        meta: {
          wallType: el.type,
          wallData: JSON.parse(JSON.stringify(el.content)),
        },
      })
    }
  }
}

export async function migrateLinkElement(editor: Editor, el: CanvasElement) {
  const url = (el.content as { url: string }).url
  const platform = detectLinkPlatform(url)
  const embedUrl = getEmbedUrl(url, platform)
  if (embedUrl) {
    editor.createShape({
      id: createShapeId(),
      type: 'embed',
      x: el.x,
      y: el.y,
      props: { w: el.w, h: el.h, url: embedUrl },
    })
  } else {
    const c = el.content as { url: string; title?: string; description?: string; image?: string }
    editor.createShape({
      id: createShapeId(),
      type: 'geo',
      x: el.x,
      y: el.y,
      opacity: 0.001,
      props: wallHostGeoProps(el.w || WALL_LINK_W, el.h || WALL_LINK_H),
      meta: buildWallLinkMeta(url, {
        title: c.title,
        description: c.description,
        image: c.image,
      }),
    })
  }
}
