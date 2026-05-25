import type { OmniItem } from '@/providers/types'

export type CuratedLink = {
  id: string
  title: string
  subtitle: string
  url: string
  icon: string
  keywords: string[]
}

export const CURATED_LINKS: CuratedLink[] = [
  { id: 'yt', title: 'YouTube', subtitle: 'Videos & music', url: 'https://www.youtube.com', icon: '▶️', keywords: ['youtube', 'video', 'watch'] },
  { id: 'spotify', title: 'Spotify', subtitle: 'Music streaming', url: 'https://open.spotify.com', icon: '🎵', keywords: ['spotify', 'music', 'playlist'] },
  { id: 'github', title: 'GitHub', subtitle: 'Code & projects', url: 'https://github.com', icon: '🐙', keywords: ['github', 'code', 'repo'] },
  { id: 'notion', title: 'Notion', subtitle: 'Notes & docs', url: 'https://www.notion.so', icon: '📓', keywords: ['notion', 'notes', 'docs'] },
  { id: 'figma', title: 'Figma', subtitle: 'Design files', url: 'https://www.figma.com', icon: '🎨', keywords: ['figma', 'design', 'ui'] },
  { id: 'twitter', title: 'X (Twitter)', subtitle: 'Social feed', url: 'https://x.com', icon: '𝕏', keywords: ['twitter', 'x', 'social'] },
  { id: 'instagram', title: 'Instagram', subtitle: 'Photos & reels', url: 'https://www.instagram.com', icon: '📷', keywords: ['instagram', 'photos'] },
  { id: 'linkedin', title: 'LinkedIn', subtitle: 'Professional network', url: 'https://www.linkedin.com', icon: '💼', keywords: ['linkedin', 'jobs'] },
  { id: 'reddit', title: 'Reddit', subtitle: 'Communities', url: 'https://www.reddit.com', icon: '🤖', keywords: ['reddit', 'forum'] },
  { id: 'discord', title: 'Discord', subtitle: 'Chat', url: 'https://discord.com', icon: '💬', keywords: ['discord', 'chat'] },
  { id: 'twitch', title: 'Twitch', subtitle: 'Live streams', url: 'https://www.twitch.tv', icon: '📺', keywords: ['twitch', 'stream'] },
  { id: 'soundcloud', title: 'SoundCloud', subtitle: 'Audio', url: 'https://soundcloud.com', icon: '☁️', keywords: ['soundcloud', 'audio'] },
  { id: 'vimeo', title: 'Vimeo', subtitle: 'Video hosting', url: 'https://vimeo.com', icon: '🎬', keywords: ['vimeo', 'video'] },
  { id: 'codepen', title: 'CodePen', subtitle: 'Front-end demos', url: 'https://codepen.io', icon: '💻', keywords: ['codepen', 'code'] },
  { id: 'calcom', title: 'Cal.com', subtitle: 'Book meetings', url: 'https://cal.com', icon: '📅', keywords: ['calendar', 'book', 'meet'] },
  { id: 'substack', title: 'Substack', subtitle: 'Newsletters', url: 'https://substack.com', icon: '📰', keywords: ['substack', 'newsletter'] },
  { id: 'medium', title: 'Medium', subtitle: 'Articles', url: 'https://medium.com', icon: '✍️', keywords: ['medium', 'blog'] },
  { id: 'producthunt', title: 'Product Hunt', subtitle: 'Launches', url: 'https://www.producthunt.com', icon: '🚀', keywords: ['product', 'startup'] },
]

export function curatedToItem(link: CuratedLink): OmniItem {
  return {
    id: `link-${link.id}`,
    kind: 'link',
    title: link.title,
    subtitle: link.subtitle,
    url: link.url,
    icon: link.icon,
    source: 'Quick links',
    payload: { url: link.url, title: link.title, description: link.subtitle },
  }
}

export function scoreLink(link: CuratedLink, q: string): number {
  const hay = `${link.title} ${link.subtitle} ${link.keywords.join(' ')}`.toLowerCase()
  let score = 0
  for (const t of q.split(/\s+/).filter(Boolean)) {
    if (link.title.toLowerCase().startsWith(t)) score += 4
    if (hay.includes(t)) score += 2
  }
  return score
}
