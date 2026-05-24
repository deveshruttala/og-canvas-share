/** Wall Live extension — content script. Replaces stale OG previews for wall.app links. */

const WALL_RE = /https?:\/\/(?:[\w.-]+\.)?wall\.app\/(?:u|w)\/[\w-]+/gi

async function refreshPreview(anchor: HTMLAnchorElement) {
  const href = anchor.href
  if (!href.match(/wall\.app\/(u|w)\//)) return

  const enabled = await chrome.storage.sync.get(['linkedin', 'twitter', 'reddit'])
  const host = location.hostname.replace(/^www\./, '')
  if (host.includes('linkedin.com') && enabled.linkedin === false) return
  if (host.includes('twitter.com') && enabled.twitter === false) return
  if (host.includes('reddit.com') && enabled.reddit === false) return

  const pngUrl = href.replace(/\/$/, '') + '.png?t=' + Date.now()
  let img = anchor.querySelector('img[data-wall-live]') as HTMLImageElement | null
  if (!img) {
    img = document.createElement('img')
    img.dataset.wallLive = '1'
    img.style.maxWidth = '100%'
    img.style.borderRadius = '8px'
    anchor.appendChild(img)
  }
  img.src = pngUrl
  img.alt = 'Live wall preview'
}

function scan(root: ParentNode = document.body) {
  root.querySelectorAll('a[href*="wall.app"]').forEach((a) => {
    void refreshPreview(a as HTMLAnchorElement)
  })
}

scan()

const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    m.addedNodes.forEach((node) => {
      if (node instanceof HTMLAnchorElement) void refreshPreview(node)
      else if (node instanceof HTMLElement) scan(node)
    })
  }
})

observer.observe(document.body, { childList: true, subtree: true })

setInterval(() => scan(), 60_000)
