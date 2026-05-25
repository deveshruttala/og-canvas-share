/** Sample URLs (Mixkit preview CDN) + synth vs sample layout sizes. */

export type SoundPadWave = 'sine' | 'square' | 'sawtooth' | 'triangle'

export type SoundPadData = {
  label?: string
  sound?: string
  frequency?: number
  wave?: SoundPadWave
}

export const SOUND_PAD_SAMPLES: Record<
  string,
  { label: string; subtitle: string; src: string; icon: string }
> = {
  applause: {
    label: 'Applause',
    subtitle: 'Crowd cheer',
    src: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
    icon: '👏',
  },
  rain: {
    label: 'Rain',
    subtitle: 'Gentle ambience',
    src: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
    icon: '🌧️',
  },
  bell: {
    label: 'Bell',
    subtitle: 'Soft chime',
    src: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
    icon: '🔔',
  },
  chime: {
    label: 'Wind chime',
    subtitle: 'Delicate tones',
    src: 'https://assets.mixkit.co/active_storage/sfx/2579/2579-preview.mp3',
    icon: '🎐',
  },
  notification: {
    label: 'Notification',
    subtitle: 'Quick pop',
    src: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
    icon: '📣',
  },
  success: {
    label: 'Success',
    subtitle: 'Positive ding',
    src: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
    icon: '✅',
  },
  drum: {
    label: 'Drum',
    subtitle: 'Percussion hit',
    src: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
    icon: '🥁',
  },
  laugh: {
    label: 'Laugh',
    subtitle: 'Comedy burst',
    src: 'https://assets.mixkit.co/active_storage/sfx/2592/2592-preview.mp3',
    icon: '😂',
  },
  error: {
    label: 'Error',
    subtitle: 'Buzz alert',
    src: 'https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3',
    icon: '❌',
  },
}

export function isSynthSoundPad(data: SoundPadData): boolean {
  if (data.sound && SOUND_PAD_SAMPLES[data.sound]) return false
  return true
}

export function getSoundPadSize(data: SoundPadData): { w: number; h: number } {
  return isSynthSoundPad(data) ? { w: 280, h: 220 } : { w: 260, h: 168 }
}

export function resolveSoundPadLabel(data: SoundPadData): string {
  if (data.sound && SOUND_PAD_SAMPLES[data.sound]) {
    return data.label ?? SOUND_PAD_SAMPLES[data.sound].label
  }
  return data.label ?? 'Synth Pad'
}

/** Older sound pads stored only label + frequency — map back to sample ids. */
export function legacySoundPadSampleId(data: SoundPadData): string | undefined {
  if (data.sound) return undefined
  const label = (data.label ?? '').trim().toLowerCase()
  const map: Record<string, string> = {
    applause: 'applause',
    rain: 'rain',
    bell: 'bell',
    'wind chime': 'chime',
    success: 'success',
    notification: 'notification',
    drum: 'drum',
    laugh: 'laugh',
    error: 'error',
  }
  return map[label]
}
