import type { OmniItem } from '@/providers/types'

export type CuratedAudioClip = {
  id: string
  title: string
  artist: string
  tags: string[]
  src: string
  duration?: number
  badge?: string
  category: 'music' | 'ambient' | 'sfx' | 'nature' | 'ui'
}

export function clipToOmniItem(clip: CuratedAudioClip): OmniItem {
  return {
    id: clip.id,
    kind: 'audio',
    title: clip.title,
    subtitle: clip.artist,
    previewUrl: clip.src,
    duration: clip.duration,
    source: clip.badge ?? 'Wall',
    payload: {
      src: clip.src,
      title: clip.title,
      artist: clip.artist,
      badge: clip.badge ?? 'Wall',
    },
  }
}
