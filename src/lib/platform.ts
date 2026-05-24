export function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
}

export function modKeyLabel(): string {
  return isMac() ? '⌘' : 'Ctrl'
}
