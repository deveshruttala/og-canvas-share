import type { CSSProperties } from 'react'

export type LandingSampleId = 'devesh' | 'wall-app' | 'fitflow' | 'studio-nova' | 'cafe-atlas'

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
    description: 'Showcase the app itself — hero CTA, feature chips, and a live canvas mock.',
    canvasClass: 'wall-sample-wall-app',
    tiles: [
      {
        id: 'cta',
        kind: 'cta',
        style: { left: '5%', top: '8%', width: '52%', transform: 'rotate(-1deg)' },
        kicker: 'Wall · living canvas',
        title: 'Your wall, everywhere.',
        body: 'One URL for bio, README, and embeds. Drag widgets, pick themes, share in one click.',
        chips: ['Free to start', '1600×1000', 'Offline-ready'],
      },
      {
        id: 'widget-mock',
        kind: 'widget',
        style: { left: '62%', top: '6%', width: '34%', transform: 'rotate(2deg)' },
        kicker: 'Live preview',
        title: 'Widgets that sync',
        body: 'Spotify · GitHub · weather · links',
        tag: 'Editor',
      },
      {
        id: 'f1',
        kind: 'feature',
        style: { left: '8%', top: '58%', width: '24%', transform: 'rotate(2deg)' },
        title: 'Drag & drop',
        body: 'Notes, images, QR, embeds',
      },
      {
        id: 'f2',
        kind: 'feature',
        style: { left: '34%', top: '62%', width: '24%', transform: 'rotate(-4deg)' },
        title: '22+ themes',
        body: 'Corkboard to neon',
      },
      {
        id: 'f3',
        kind: 'feature',
        style: { left: '60%', top: '55%', width: '24%', transform: 'rotate(1deg)' },
        title: 'Share anywhere',
        body: 'README · bio · email',
      },
      {
        id: 'qr',
        kind: 'qr',
        style: { left: '78%', top: '68%', width: '18%', transform: 'rotate(-2deg)' },
        url: 'wall.app/you',
      },
      {
        id: 'stat',
        kind: 'stat',
        style: { left: '86%', top: '38%', width: '12%', transform: 'rotate(5deg)' },
        stat: '∞',
        statLabel: 'layouts',
      },
    ],
  },
  {
    id: 'fitflow',
    handle: 'fitflow',
    label: 'Fitness coach',
    tagline: 'Programs · stats · booking',
    description: 'Workout board with schedule stickies, progress, and a bold energy palette.',
    canvasClass: 'wall-sample-fitflow',
    tiles: [
      {
        id: 'hero',
        kind: 'hero',
        style: { left: '5%', top: '10%', width: '40%', transform: 'rotate(-2deg)' },
        kicker: 'FitFlow Studio',
        title: 'Stronger every session',
        body: 'HIIT · strength · mobility — book your next class on the canvas.',
        chips: ['Mon 6am HIIT', 'Wed lift', 'Sat yoga'],
      },
      {
        id: 'stat',
        kind: 'stat',
        className: 'wall-tile-stat-ring',
        style: { left: '50%', top: '8%', width: '18%', transform: 'rotate(3deg)' },
        stat: '87%',
        statLabel: 'weekly goal',
      },
      {
        id: 'schedule',
        kind: 'schedule',
        style: { left: '72%', top: '6%', width: '24%', transform: 'rotate(-3deg)' },
        title: 'This week',
        body: 'Tue · Legs\nThu · Core\nSun · Run club',
      },
      {
        id: 'visual',
        kind: 'visual',
        style: { left: '48%', top: '42%', width: '28%', transform: 'rotate(2deg)' },
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?w=520&q=80',
        tag: 'Train',
      },
      {
        id: 'sticky',
        kind: 'sticky',
        style: { left: '8%', top: '58%', width: '26%', transform: 'rotate(5deg)' },
        title: 'Hydrate!',
        body: '3L water · 8h sleep',
        accent: 'light-blue',
      },
      {
        id: 'link',
        kind: 'link',
        style: { left: '78%', top: '52%', width: '20%', transform: 'rotate(-4deg)' },
        kicker: 'Book',
        title: '1:1 coaching',
        url: 'fitflow.app/book',
      },
      {
        id: 'stat2',
        kind: 'stat',
        style: { left: '62%', top: '72%', width: '16%', transform: 'rotate(-1deg)' },
        stat: '12',
        statLabel: 'day streak',
      },
    ],
  },
  {
    id: 'studio-nova',
    handle: 'studio-nova',
    label: 'Design studio',
    tagline: 'Portfolio · case studies',
    description: 'Minimal cream board with angled project cards and a calm freelance CTA.',
    canvasClass: 'wall-sample-studio',
    tiles: [
      {
        id: 'hero',
        kind: 'hero',
        style: { left: '6%', top: '12%', width: '36%', transform: 'rotate(-1deg)' },
        kicker: 'Studio Nova',
        title: 'Brand & product design',
        body: 'Identity systems, design systems, and launch-ready UI for startups.',
        chips: ['Figma', 'Motion', 'Design systems'],
      },
      {
        id: 'v1',
        kind: 'visual',
        style: { left: '46%', top: '8%', width: '22%', transform: 'rotate(4deg)' },
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
        tag: 'Fintech',
      },
      {
        id: 'v2',
        kind: 'visual',
        style: { left: '72%', top: '18%', width: '22%', transform: 'rotate(-5deg)' },
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
        tag: 'SaaS',
      },
      {
        id: 'link',
        kind: 'link',
        style: { left: '44%', top: '52%', width: '30%', transform: 'rotate(-2deg)' },
        kicker: 'Case study',
        title: 'Orbit — rebrand',
        body: 'From legacy ERP to a crisp product story in 6 weeks.',
        url: 'studionova.design/orbit',
      },
      {
        id: 'sticky',
        kind: 'sticky',
        style: { left: '8%', top: '62%', width: '24%', transform: 'rotate(6deg)' },
        title: 'Open Aug 2026',
        body: '2 slots · brand + web',
        accent: 'light-violet',
      },
      {
        id: 'stat',
        kind: 'stat',
        style: { left: '76%', top: '58%', width: '18%', transform: 'rotate(2deg)' },
        stat: '48',
        statLabel: 'projects',
      },
      {
        id: 'qr',
        kind: 'qr',
        style: { left: '78%', top: '78%', width: '16%', transform: 'rotate(-3deg)' },
        url: 'wall.app/studio-nova',
      },
    ],
  },
  {
    id: 'cafe-atlas',
    handle: 'cafe-atlas',
    label: 'Local café',
    tagline: 'Menu · hours · vibe',
    description: 'Warm hospitality layout — specials, hours, and a reservation link at a glance.',
    canvasClass: 'wall-sample-cafe',
    tiles: [
      {
        id: 'hero',
        kind: 'hero',
        style: { left: '5%', top: '8%', width: '42%', transform: 'rotate(-2deg)' },
        kicker: 'Café Atlas',
        title: 'Single origin · slow pour',
        body: 'Roasted in-house. Pastries baked at dawn. Dogs welcome on the patio.',
        chips: ['7am–6pm', 'WiFi', 'Vinyl afternoons'],
      },
      {
        id: 'menu1',
        kind: 'menu',
        style: { left: '52%', top: '6%', width: '22%', transform: 'rotate(3deg)' },
        title: 'Flat white',
        body: '$4.50 · oat +$0.50',
      },
      {
        id: 'menu2',
        kind: 'menu',
        style: { left: '76%', top: '14%', width: '20%', transform: 'rotate(-4deg)' },
        title: 'Almond croissant',
        body: 'Today until 11am',
      },
      {
        id: 'visual',
        kind: 'visual',
        style: { left: '50%', top: '48%', width: '30%', transform: 'rotate(1deg)' },
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=520&q=80',
        tag: 'Fresh roast',
      },
      {
        id: 'polaroid',
        kind: 'polaroid',
        style: { left: '8%', top: '55%', width: '22%', transform: 'rotate(-6deg)' },
        title: '@cafeatlas',
        body: 'Follow for daily specials',
      },
      {
        id: 'schedule',
        kind: 'schedule',
        style: { left: '82%', top: '42%', width: '16%', transform: 'rotate(2deg)' },
        title: 'Hours',
        body: 'Mon–Fri 7–6\nSat 8–5\nSun 9–4',
      },
      {
        id: 'link',
        kind: 'link',
        style: { left: '34%', top: '72%', width: '32%', transform: 'rotate(-2deg)' },
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
