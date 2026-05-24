import { embedUrl, pngUrl, shareBaseUrl } from '@/lib/share-urls'
import type { ShareSubject } from '@/lib/share-urls'

export type EmbedSnippet = {
  id: string
  platform: string
  label: string
  language: string
  code: string
}

export function buildEmbedSnippets(subject: ShareSubject, origin?: string): EmbedSnippet[] {
  const url = shareBaseUrl(subject, origin)
  const embed = embedUrl(subject, origin)
  const png = pngUrl(subject, undefined, origin)
  const pngOg = pngUrl(subject, { og: true }, origin)
  const pngSquare = pngUrl(subject, { fmt: 'square' }, origin)
  const pngStory = pngUrl(subject, { fmt: 'story' }, origin)
  const pngThumb = pngUrl(subject, { fmt: 'thumb' }, origin)
  const pngEmail = pngUrl(subject, { w: 400 }, origin)
  const wallLive = `<wall-live src="${url}"></wall-live>\n<script type="module" src="${origin ?? ''}/c/wall-live.js"></script>`

  return [
    {
      id: 'github-readme',
      platform: 'GitHub',
      label: 'README',
      language: 'markdown',
      code: `![My Wall](${png})`,
    },
    {
      id: 'devto',
      platform: 'Dev.to',
      label: 'Embed',
      language: 'liquid',
      code: `{% embed ${url} %}`,
    },
    {
      id: 'notion',
      platform: 'Notion',
      label: '/embed block',
      language: 'text',
      code: embed,
    },
    {
      id: 'obsidian',
      platform: 'Obsidian',
      label: 'Wall plugin',
      language: 'markdown',
      code: `![[wall:${subject.kind === 'wall' ? subject.id : subject.id}]]`,
    },
    {
      id: 'hashnode',
      platform: 'Hashnode',
      label: 'Embed',
      language: 'markdown',
      code: `%[${url}]`,
    },
    {
      id: 'substack',
      platform: 'Substack',
      label: 'HTML block',
      language: 'html',
      code: `<iframe src="${embed}" width="100%" height="500" frameborder="0"></iframe>`,
    },
    {
      id: 'ghost',
      platform: 'Ghost',
      label: 'HTML card',
      language: 'html',
      code: `<iframe src="${embed}" style="width:100%;aspect-ratio:16/10;border:0;border-radius:12px"></iframe>`,
    },
    {
      id: 'bear',
      platform: 'Bear / Mataroa',
      label: 'Image',
      language: 'markdown',
      code: `<img src="${png}" alt="my wall" />`,
    },
    {
      id: 'wordpress',
      platform: 'WordPress',
      label: 'Embed block',
      language: 'text',
      code: url,
    },
    {
      id: 'webflow',
      platform: 'Webflow',
      label: 'Custom embed',
      language: 'html',
      code: wallLive,
    },
    {
      id: 'email',
      platform: 'Email signature',
      label: 'Gmail / Outlook',
      language: 'html',
      code: `<a href="${url}"><img src="${pngEmail}" alt="" style="max-width:400px;border-radius:12px" /></a>`,
    },
    {
      id: 'slack',
      platform: 'Slack',
      label: 'Unfurl URL',
      language: 'text',
      code: url,
    },
    {
      id: 'discord',
      platform: 'Discord',
      label: 'Bot command',
      language: 'text',
      code: `/wall ${subject.kind === 'wall' ? subject.id : subject.id}`,
    },
    {
      id: 'linear',
      platform: 'Linear',
      label: 'Description unfurl',
      language: 'text',
      code: url,
    },
    {
      id: 'readcv',
      platform: 'Read.cv / Polywork',
      label: 'Profile link',
      language: 'text',
      code: url,
    },
    {
      id: 'html',
      platform: 'Personal HTML',
      label: 'Web Component',
      language: 'html',
      code: wallLive,
    },
    {
      id: 'raw-png',
      platform: 'Anywhere',
      label: 'Raw PNG',
      language: 'text',
      code: png,
    },
    {
      id: 'og-meta',
      platform: 'Open Graph',
      label: '<head> tags',
      language: 'html',
      code: `<meta property="og:image" content="${pngOg}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">`,
    },
    {
      id: 'linkedin-og',
      platform: 'LinkedIn',
      label: '1200×630 card',
      language: 'text',
      code: pngOg,
    },
    {
      id: 'instagram-square',
      platform: 'Instagram',
      label: '1080×1080',
      language: 'text',
      code: pngSquare,
    },
    {
      id: 'instagram-story',
      platform: 'Instagram / TikTok',
      label: '1080×1920 story',
      language: 'text',
      code: pngStory,
    },
    {
      id: 'discord-thumb',
      platform: 'Discord / Slack',
      label: '800×800 thumb',
      language: 'text',
      code: pngThumb,
    },
  ]
}
