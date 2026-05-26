/**
 * Floating inspector HUD — rotation, layers, lock, delete, gradients & borders.
 */
import { useEffect, useState } from 'react'
import {
  Lock,
  Unlock,
  ArrowDown,
  Link2,
  Palette,
  ExternalLink,
  Rocket,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'
import { useEditor, useValue } from '@tldraw/editor'
import { WALL_FRAME_ID } from '@/editor/wall-editor-api'
import { getWallShapeKind, getWallShapeLabel, wallActions } from '@/editor/wall-actions'
import { createStandaloneWidget } from '@/lib/widget-store'
import { wallMetaToWidgetConfig } from '@/lib/widget-render'
import { useAuthStore } from '@/store/auth.store'
import {
  CARD_BG_PRESETS,
  DISPLAY_MODE_OPTIONS,
  FONT_OPTIONS,
  normalizeWallTextStyleFromShape,
  readWallTextBoxStyle,
  SIZE_OPTIONS,
  STICKY_COLOR_HEX,
  TEXT_ALIGN_OPTIONS,
  TEXT_COLOR_OPTIONS,
  TEXT_COLOR_SWATCH,
  TEXT_STYLE_PRESETS,
  type WallTextDisplayMode,
} from '@/lib/wall-text-style'
import { WALL_BORDER_PRESETS, WALL_GRADIENT_PRESETS } from '@/lib/wall-style-presets'
import { AUDIO_PLAYER_THEMES, VIDEO_PLAYER_THEMES } from '@/lib/wall-player-presets'
import { cn } from '@/lib/cn'
import { toJsonMeta } from '@/lib/json-meta'
import { startWallTextEditing } from '@/editor/wall-text-editing'

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

  const selectionKey = selection?.ids.join(',') ?? ''
  const primary = selection?.shapes[0]
  const primaryMeta = (primary?.meta ?? {}) as Record<string, unknown>
  const primaryWallType = primaryMeta.wallType as string | undefined
  const isTextSelection =
    primary?.type === 'text' || primary?.type === 'note'
  const isAudioSelection = primaryWallType === 'audio'
  const isVideoSelection = primaryWallType === 'video'
  const multiSelected = (selection?.ids.length ?? 0) > 1

  useEffect(() => {
    if (
      (isTextSelection || isAudioSelection || isVideoSelection) &&
      !multiSelected &&
      selectionKey
    ) {
      setStyleExpandedFor(selectionKey)
    }
  }, [selectionKey, isTextSelection, isAudioSelection, isVideoSelection, multiSelected])

  if (!selection) return null

  const expanded = styleExpandedFor === selectionKey

  if (!primary) return null

  const rotationDeg = Math.round((primary.rotation * 180) / Math.PI)
  const locked = selection.shapes.every((s) => s?.isLocked)
  const meta = primaryMeta
  const wallStyle = (meta.wallStyle ?? {}) as {
    gradient?: string
    borderDash?: string
    gradientId?: string
    playerThemeId?: string
  }
  const wallData = (meta.wallData ?? {}) as Record<string, unknown>
  const linkTo = meta.linkTo as { url?: string } | undefined
  const wallType = primaryWallType
  const isWidget = wallType === 'widget'
  const isProgress = wallType === 'progress'
  const isSoundpad = wallType === 'soundpad'
  const isPolaroid = wallType === 'polaroid'
  const isAudio = isAudioSelection
  const isVideo = isVideoSelection
  const isQr = wallType === 'qr'
  const isLink = wallType === 'link'
  const isImage = primary.type === 'image'
  const isNote = primary.type === 'note'
  const isTextBox = primary.type === 'text'
  const isTextContent = isNote || isTextBox
  const textStyle = isTextContent
    ? normalizeWallTextStyleFromShape(
        {
          ...meta,
          wallTextBox: {
            ...readWallTextBoxStyle(meta),
            mode: isNote ? 'sticky' : readWallTextBoxStyle(meta).mode,
          },
        },
        primary.props as { size?: string; scale?: number },
      )
    : null
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
          meta: toJsonMeta({ ...(shape.meta as Record<string, unknown>), ...patch }),
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

  const applyPlayerTheme = (playerThemeId: string) => {
    updateMeta({ wallStyle: { ...wallStyle, playerThemeId } })
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
    isVideo ||
    isQr ||
    primary.type === 'geo' ||
    isTextContent

  const setTextMode = (mode: WallTextDisplayMode) => {
    for (const id of selection.ids) {
      wallActions.setTextBoxDisplayMode(id, mode, textStyle ?? undefined)
    }
  }

  return (
    <div className="wall-inspector pointer-events-auto wall-inspector-enter" key={primary.id}>
      <div className="wall-inspector-bar">
        <span className="wall-inspector-label">Inspector</span>

        <span className="wall-inspector-divider" aria-hidden />

        <span className="wall-inspector-chip" title={label}>
          {multi ? `${selection.ids.length} selected` : kind}
          {!multi && label !== kind && <span className="wall-inspector-chip-sub">{label}</span>}
        </span>

        {linkTo?.url && !isLink && (
          <span className="wall-inspector-link-badge" title={linkTo.url}>
            <ExternalLink className="h-3 w-3" />
            Linked
          </span>
        )}

        {isLink && !multi && (
          <label className="wall-inspector-field min-w-0 max-w-[min(28rem,50vw)] flex-1">
            <span className="wall-inspector-field-label">Link:</span>
            <input
              type="url"
              defaultValue={String(wallData.url ?? '')}
              className="wall-inspector-input min-w-[10rem] flex-1"
              onBlur={async (e) => {
                const next = e.target.value.trim()
                if (!next) return
                const normalized = /^https?:\/\//i.test(next) ? next : `https://${next}`
                const { fetchLinkMeta } = await import('@/lib/extract-link-meta')
                const meta = await fetchLinkMeta(normalized)
                updateMeta({
                  wallData: {
                    ...wallData,
                    url: normalized,
                    title: meta.title,
                    description: meta.description,
                    image: meta.image,
                  },
                  linkTo: { url: normalized, openInNewTab: true },
                })
              }}
            />
          </label>
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

        {isTextContent && !multiSelected && (
          <button
            type="button"
            className="wall-inspector-btn wall-inspector-btn-primary"
            title="Edit text (Enter)"
            onClick={() => startWallTextEditing(editor, primary.id, { selectAll: false })}
          >
            <Type className="h-3.5 w-3.5" />
            Edit text
          </button>
        )}

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

        <span className="wall-inspector-bar-spacer" aria-hidden />

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
                {WALL_GRADIENT_PRESETS.map((g) => (
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
                {WALL_BORDER_PRESETS.map((b) => (
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
            <div className="wall-inspector-player-panel">
              <p className="wall-inspector-tray-title">Player theme</p>
              <div className="wall-inspector-player-themes">
                {AUDIO_PLAYER_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    title={t.label}
                    className={cn(
                      'wall-inspector-player-theme',
                      wallStyle.playerThemeId === t.id ||
                        (!wallStyle.playerThemeId && t.id === 'neon-lime')
                        ? 'wall-inspector-player-theme--active'
                        : '',
                    )}
                    style={{
                      background: t.background,
                      borderColor:
                        wallStyle.playerThemeId === t.id ||
                        (!wallStyle.playerThemeId && t.id === 'neon-lime')
                          ? t.accent
                          : 'transparent',
                    }}
                    onClick={() => applyPlayerTheme(t.id)}
                  >
                    <span className="wall-inspector-player-theme-dot" style={{ background: t.accent }} />
                    <span className="wall-inspector-player-theme-label">{t.label}</span>
                  </button>
                ))}
              </div>
              <div className="wall-inspector-tray-section mt-3 space-y-2">
                <input
                  type="text"
                  placeholder="Track title"
                  defaultValue={String(wallData.title ?? '')}
                  className="wall-inspector-input w-full"
                  onBlur={(e) => updateMeta({ wallData: { ...wallData, title: e.target.value } })}
                />
                <input
                  type="text"
                  placeholder="Artist / subtitle"
                  defaultValue={String(wallData.artist ?? '')}
                  className="wall-inspector-input w-full"
                  onBlur={(e) => updateMeta({ wallData: { ...wallData, artist: e.target.value } })}
                />
              </div>
            </div>
          )}

          {isVideo && (
            <div className="wall-inspector-player-panel">
              <p className="wall-inspector-tray-title">Player theme</p>
              <div className="wall-inspector-player-themes">
                {VIDEO_PLAYER_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    title={t.label}
                    className={cn(
                      'wall-inspector-player-theme',
                      wallStyle.playerThemeId === t.id ||
                        (!wallStyle.playerThemeId && t.id === 'cinema-dark')
                        ? 'wall-inspector-player-theme--active'
                        : '',
                    )}
                    style={{
                      background: t.background,
                      borderColor:
                        wallStyle.playerThemeId === t.id ||
                        (!wallStyle.playerThemeId && t.id === 'cinema-dark')
                          ? t.accent
                          : 'transparent',
                    }}
                    onClick={() => applyPlayerTheme(t.id)}
                  >
                    <span className="wall-inspector-player-theme-dot" style={{ background: t.accent }} />
                    <span className="wall-inspector-player-theme-label">{t.label}</span>
                  </button>
                ))}
              </div>
              <div className="wall-inspector-tray-section mt-3">
                <input
                  type="text"
                  placeholder="Video title"
                  defaultValue={String(wallData.title ?? '')}
                  className="wall-inspector-input w-full"
                  onBlur={(e) => updateMeta({ wallData: { ...wallData, title: e.target.value } })}
                />
              </div>
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

          {isTextContent && textStyle && (
            <div className="wall-inspector-text">
              <div className="wall-inspector-tabs" role="tablist" aria-label="Text display mode">
                {DISPLAY_MODE_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={textStyle.mode === m.id}
                    className={cn(
                      'wall-inspector-tab',
                      textStyle.mode === m.id && 'wall-inspector-tab--active',
                    )}
                    onClick={() => setTextMode(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="wall-inspector-text-grid">
                <section className="wall-inspector-panel wall-inspector-panel--full">
                  <p className="wall-inspector-tray-title">Quick styles</p>
                  <div className="wall-inspector-chip-row">
                    {TEXT_STYLE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="wall-inspector-chip-btn"
                        onClick={() => wallActions.applyTextStylePreset(selection.ids, p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="wall-inspector-panel">
                  <p className="wall-inspector-tray-title">Font</p>
                  <div className="wall-inspector-segment wall-inspector-segment--5">
                    {FONT_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        title={f.hint}
                        className={cn(
                          'wall-inspector-segment-btn wall-inspector-font-btn',
                          textStyle.font === f.id && 'wall-inspector-segment-btn--active',
                        )}
                        onClick={() =>
                          wallActions.updateTextBoxTypography(selection.ids, { font: f.id })
                        }
                      >
                        <span className="wall-inspector-font-sample" data-font={f.id}>
                          {f.sample}
                        </span>
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="wall-inspector-panel">
                  <p className="wall-inspector-tray-title">Size</p>
                  <div className="wall-inspector-segment wall-inspector-segment--7">
                    {SIZE_OPTIONS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        title={`${s.hint} · ~${s.px}px`}
                        className={cn(
                          'wall-inspector-segment-btn',
                          textStyle.size === s.id && 'wall-inspector-segment-btn--active',
                        )}
                        onClick={() =>
                          wallActions.updateTextBoxTypography(selection.ids, { size: s.id })
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="wall-inspector-panel">
                  <p className="wall-inspector-tray-title">Alignment</p>
                  <div className="wall-inspector-segment wall-inspector-segment--3">
                    {TEXT_ALIGN_OPTIONS.map((a) => {
                      const Icon =
                        a.id === 'start'
                          ? AlignLeft
                          : a.id === 'middle'
                            ? AlignCenter
                            : AlignRight
                      return (
                        <button
                          key={a.id}
                          type="button"
                          title={a.label}
                          className={cn(
                            'wall-inspector-segment-btn wall-inspector-align-btn',
                            textStyle.textAlign === a.id && 'wall-inspector-segment-btn--active',
                          )}
                          onClick={() =>
                            wallActions.updateTextBoxTypography(selection.ids, {
                              textAlign: a.id,
                            })
                          }
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{a.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section className="wall-inspector-panel wall-inspector-panel--full">
                  <p className="wall-inspector-tray-title">Text color</p>
                  <div className="wall-inspector-swatch-grid">
                    {TEXT_COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        title={c.label}
                        className={cn(
                          'wall-inspector-swatch',
                          textStyle.color === c.id && 'wall-inspector-swatch--active',
                          c.id === 'white' && 'wall-inspector-swatch--light',
                        )}
                        style={{ background: TEXT_COLOR_SWATCH[c.id] }}
                        onClick={() =>
                          wallActions.updateTextBoxTypography(selection.ids, { color: c.id })
                        }
                      />
                    ))}
                  </div>
                </section>

                {textStyle.mode === 'card' && (
                  <section className="wall-inspector-panel wall-inspector-panel--full">
                    <p className="wall-inspector-tray-title">Card background</p>
                    <div className="wall-inspector-swatch-grid wall-inspector-swatch-grid--wide">
                      {CARD_BG_PRESETS.map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          title={bg.label}
                          className={cn(
                            'wall-inspector-card-swatch',
                            textStyle.cardBg === bg.css && 'wall-inspector-card-swatch--active',
                          )}
                          style={{ background: bg.css }}
                          onClick={() => {
                            for (const id of selection.ids) {
                              const shape = editor.getShape(id)
                              if (!shape) continue
                              editor.updateShape({
                                id,
                                type: shape.type,
                                meta: toJsonMeta({
                                  ...(shape.meta as Record<string, unknown>),
                                  wallTextBox: {
                                    ...readWallTextBoxStyle(shape.meta as Record<string, unknown>),
                                    cardBg: bg.css,
                                  },
                                }),
                              })
                            }
                          }}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {textStyle.mode === 'sticky' && (
                  <section className="wall-inspector-panel wall-inspector-panel--full">
                    <p className="wall-inspector-tray-title">Sticky color</p>
                    <div className="wall-inspector-swatch-grid">
                      {(Object.keys(STICKY_COLOR_HEX) as Array<keyof typeof STICKY_COLOR_HEX>).map(
                        (color) => (
                          <button
                            key={color}
                            type="button"
                            title={color}
                            className={cn(
                              'wall-inspector-swatch',
                              textStyle.stickyColor === color && 'wall-inspector-swatch--active',
                            )}
                            style={{ background: STICKY_COLOR_HEX[color] }}
                            onClick={() => {
                              if (primary.type === 'note') {
                                updatePrimary({ props: { ...(primary.props as object), color } })
                              }
                              for (const id of selection.ids) {
                                const shape = editor.getShape(id)
                                if (!shape) continue
                                editor.updateShape({
                                  id,
                                  type: shape.type,
                                  meta: toJsonMeta({
                                    ...(shape.meta as Record<string, unknown>),
                                    wallTextBox: {
                                      ...readWallTextBoxStyle(shape.meta as Record<string, unknown>),
                                      stickyColor: color,
                                    },
                                  }),
                                })
                              }
                            }}
                          />
                        ),
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
