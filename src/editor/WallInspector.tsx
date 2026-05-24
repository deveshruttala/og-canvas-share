/**
 * Floating inspector HUD — rotation, layers, lock, delete, gradients & borders.
 */
import { useState } from 'react'
import { Lock, Unlock, ArrowDown, Link2, Palette, ExternalLink, Rocket } from 'lucide-react'
import { useEditor, useValue } from '@tldraw/editor'
import { WALL_FRAME_ID } from '@/editor/wall-editor-api'
import { getWallShapeKind, getWallShapeLabel, wallActions } from '@/editor/wall-actions'
import { createStandaloneWidget } from '@/lib/widget-store'
import { wallMetaToWidgetConfig } from '@/lib/widget-render'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/cn'

const GRADIENTS = [
  { id: 'midnight-neon', label: 'Midnight Neon', css: 'linear-gradient(135deg,#0f172a,#1e1b4b,#beee1d33)' },
  { id: 'toxic-cyan', label: 'Toxic Cyan', css: 'linear-gradient(135deg,#042f2e,#06b6d4,#22d3ee)' },
  { id: 'poison-gold', label: 'Poison Gold', css: 'linear-gradient(135deg,#422006,#eab308,#facc15)' },
  { id: 'purple-haze', label: 'Purple Haze', css: 'linear-gradient(135deg,#2e1065,#7c3aed,#c084fc)' },
] as const

const BORDERS = [
  { id: 'solid', label: 'Solid', dash: 'draw' as const },
  { id: 'dashed', label: 'Dashed', dash: 'dashed' as const },
  { id: 'dotted', label: 'Dotted', dash: 'dotted' as const },
  { id: 'draw', label: 'Retro', dash: 'solid' as const },
]

export function WallInspector() {
  const editor = useEditor()
  const user = useAuthStore((s) => s.user)
  const [styleExpandedFor, setStyleExpandedFor] = useState<string | null>(null)

  const selection = useValue(
    'wall-inspector-selection',
    () => {
      const ids = editor.getSelectedShapeIds().filter((id) => id !== WALL_FRAME_ID)
      if (ids.length === 0) return null
      const shapes = ids.map((id) => editor.getShape(id)).filter(Boolean)
      return { ids, shapes }
    },
    [editor],
  )

  if (!selection) return null

  const selectionKey = selection.ids.join(',')
  const expanded = styleExpandedFor === selectionKey

  const primary = selection.shapes[0]
  if (!primary) return null

  const rotationDeg = Math.round((primary.rotation * 180) / Math.PI)
  const locked = selection.shapes.every((s) => s?.isLocked)
  const meta = (primary.meta ?? {}) as Record<string, unknown>
  const wallStyle = (meta.wallStyle ?? {}) as { gradient?: string; borderDash?: string; gradientId?: string }
  const wallData = (meta.wallData ?? {}) as Record<string, unknown>
  const linkTo = meta.linkTo as { url?: string } | undefined
  const wallType = meta.wallType as string | undefined
  const isWidget = wallType === 'widget'
  const isProgress = wallType === 'progress'
  const isSoundpad = wallType === 'soundpad'
  const isPolaroid = wallType === 'polaroid'
  const isAudio = wallType === 'audio'
  const isQr = wallType === 'qr'
  const isImage = primary.type === 'image'
  const isNote = primary.type === 'note'
  const isSticky = isNote || primary.type === 'text'
  const kind = getWallShapeKind(primary)
  const label = getWallShapeLabel(primary)
  const multi = selection.ids.length > 1

  const updatePrimary = (patch: Record<string, unknown>) => {
    editor.run(() => {
      for (const id of selection.ids) {
        const shape = editor.getShape(id)
        if (!shape) continue
        editor.updateShape({
          id,
          type: shape.type,
          ...patch,
        })
      }
    })
  }

  const updateMeta = (patch: Record<string, unknown>) => {
    editor.run(() => {
      for (const id of selection.ids) {
        const shape = editor.getShape(id)
        if (!shape) continue
        editor.updateShape({
          id,
          type: shape.type,
          meta: { ...shape.meta, ...patch } as typeof shape.meta,
        })
      }
    })
  }

  const setRotation = (deg: number) => {
    updatePrimary({ rotation: (deg * Math.PI) / 180 })
  }

  const applyGradient = (css: string, id: string) => {
    updateMeta({ wallStyle: { ...wallStyle, gradient: css, gradientId: id } })
  }

  const applyBorder = (dash: string) => {
    const shape = primary
    if (shape.type === 'geo') {
      updatePrimary({ props: { ...(shape.props as object), dash } })
    }
    updateMeta({ wallStyle: { ...wallStyle, borderDash: dash } })
  }

  const canStyle =
    isWidget ||
    isProgress ||
    isSoundpad ||
    isPolaroid ||
    isAudio ||
    isQr ||
    primary.type === 'geo' ||
    isNote

  return (
    <div className="wall-inspector pointer-events-auto wall-inspector-enter" key={primary.id}>
      <div className="wall-inspector-bar">
        <span className="wall-inspector-label">Inspector</span>

        <span className="wall-inspector-divider" aria-hidden />

        <span className="wall-inspector-chip" title={label}>
          {multi ? `${selection.ids.length} selected` : kind}
          {!multi && label !== kind && <span className="wall-inspector-chip-sub">{label}</span>}
        </span>

        {linkTo?.url && (
          <span className="wall-inspector-link-badge" title={linkTo.url}>
            <ExternalLink className="h-3 w-3" />
            Linked
          </span>
        )}

        <span className="wall-inspector-divider" aria-hidden />

        <label className="wall-inspector-field">
          <span className="wall-inspector-field-label">Angle:</span>
          <input
            type="number"
            value={rotationDeg}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="wall-inspector-input w-12"
          />
        </label>

        <button
          type="button"
          className="wall-inspector-btn wall-inspector-btn-primary"
          onClick={() => editor.bringForward(selection.ids)}
        >
          Bring Forward
        </button>

        <button
          type="button"
          className="wall-inspector-btn wall-inspector-btn-icon"
          title="Send backward"
          onClick={() => editor.sendBackward(selection.ids)}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          className="wall-inspector-btn"
          onClick={() => {
            for (const id of selection.ids) editor.toggleLock([id])
          }}
        >
          {locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          {locked ? 'Unlock' : 'Lock'}
        </button>

        <button
          type="button"
          className="wall-inspector-btn wall-inspector-btn-icon"
          title="Add link"
          onClick={() => {
            const url = window.prompt('Link URL (https://…)', linkTo?.url ?? '')
            if (url?.trim()) wallActions.setSelectionLink(url.trim())
          }}
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>

        {canStyle && (
          <button
            type="button"
            className={cn('wall-inspector-btn wall-inspector-btn-icon', expanded && 'text-[#beee1d]')}
            title="Style options"
            onClick={() => setStyleExpandedFor(expanded ? null : selectionKey)}
          >
            <Palette className="h-3.5 w-3.5" />
          </button>
        )}

        {(isWidget || isProgress || isSoundpad || isPolaroid || isAudio || isQr) && (
          <button
            type="button"
            className="wall-inspector-btn wall-inspector-btn-icon"
            title="Promote to standalone widget"
            onClick={() => {
              const mapped = wallMetaToWidgetConfig(meta as Parameters<typeof wallMetaToWidgetConfig>[0])
              if (!mapped) return
              void createStandaloneWidget({
                ownerId: user?.id ?? 'local',
                ownerUsername: user?.username,
                widgetId: mapped.widgetId,
                config: mapped.config,
                size: mapped.size,
                wallElementId: primary.id,
                wallUsername: user?.username,
              }).then((w) => {
                window.open(`/w/${w.id}/edit`, '_blank')
              })
            }}
          >
            <Rocket className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          type="button"
          className="wall-inspector-btn wall-inspector-btn-delete"
          onClick={() => editor.deleteShapes(selection.ids)}
        >
          Delete
        </button>
      </div>

      {expanded && (
        <div className="wall-inspector-tray wall-inspector-tray-enter">
          {(isWidget || isProgress || isSoundpad || isPolaroid || isAudio || isQr) && (
            <div className="wall-inspector-tray-section">
              <p className="wall-inspector-tray-title">Neon gradients</p>
              <div className="flex flex-wrap gap-2">
                {GRADIENTS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    title={g.label}
                    className={cn(
                      'h-8 w-14 rounded-lg border-2 transition',
                      wallStyle.gradientId === g.id ? 'border-[#beee1d]' : 'border-transparent',
                    )}
                    style={{ background: g.css }}
                    onClick={() => applyGradient(g.css, g.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {primary.type === 'geo' && (
            <div className="wall-inspector-tray-section">
              <p className="wall-inspector-tray-title">Border</p>
              <div className="flex flex-wrap gap-1.5">
                {BORDERS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase',
                      wallStyle.borderDash === b.dash ? 'bg-[#beee1d] text-black' : 'bg-white/5 text-neutral-400',
                    )}
                    onClick={() => applyBorder(b.dash)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isWidget && (
            <div className="wall-inspector-tray-section">
              <p className="wall-inspector-tray-title">Widget profile</p>
              {(wallData.type === 'weather' || wallData.type === 'clock') && (
                <input
                  type="text"
                  placeholder="City / label"
                  defaultValue={String(wallData.location ?? wallData.label ?? '')}
                  className="wall-inspector-input w-full"
                  onBlur={(e) =>
                    updateMeta({
                      wallData: {
                        ...wallData,
                        location: e.target.value,
                        label: e.target.value,
                      },
                    })
                  }
                />
              )}
              {wallData.type === 'github' && (
                <input
                  type="text"
                  placeholder="user/repo"
                  defaultValue={String(wallData.repo ?? '')}
                  className="wall-inspector-input w-full"
                  onBlur={(e) => updateMeta({ wallData: { ...wallData, repo: e.target.value } })}
                />
              )}
              {wallData.type === 'spotify' && (
                <input
                  type="text"
                  placeholder="Track label"
                  defaultValue={String(wallData.label ?? '')}
                  className="wall-inspector-input w-full"
                  onBlur={(e) => updateMeta({ wallData: { ...wallData, label: e.target.value } })}
                />
              )}
            </div>
          )}

          {isImage && (
            <div className="wall-inspector-tray-section">
              <button
                type="button"
                className="wall-inspector-btn w-full justify-center"
                onClick={() => void wallActions.convertSelectionToPolaroid()}
              >
                Polaroid frame
              </button>
            </div>
          )}

          {isProgress && (
            <div className="wall-inspector-tray-section space-y-2">
              <p className="wall-inspector-tray-title">Progress tracker</p>
              <input
                type="text"
                placeholder="Title"
                defaultValue={String(wallData.title ?? '')}
                className="wall-inspector-input w-full"
                onBlur={(e) => updateMeta({ wallData: { ...wallData, title: e.target.value } })}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Current"
                  defaultValue={Number(wallData.current ?? 0)}
                  className="wall-inspector-input flex-1"
                  onBlur={(e) =>
                    updateMeta({ wallData: { ...wallData, current: Number(e.target.value) } })
                  }
                />
                <input
                  type="number"
                  placeholder="Target"
                  defaultValue={Number(wallData.max ?? 100)}
                  className="wall-inspector-input flex-1"
                  onBlur={(e) => updateMeta({ wallData: { ...wallData, max: Number(e.target.value) } })}
                />
              </div>
            </div>
          )}

          {isSoundpad && (
            <div className="wall-inspector-tray-section">
              <p className="wall-inspector-tray-title">Sound pad</p>
              <input
                type="text"
                placeholder="Label"
                defaultValue={String(wallData.label ?? '')}
                className="wall-inspector-input w-full"
                onBlur={(e) => updateMeta({ wallData: { ...wallData, label: e.target.value } })}
              />
            </div>
          )}

          {isPolaroid && (
            <div className="wall-inspector-tray-section">
              <p className="wall-inspector-tray-title">Polaroid caption</p>
              <input
                type="text"
                placeholder="Caption"
                defaultValue={String(wallData.caption ?? '')}
                className="wall-inspector-input w-full"
                onBlur={(e) => updateMeta({ wallData: { ...wallData, caption: e.target.value } })}
              />
            </div>
          )}

          {isAudio && (
            <div className="wall-inspector-tray-section">
              <p className="wall-inspector-tray-title">Audio title</p>
              <input
                type="text"
                placeholder="Track title"
                defaultValue={String(wallData.title ?? '')}
                className="wall-inspector-input w-full"
                onBlur={(e) => updateMeta({ wallData: { ...wallData, title: e.target.value } })}
              />
            </div>
          )}

          {isQr && (
            <div className="wall-inspector-tray-section">
              <p className="wall-inspector-tray-title">QR URL</p>
              <input
                type="url"
                placeholder="https://…"
                defaultValue={String(wallData.url ?? '')}
                className="wall-inspector-input w-full"
                onBlur={(e) => updateMeta({ wallData: { ...wallData, url: e.target.value } })}
              />
            </div>
          )}

          {isSticky && (
            <div className="wall-inspector-tray-section">
              <p className="wall-inspector-tray-title">Note color</p>
              <div className="flex flex-wrap gap-1.5">
                {(['yellow', 'light-green', 'light-blue', 'light-violet', 'light-red', 'orange'] as const).map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        'h-7 w-7 rounded-full border-2 border-white/10',
                        primary.type === 'note' &&
                          (primary.props as { color?: string }).color === color &&
                          'border-[#beee1d]',
                      )}
                      style={{
                        background:
                          color === 'yellow'
                            ? '#fef08a'
                            : color === 'light-green'
                              ? '#bbf7d0'
                              : color === 'light-blue'
                                ? '#bfdbfe'
                                : color === 'light-violet'
                                  ? '#ddd6fe'
                                  : color === 'light-red'
                                    ? '#fecaca'
                                    : '#fed7aa',
                      }}
                      onClick={() => {
                        if (primary.type !== 'note') return
                        updatePrimary({ props: { ...(primary.props as object), color } })
                      }}
                    />
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
