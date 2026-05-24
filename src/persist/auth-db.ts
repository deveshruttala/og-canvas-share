import { db, type LocalSession, type LocalUser } from '@/persist/db'

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function findUserByUsername(username: string): Promise<LocalUser | undefined> {
  return db.users.where('username').equals(username).first()
}

export async function getUserById(id: string): Promise<LocalUser | undefined> {
  return db.users.get(id)
}

export async function insertLocalUser(user: LocalUser): Promise<void> {
  await db.users.put(user)
}

export async function createLocalSession(userId: string): Promise<{ token: string }> {
  const token = crypto.randomUUID()
  const session: LocalSession = {
    token,
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  }
  await db.sessions.put(session)
  return { token }
}

export async function getValidSession(token: string): Promise<LocalSession | undefined> {
  const session = await db.sessions.get(token)
  if (!session) return undefined
  if (session.expiresAt < Date.now()) {
    await db.sessions.delete(token)
    return undefined
  }
  return session
}

export async function deleteLocalSession(token: string): Promise<void> {
  await db.sessions.delete(token)
}
