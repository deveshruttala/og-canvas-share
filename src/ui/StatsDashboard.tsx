import { useEffect, useState } from 'react'
import { fetchStats, type StatsSummary } from '@/lib/stats-client'
import type { ShareSubject } from '@/lib/share-urls'

export function StatsDashboard({ subject }: { subject: ShareSubject }) {
  const [stats, setStats] = useState<StatsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const data = await fetchStats(subject)
      setStats(data)
      setLoading(false)
    })()
  }, [subject.kind, subject.id])

  if (loading) return <p className="text-sm text-neutral-500">Loading stats…</p>
  if (!stats) return <p className="text-sm text-neutral-500">No stats yet.</p>

  const maxHourly = Math.max(1, ...stats.hourly.map((h) => h.views + h.embeds))

  return (
    <div className="space-y-4 text-sm">
      <p className="text-[10px] uppercase tracking-widest text-neutral-500">Privacy-first · counts only · no cookies</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-2xl font-black text-[#beee1d]">{stats.views}</p>
          <p className="text-xs text-neutral-500">Views (30d)</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-2xl font-black text-white">{stats.embeds}</p>
          <p className="text-xs text-neutral-500">Embed views</p>
        </div>
      </div>

      {stats.hourly.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold text-neutral-400">Hourly activity</p>
          <div className="flex h-16 items-end gap-0.5">
            {stats.hourly.slice(-48).map((h) => (
              <div
                key={h.hour}
                title={`${h.hour}: ${h.views} views`}
                className="flex-1 rounded-t bg-[#beee1d]/60"
                style={{ height: `${((h.views + h.embeds) / maxHourly) * 100}%`, minHeight: 2 }}
              />
            ))}
          </div>
        </div>
      )}

      {Object.keys(stats.reactions).length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold text-neutral-400">Reactions</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.reactions).map(([emoji, count]) => (
              <span key={emoji} className="rounded-full bg-white/5 px-2 py-1 text-xs">
                {emoji} {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.topReferrers.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold text-neutral-400">Top referrers</p>
          <ul className="space-y-1 text-xs text-neutral-400">
            {stats.topReferrers.map((r) => (
              <li key={r.host} className="flex justify-between">
                <span>{r.host}</span>
                <span>{r.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
