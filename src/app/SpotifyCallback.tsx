import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { completeSpotifyLogin } from '@/lib/spotify-auth'

export default function SpotifyCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const err = params.get('error')
    if (err) {
      setError(err)
      return
    }
    if (!code) {
      setError('Missing authorization code')
      return
    }
    void completeSpotifyLogin(code)
      .then(() => navigate('/edit', { replace: true }))
      .catch((e) => setError(e instanceof Error ? e.message : 'Spotify login failed'))
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 p-6 text-white">
      {error ? (
        <>
          <p className="text-sm text-red-300">{error}</p>
          <Link to="/edit" className="text-sm text-[#beee1d] underline">
            Back to editor
          </Link>
        </>
      ) : (
        <p className="text-sm text-neutral-400">Connecting Spotify…</p>
      )}
    </div>
  )
}
