import { getIntegrationKey } from '@/lib/integration-keys'

export type StravaActivity = {
  id: number
  name: string
  type: string
  distance: number
  movingTime: number
  startDate: string
}

export async function fetchStravaRecentActivities(limit = 4): Promise<StravaActivity[]> {
  const token = getIntegrationKey('strava')
  if (!token) throw new Error('Connect Strava access token in Connections')

  const res = await fetch(`/wall-data-api/strava/athlete/activities?per_page=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Strava error (${res.status})`)

  const data = (await res.json()) as Array<{
    id: number
    name: string
    type: string
    distance: number
    moving_time: number
    start_date: string
  }>

  return data.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    distance: a.distance,
    movingTime: a.moving_time,
    startDate: a.start_date,
  }))
}

export function formatStravaDistance(meters: number): string {
  const km = meters / 1000
  return km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(meters)} m`
}

export function formatStravaDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  return `${m} min`
}
