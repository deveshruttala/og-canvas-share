export const RESERVED_USERNAMES = new Set([
  'admin',
  'api',
  'auth',
  'edit',
  'embed',
  'u',
  'w',
  'login',
  'signup',
  'settings',
  'local',
  'widgets',
  'docs',
  'demo',
])

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9-]{3,24}$/.test(username) && !RESERVED_USERNAMES.has(username)
}

export function usernameValidationError(username: string): string | null {
  const name = username.toLowerCase().trim()
  if (!name) return 'Choose a username'
  if (RESERVED_USERNAMES.has(name)) {
    return `"${name}" is reserved — pick another (e.g. devesh, alex-dev)`
  }
  if (!/^[a-z0-9-]{3,24}$/.test(name)) {
    return 'Use 3–24 characters: lowercase letters, numbers, and hyphens only'
  }
  return null
}
