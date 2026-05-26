import type { CSSProperties } from 'react'

export type LandingSampleId = 'devesh' | 'wall-app' | 'loopline' | 'maya-jord' | 'cafe-atlas'

export type LandingTileKind =
  | 'hero'
  | 'text'
  | 'github'
  | 'visual'
  | 'music'
  | 'link'
  | 'stat'
  | 'qr'
  | 'sticky'
  | 'cta'
  | 'feature'
  | 'widget'
  | 'schedule'
  | 'menu'
  | 'polaroid'

export type LandingTile = {
  id: string
  kind: LandingTileKind
  className?: string
  style: CSSProperties
  kicker?: string
  title?: string
  body?: string
  chips?: string[]
  foot?: string
  url?: string
  stat?: string
  statLabel?: string
  image?: string
  tag?: string
  bars?: number[]
  graphCells?: number
  accent?: string
}

export type LandingSample = {
  id: LandingSampleId
  handle: string
  label: string
  tagline: string
  description: string
  canvasClass: string
  tiles: LandingTile[]
}

export const LANDING_SAMPLES: LandingSample[] = [
  {
    id: 'devesh',
    handle: 'devesh',
    label: 'Creator profile',
    tagline: 'Bio · links · live widgets',
    description: 'A personal corner of the internet — scattered like a real noticeboard, not a spreadsheet.',
    canvasClass: 'wall-sample-devesh',
    tiles: [
      {
        id: 'hero',
        kind: 'hero',
        style: { left: '4%', top: '6%', width: '38%', transform: 'rotate(-2.5deg)' },
        kicker: 'Profile',
        title: "Hey, I'm Devesh",
        body: 'Builder crafting living noticeboards — one canvas, every embed stays in sync.',
        chips: ['React', 'Design', 'Indie web', 'Open source'],
      },
      {
        id: 'github',
        kind: 'github',
        className: 'wall-tile-tilt-r',
        style: { left: '44%', top: '4%', width: '32%', transform: 'rotate(1.5deg)' },
        kicker: 'GitHub',
        title: 'devesh/wall',
        foot: '★ 842 · 12 repos · shipping weekly',
        graphCells: 48,
      },
      {
        id: 'visual',
        kind: 'visual',
        style: { left: '78%', top: '8%', width: '20%', transform: 'rotate(4deg)' },
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=480&q=80',
        tag: 'Building',
      },
      {
        id: 'music',
        kind: 'music',
        style: { left: '6%', top: '52%', width: '34%', transform: 'rotate(-1deg)' },
        kicker: 'Now playing',
        title: 'Midnight Canvas',
        bars: [3, 6, 4, 8, 5, 7, 4, 6, 5, 8],
      },
      {
        id: 'sticky',
        kind: 'sticky',
        style: { left: '58%', top: '38%', width: '22%', transform: 'rotate(6deg)' },
        title: 'Ship the wall v2',
        body: 'QR overlays · text boxes · themes',
        accent: 'yellow',
      },
      {
        id: 'link',
        kind: 'link',
        style: { left: '42%', top: '58%', width: '28%', transform: 'rotate(-3deg)' },
        kicker: 'Featured',
        title: 'Portfolio & writes',
        body: 'Experiments, essays, and open-source tools.',
        url: 'github.com/devesh',
      },
      {
        id: 'stat',
        kind: 'stat',
        style: { left: '74%', top: '48%', width: '14%', transform: 'rotate(-2deg)' },
        stat: '2.4k',
        statLabel: 'views',
      },
      {
        id: 'qr',
        kind: 'qr',
        style: { left: '82%', top: '72%', width: '14%', transform: 'rotate(3deg)' },
        url: 'wall.app/devesh',
      },
    ],
  },
  {
    id: 'wall-app',
    handle: 'wall',
    label: 'Product launch',
    tagline: 'Ad · landing · embed',
    description: 'The site selling itself — hero CTA, live widget mock, and feature callouts on one canvas.',
    canvasClass: 'wall-sample-wall-app',
    tiles: [
      {
        id: 'cta',
        kind: 'cta',
        style: { left: '4%', top: '7%', width: '54%', transform: 'rotate(-1.5deg)' },
        kicker: 'Wall · living canvas',
        title: 'Your wall, everywhere.',
        body: 'One URL for bio, README, and embeds. Drag widgets, pick a theme, ship in a tweet.',
        chips: ['Free forever', '1600×1000', 'No signup demo'],
      },
      {
        id: 'widget-mock',
        kind: 'widget',
        style: { left: '63%', top: '5%', width: '33%', transform: 'rotate(2.5deg)' },
        kicker: 'Live preview',
        title: 'Widgets that sync',
        body: 'Spotify · GitHub · weather · links',
        tag: 'Editor',
      },
      {
        id: 'sticky-ship',
        kind: 'sticky',
        style: { left: '60%', top: '36%', width: '20%', transform: 'rotate(-5deg)' },
        title: 'Ship in 60s',
        body: 'Pick a theme. Drop a QR. Done.',
        accent: 'yellow',
      },
      {
        id: 'f1',
        kind: 'feature',
        style: { left: '5%', top: '58%', width: '24%', transform: 'rotate(3deg)' },
        title: 'Drag & drop',
        body: 'Notes, images, QR, embeds',
      },
      {
        id: 'f2',
        kind: 'feature',
        style: { left: '31%', top: '64%', width: '24%', transform: 'rotate(-3deg)' },
        title: '22+ themes',
        body: 'Corkboard to neon to kraft',
      },
      {
        id: 'f3',
        kind: 'feature',
        style: { left: '57%', top: '60%', width: '24%', transform: 'rotate(2deg)' },
        title: 'Share anywhere',
        body: 'README · bio · email · embed',
      },
      {
        id: 'qr',
        kind: 'qr',
        style: { left: '82%', top: '54%', width: '15%', transform: 'rotate(-4deg)' },
        url: 'wall.app/try',
      },
      {
        id: 'stat',
        kind: 'stat',
        style: { left: '83%', top: '82%', width: '14%', transform: 'rotate(4deg)' },
        stat: '∞',
        statLabel: 'layouts',
      },
    ],
  },
  {
    id: 'loopline',
    handle: 'loopline',
    label: 'Album drop',
    tagline: 'Tracklist · tour · listen',
    description: 'A musician’s album board — cover art, tracklist, tour dates, and a one-tap listen QR.',
    canvasClass: 'wall-sample-loopline',
    tiles: [
      {
        id: 'hero',
        kind: 'hero',
        style: { left: '4%', top: '7%', width: '38%', transform: 'rotate(-2deg)' },
        kicker: 'Loopline · New LP',
        title: 'Drift — out now',
        body: 'Ten tracks recorded across four cities. Vinyl ships in June.',
        chips: ['Synth-pop', 'Vinyl 180g', 'Tour 2026'],
      },
      {
        id: 'cover',
        kind: 'visual',
        style: { left: '44%', top: '5%', width: '24%', transform: 'rotate(3deg)' },
        image: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=520&q=80',
        tag: 'Drift LP',
      },
      {
        id: 'music',
        kind: 'music',
        style: { left: '70%', top: '8%', width: '26%', transform: 'rotate(-3deg)' },
        kicker: 'Now spinning',
        title: 'Northern Lights',
        bars: [4, 7, 3, 9, 5, 8, 4, 7, 6, 9, 5, 7],
      },
      {
        id: 'track1',
        kind: 'menu',
        style: { left: '6%', top: '54%', width: '20%', transform: 'rotate(-1deg)' },
        title: '01 · Northern Lights',
        body: '3:42 · single',
      },
      {
        id: 'track2',
        kind: 'menu',
        style: { left: '28%', top: '58%', width: '20%', transform: 'rotate(4deg)' },
        title: '04 · Tape Over',
        body: '4:18 · feat. Nyra',
      },
      {
        id: 'tour',
        kind: 'schedule',
        style: { left: '50%', top: '48%', width: '22%', transform: 'rotate(-2deg)' },
        title: 'Tour 2026',
        body: 'Jun 12 · NYC\nJun 18 · LA\nJun 25 · CDMX',
      },
      {
        id: 'sticky-vinyl',
        kind: 'sticky',
        style: { left: '74%', top: '46%', width: '22%', transform: 'rotate(5deg)' },
        title: 'Vinyl pre-order',
        body: 'Numbered. 500 copies. Gone fast.',
        accent: 'light-violet',
      },
      {
        id: 'stat',
        kind: 'stat',
        style: { left: '72%', top: '74%', width: '14%', transform: 'rotate(-3deg)' },
        stat: '1.2M',
        statLabel: 'streams',
      },
      {
        id: 'qr',
        kind: 'qr',
        style: { left: '88%', top: '72%', width: '10%', transform: 'rotate(2deg)' },
        url: 'loopline.fm',
      },
    ],
  },
  {
    id: 'maya-jord',
    handle: 'maya-jord',
    label: 'Save the date',
    tagline: 'Invite · RSVP · registry',
    description: 'A wedding invite as a canvas — polaroids, dress code, RSVP QR, all on one cream-paper board.',
    canvasClass: 'wall-sample-maya',
    tiles: [
      {
        id: 'hero',
        kind: 'hero',
        style: { left: '5%', top: '8%', width: '40%', transform: 'rotate(-2deg)' },
        kicker: 'Save the date',
        title: 'Maya & Jordan',
        body: 'Saturday, August 16, 2026 · Sonoma vineyard · sunset ceremony, dinner under the lights.',
        chips: ['Garden elegant', 'Outdoor', 'Open bar'],
      },
      {
        id: 'pola-couple',
        kind: 'polaroid',
        style: { left: '48%', top: '6%', width: '20%', transform: 'rotate(4deg)' },
        image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&q=80',
        title: 'M + J',
        body: 'Iceland, 2024',
      },
      {
        id: 'venue',
        kind: 'visual',
        style: { left: '72%', top: '10%', width: '24%', transform: 'rotate(-3deg)' },
        image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=520&q=80',
        tag: 'The vineyard',
      },
      {
        id: 'schedule',
        kind: 'schedule',
        style: { left: '6%', top: '54%', width: '22%', transform: 'rotate(3deg)' },
        title: 'The day',
        body: '4:30 · Ceremony\n6:00 · Dinner\n9:00 · Dancing',
      },
      {
        id: 'sticky-dress',
        kind: 'sticky',
        style: { left: '30%', top: '60%', width: '22%', transform: 'rotate(-4deg)' },
        title: 'Dress code',
        body: 'Garden elegant — long dresses welcome, comfy shoes for the lawn.',
        accent: 'yellow',
      },
      {
        id: 'drink',
        kind: 'menu',
        style: { left: '54%', top: '50%', width: '20%', transform: 'rotate(2deg)' },
        title: 'Signature pour',
        body: 'Honey-lavender gin spritz',
      },
      {
        id: 'registry',
        kind: 'link',
        style: { left: '76%', top: '54%', width: '20%', transform: 'rotate(-2deg)' },
        kicker: 'Registry',
        title: 'A nest, not a list',
        url: 'mayajord.love/registry',
      },
      {
        id: 'pola-arch',
        kind: 'polaroid',
        style: { left: '34%', top: '78%', width: '20%', transform: 'rotate(-5deg)' },
        image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&q=80',
        title: 'The arch',
        body: 'Where we say I do',
      },
      {
        id: 'sticky-rsvp',
        kind: 'sticky',
        style: { left: '58%', top: '80%', width: '20%', transform: 'rotate(4deg)' },
        title: 'Scan to RSVP →',
        body: 'By July 1, please 💌',
        accent: 'light-violet',
      },
      {
        id: 'qr',
        kind: 'qr',
        style: { left: '82%', top: '80%', width: '12%', transform: 'rotate(3deg)' },
        url: 'mayajord.love/rsvp',
      },
    ],
  },
  {
    id: 'cafe-atlas',
    handle: 'cafe-atlas',
    label: 'Café menu',
    tagline: 'Menu · specials · hours',
    description: 'A chalkboard menu reimagined — daily specials, polaroids, and hours pinned like a real café board.',
    canvasClass: 'wall-sample-cafe',
    tiles: [
      {
        id: 'hero',
        kind: 'hero',
        style: { left: '4%', top: '6%', width: '40%', transform: 'rotate(-2deg)' },
        kicker: 'Café Atlas · today',
        title: 'Ethiopia Yirgacheffe',
        body: 'This week’s pour — bright, floral, honey finish. Roasted Monday in-house.',
        chips: ['7am–6pm', 'Patio open', 'Vinyl Fri'],
      },
      {
        id: 'menu-flat',
        kind: 'menu',
        style: { left: '48%', top: '5%', width: '22%', transform: 'rotate(3deg)' },
        title: 'Flat white',
        body: '$4.50 · oat +$0.50',
      },
      {
        id: 'menu-cort',
        kind: 'menu',
        style: { left: '74%', top: '7%', width: '22%', transform: 'rotate(-4deg)' },
        title: 'Cortado',
        body: '$4.00 · double shot',
      },
      {
        id: 'menu-crois',
        kind: 'menu',
        style: { left: '50%', top: '32%', width: '22%', transform: 'rotate(-2deg)' },
        title: 'Almond croissant',
        body: '$5.00 · til 11am',
      },
      {
        id: 'menu-toast',
        kind: 'menu',
        style: { left: '76%', top: '34%', width: '22%', transform: 'rotate(4deg)' },
        title: 'Avo toast',
        body: '$9 · sourdough, chili oil',
      },
      {
        id: 'sticky-special',
        kind: 'sticky',
        style: { left: '6%', top: '46%', width: '24%', transform: 'rotate(-5deg)' },
        title: 'Today only',
        body: 'Honey-lavender latte ☕ $5',
        accent: 'yellow',
      },
      {
        id: 'polaroid-art',
        kind: 'polaroid',
        style: { left: '34%', top: '54%', width: '20%', transform: 'rotate(5deg)' },
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80',
        title: 'Latte art',
        body: 'Sam, head barista',
      },
      {
        id: 'visual',
        kind: 'visual',
        style: { left: '58%', top: '58%', width: '24%', transform: 'rotate(1deg)' },
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=520&q=80',
        tag: 'Fresh roast',
      },
      {
        id: 'schedule',
        kind: 'schedule',
        style: { left: '84%', top: '58%', width: '14%', transform: 'rotate(-3deg)' },
        title: 'Hours',
        body: 'Mon–Fri 7–6\nSat 8–5\nSun 9–4',
      },
      {
        id: 'link',
        kind: 'link',
        style: { left: '6%', top: '78%', width: '24%', transform: 'rotate(2deg)' },
        kicker: 'Reserve',
        title: 'Table for two?',
        url: 'cafe-atlas.app/book',
      },
    ],
  },
]

export function getLandingSample(id: LandingSampleId): LandingSample {
  return LANDING_SAMPLES.find((s) => s.id === id) ?? LANDING_SAMPLES[0]
}
