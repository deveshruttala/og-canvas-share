export type GitHubUserStats = {
  login: string
  name: string | null
  avatarUrl: string
  bio: string | null
  publicRepos: number
  followers: number
  following: number
  htmlUrl: string
  createdAt: string
}

export function githubContributionChartUrl(username: string): string {
  return `https://ghchart.rshields.org/${encodeURIComponent(username)}`
}

export async function fetchGitHubUserStats(username: string): Promise<GitHubUserStats> {
  const login = username.trim().replace(/^@/, '')
  if (!login) throw new Error('GitHub username required')

  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'WallCanvas/1.0',
    },
  })

  if (res.status === 404) throw new Error(`User "${login}" not found`)
  if (!res.ok) throw new Error(`GitHub API error (${res.status})`)

  const data = (await res.json()) as {
    login: string
    name: string | null
    avatar_url: string
    bio: string | null
    public_repos: number
    followers: number
    following: number
    html_url: string
    created_at: string
  }

  return {
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    publicRepos: data.public_repos,
    followers: data.followers,
    following: data.following,
    htmlUrl: data.html_url,
    createdAt: data.created_at,
  }
}
