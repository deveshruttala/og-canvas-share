chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ linkedin: true, twitter: false, reddit: false })
})
