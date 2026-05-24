export type AuthUser = { id: string; username: string; email?: string }

export type AuthResult = { user: AuthUser; token: string }

export interface AuthBackend {
  signup(username: string, password: string, email?: string): Promise<AuthResult>
  login(username: string, password: string): Promise<AuthResult>
  me(token: string | null): Promise<AuthUser | null>
  logout(token: string | null): Promise<void>
}
