/** <wall-live> Web Component — SSE with PNG polling fallback */
class WallLive extends HTMLElement {
  connectedCallback() {
    const src = this.getAttribute('src')
    if (!src) return
    this.style.display = 'block'
    this.style.minHeight = '200px'
    this.innerHTML = '<p style="color:#737373;font:12px system-ui">Connecting…</p>'

    const base = src.replace(/\/$/, '')
    const jsonUrl = base + '.json'
    const pngUrl = base + '.png'
    const eventsUrl = base + '/events'
    let es = null
    let pollTimer = null

    const renderPng = () => {
      const img = document.createElement('img')
      img.src = pngUrl + '?t=' + Date.now()
      img.alt = 'Live wall'
      img.style.width = '100%'
      img.style.borderRadius = '12px'
      this.replaceChildren(img)
    }

    const renderJson = (data) => {
      const pre = document.createElement('pre')
      pre.style.cssText =
        'font:11px ui-monospace;padding:12px;background:#0a0a0f;color:#fafafa;border-radius:12px;overflow:auto;max-height:480px'
      pre.textContent = JSON.stringify(data, null, 2)
      this.replaceChildren(pre)
    }

    fetch(jsonUrl)
      .then((r) => r.json())
      .then(renderJson)
      .catch(renderPng)

    try {
      es = new EventSource(eventsUrl)
      es.addEventListener('snapshot', (e) => {
        try {
          renderJson(JSON.parse(e.data))
        } catch {
          renderPng()
        }
      })
      es.addEventListener('update', () => {
        fetch(jsonUrl)
          .then((r) => r.json())
          .then(renderJson)
          .catch(renderPng)
      })
      es.onerror = () => {
        if (es) es.close()
        es = null
        if (!pollTimer) pollTimer = setInterval(renderPng, 60000)
      }
    } catch {
      pollTimer = setInterval(renderPng, 60000)
    }

    this._wallLiveCleanup = () => {
      if (es) es.close()
      if (pollTimer) clearInterval(pollTimer)
    }
  }

  disconnectedCallback() {
    this._wallLiveCleanup?.()
  }
}

if (!customElements.get('wall-live')) {
  customElements.define('wall-live', WallLive)
}
