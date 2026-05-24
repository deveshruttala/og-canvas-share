const keys = ['linkedin', 'twitter', 'reddit'] as const

for (const key of keys) {
  const el = document.getElementById(key) as HTMLInputElement
  chrome.storage.sync.get([key], (data) => {
    el.checked = data[key] !== false
  })
  el.addEventListener('change', () => {
    chrome.storage.sync.set({ [key]: el.checked })
  })
}
