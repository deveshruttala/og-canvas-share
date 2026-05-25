import type { CuratedAudioClip } from '@/providers/audio-sources/types'
import { clipToOmniItem } from '@/providers/audio-sources/types'
import type { OmniItem } from '@/providers/types'

/** Mixkit preview CDN — free for personal/commercial use per Mixkit license. */
function mix(id: number, title: string, tags: string[], category: CuratedAudioClip['category'], duration = 3) {
  return {
    id: `mixkit-${id}`,
    title,
    artist: 'Mixkit',
    tags,
    src: `https://assets.mixkit.co/active_storage/sfx/${id}/${id}-preview.mp3`,
    duration,
    badge: 'Mixkit',
    category,
  } satisfies CuratedAudioClip
}

export const CURATED_AUDIO_CLIPS: CuratedAudioClip[] = [
  mix(2568, 'Lofi chill beat loop', ['lofi', 'chill', 'beats', 'music', 'study'], 'music', 12),
  mix(2000, 'Soft piano keys', ['piano', 'calm', 'music', 'classical'], 'music', 8),
  mix(2001, 'Acoustic guitar strum', ['guitar', 'acoustic', 'folk', 'music'], 'music', 6),
  mix(2002, 'Jazz lounge groove', ['jazz', 'lounge', 'smooth', 'music'], 'music', 10),
  mix(951, 'Achievement bell', ['success', 'bell', 'celebration', 'sfx'], 'sfx', 2),
  mix(133, 'Magic sweep transition', ['magic', 'transition', 'whoosh', 'sfx'], 'sfx', 2),
  mix(2570, 'Software interface start', ['ui', 'click', 'tech', 'interface', 'sfx'], 'ui', 1),
  mix(2869, 'Mouse click soft', ['click', 'mouse', 'ui', 'sfx'], 'ui', 1),
  mix(2569, 'Camera shutter snap', ['camera', 'photo', 'shutter', 'sfx'], 'sfx', 1),
  mix(2003, 'Pop notification', ['notification', 'pop', 'alert', 'sfx'], 'sfx', 1),
  mix(2004, 'Positive interface beep', ['beep', 'positive', 'ui', 'sfx'], 'ui', 1),
  mix(2574, 'Arcade retro jump', ['arcade', 'game', 'retro', 'sfx'], 'sfx', 1),
  mix(2575, 'Sci-fi confirm', ['sci-fi', 'confirm', 'futuristic', 'sfx'], 'sfx', 2),
  mix(2576, 'Error digital buzz', ['error', 'fail', 'digital', 'sfx'], 'sfx', 2),
  mix(2577, 'Crowd applause burst', ['applause', 'crowd', 'celebration', 'sfx'], 'sfx', 3),
  mix(2578, 'Drum rim shot', ['drum', 'percussion', 'hit', 'sfx'], 'sfx', 1),
  mix(2579, 'Wind chime gentle', ['chime', 'wind', 'calm', 'ambient'], 'ambient', 4),
  mix(2580, 'Rain on window', ['rain', 'weather', 'ambient', 'relax'], 'ambient', 8),
  mix(2581, 'Ocean waves soft', ['ocean', 'waves', 'beach', 'nature', 'ambient'], 'nature', 10),
  mix(2582, 'Forest birds morning', ['forest', 'birds', 'nature', 'morning'], 'nature', 10),
  mix(2583, 'Campfire crackle', ['fire', 'campfire', 'cozy', 'ambient'], 'ambient', 8),
  mix(2584, 'Thunder distant rumble', ['thunder', 'storm', 'weather', 'ambient'], 'ambient', 5),
  mix(2585, 'Keyboard typing fast', ['keyboard', 'typing', 'office', 'sfx'], 'ui', 3),
  mix(2586, 'Cash register ding', ['cash', 'money', 'ding', 'sfx'], 'sfx', 1),
  mix(2587, 'Clock tick tock', ['clock', 'tick', 'time', 'ambient'], 'ambient', 4),
  mix(2588, 'Heartbeat pulse', ['heartbeat', 'pulse', 'tension', 'sfx'], 'sfx', 2),
  mix(2589, 'Laser zap short', ['laser', 'zap', 'game', 'sfx'], 'sfx', 1),
  mix(2590, 'Rocket launch whoosh', ['rocket', 'launch', 'space', 'sfx'], 'sfx', 3),
  mix(2591, 'Bubble pop cartoon', ['bubble', 'pop', 'cartoon', 'fun', 'sfx'], 'sfx', 1),
  mix(2592, 'Laugh track snippet', ['laugh', 'comedy', 'fun', 'sfx'], 'sfx', 2),
  mix(2593, 'Door creak open', ['door', 'creak', 'horror', 'sfx'], 'sfx', 2),
  mix(2594, 'Footsteps on gravel', ['footsteps', 'walk', 'gravel', 'sfx'], 'sfx', 3),
  mix(2595, 'Car engine start', ['car', 'engine', 'vehicle', 'sfx'], 'sfx', 3),
  mix(2596, 'Phone vibration buzz', ['phone', 'vibrate', 'mobile', 'sfx'], 'sfx', 1),
  mix(2597, 'Sword metal clash', ['sword', 'metal', 'fight', 'game', 'sfx'], 'sfx', 1),
  mix(2598, 'Water drop single', ['water', 'drop', 'minimal', 'sfx'], 'sfx', 1),
  mix(2599, 'Wind gust strong', ['wind', 'gust', 'weather', 'ambient'], 'ambient', 4),
  mix(2600, 'Crickets at night', ['crickets', 'night', 'nature', 'ambient'], 'nature', 8),
]

export function searchCuratedAudio(query: string, limit = 20): OmniItem[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    return CURATED_AUDIO_CLIPS.slice(0, limit).map(clipToOmniItem)
  }
  const tokens = q.split(/\s+/).filter(Boolean)
  const scored = CURATED_AUDIO_CLIPS.map((clip) => {
    const hay = `${clip.title} ${clip.artist} ${clip.tags.join(' ')} ${clip.category}`.toLowerCase()
    let score = 0
    for (const t of tokens) {
      if (hay.includes(t)) score += t.length > 3 ? 3 : 2
    }
    return { clip, score }
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  const hits = scored.length ? scored.map((r) => r.clip) : CURATED_AUDIO_CLIPS
  return hits.slice(0, limit).map(clipToOmniItem)
}
