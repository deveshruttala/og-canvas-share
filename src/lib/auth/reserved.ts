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
