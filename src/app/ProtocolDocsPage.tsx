import { Link } from 'react-router-dom'

export function ProtocolDocsPage() {
  return (
    <div className="min-h-[100dvh] bg-[#050508] px-6 py-12 text-white">
      <article className="prose prose-invert mx-auto max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#beee1d]">Open protocol</p>
        <h1 className="text-4xl font-black">Wall Live Protocol</h1>
        <p className="text-neutral-400">
          An open spec for embedding live personal content anywhere. Version <code>walllive/v1</code>.
        </p>

        <h2 className="mt-10 text-xl font-bold">Discovery</h2>
        <pre className="rounded-xl bg-black/50 p-4 text-sm">{`GET /u/:username/.well-known/walllive
GET /w/:widgetId/.well-known/walllive`}</pre>

        <h2 className="mt-8 text-xl font-bold">Example response</h2>
        <pre className="overflow-x-auto rounded-xl bg-black/50 p-4 text-xs">{`{
  "version": "1.0",
  "subject": { "kind": "wall", "id": "jaswanth", "title": "jaswanth's wall" },
  "renders": {
    "image_png": "https://wall.app/u/jaswanth.png",
    "embed_html": "https://wall.app/embed/jaswanth",
    "data_json": "https://wall.app/u/jaswanth.json"
  },
  "streams": { "sse": "https://wall.app/u/jaswanth/events" }
}`}</pre>

        <h2 className="mt-8 text-xl font-bold">Web Component</h2>
        <pre className="rounded-xl bg-black/50 p-4 text-sm">{`<wall-live src="https://wall.app/u/jaswanth"></wall-live>
<script type="module" src="/c/wall-live.js"></script>`}</pre>

        <h2 className="mt-8 text-xl font-bold">JS client</h2>
        <pre className="rounded-xl bg-black/50 p-4 text-sm">{`npm install @wall/live-client
import { connectWall } from '@wall/live-client'
const wall = await connectWall('jaswanth')
wall.onUpdate((doc) => render(doc))`}</pre>

        <h2 className="mt-8 text-xl font-bold">CLI</h2>
        <pre className="rounded-xl bg-black/50 p-4 text-sm">npx wall-live jaswanth</pre>

        <p className="mt-10 text-sm text-neutral-500">
          <Link to="/widgets" className="text-[#beee1d]">Browse widgets</Link>
          {' · '}
          <Link to="/edit" className="text-[#beee1d]">Open editor</Link>
        </p>
      </article>
    </div>
  )
}
