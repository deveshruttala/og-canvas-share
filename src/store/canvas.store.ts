import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { CanvasDoc, CanvasElement, ThemeId } from '@/types/canvas'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  createEmptyCanvas,
  createImageElement,
  createLinkElement,
  createTextElement,
  createEmojiElement,
  createAudioElement,
  createEmbedElement,
  createQrElement,
  createWidgetElement,
} from '@/types/canvas'
import { detectLinkPlatform, getEmbedUrl } from '@/lib/link-resolver'
import { fetchLinkMeta } from '@/lib/extract-link-meta'
import { debounce } from '@/lib/cn'
import { getTheme } from '@/themes'
import { saveCanvas } from '@/persist/db'
import { LOCAL_CANVAS_ID, shouldPersistDoc } from '@/persist/constants'

const MAX_HISTORY = 100

type CanvasState = {
  doc: CanvasDoc
  selectedId: string | null
  saveStatus: 'saved' | 'saving' | 'idle'
  history: CanvasDoc[]
  historyIndex: number
  hydrated: boolean

  hydrate: (doc: CanvasDoc) => void
  setTheme: (theme: ThemeId, accent?: string) => void
  setPageBackground: (value: string | null) => void
  setTitle: (title: string) => void
  select: (id: string | null) => void
  addElement: (element: CanvasElement) => void
  addTextAt: (x: number, y: number, text?: string) => void
  addImageAt: (x: number, y: number, src: string, alt?: string) => void
  addLinkAt: (
    x: number,
    y: number,
    url: string,
    meta?: Parameters<typeof createLinkElement>[3],
  ) => void
  addEmojiAt: (x: number, y: number, emoji: string) => void
  addAudioAt: (x: number, y: number, src: string, title?: string, artist?: string) => void
  addEmbedAt: (x: number, y: number, url: string) => Promise<void>
  addQrAt: (x: number, y: number, url: string) => void
  addGifAt: (x: number, y: number, gifUrl: string) => void
  addWidgetAt: (x: number, y: number, type: 'clock' | 'weather' | 'spotify' | 'github') => void
  incrementReaction: (emoji: string) => void
  updateElement: (id: string, patch: Partial<CanvasElement>) => void
  deleteElement: (id: string) => void
  duplicateElement: (id: string) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  toggleLock: (id: string) => void
  loadDoc: (doc: CanvasDoc) => void
  undo: () => void
  redo: () => void
  persist: () => Promise<void>
  syncFromSnapshot: (snapshot: unknown) => void
}

function pushHistory(state: CanvasState, doc: CanvasDoc): Pick<CanvasState, 'history' | 'historyIndex'> {
  const trimmed = state.history.slice(0, state.historyIndex + 1)
  const next = [...trimmed, structuredClone(doc)].slice(-MAX_HISTORY)
  return { history: next, historyIndex: next.length - 1 }
}

function withUpdatedDoc(
  state: CanvasState,
  updater: (doc: CanvasDoc) => CanvasDoc,
): Partial<CanvasState> {
  const doc = updater(state.doc)
  const persistable = shouldPersistDoc(doc)
  return {
    doc,
    ...pushHistory(state, doc),
    saveStatus: persistable ? ('saving' as const) : ('saved' as const),
  }
}

function schedulePersist() {
  const { doc } = useCanvasStore.getState()
  if (!shouldPersistDoc(doc)) return
  debouncedPersist()
}

const debouncedPersist = debounce(async () => {
  const { doc } = useCanvasStore.getState()
  if (!shouldPersistDoc(doc)) return
  await saveCanvas(doc)
  useCanvasStore.setState({ saveStatus: 'saved' })
}, 500)

export const useCanvasStore = create<CanvasState>((set, get) => ({
  doc: createEmptyCanvas(LOCAL_CANVAS_ID),
  selectedId: null,
  saveStatus: 'idle',
  history: [],
  historyIndex: -1,
  hydrated: false,

  hydrate: (doc) => {
    set({
      doc,
      history: [structuredClone(doc)],
      historyIndex: 0,
      hydrated: true,
      saveStatus: 'saved',
    })
  },

  setTheme: (theme, accent) => {
    const themeConfig = getTheme(theme)
    set((state) => {
      const doc: CanvasDoc = {
        ...state.doc,
        theme,
        accent: accent ?? themeConfig.defaultAccent,
        meta: { ...state.doc.meta, updatedAt: new Date().toISOString() },
      }
      return {
        doc,
        saveStatus: shouldPersistDoc(doc) ? ('saving' as const) : ('saved' as const),
      }
    })
    schedulePersist()
  },

  setPageBackground: (value) => {
    set((state) =>
      withUpdatedDoc(state, (doc) => ({
        ...doc,
        customPageBackground: value,
      })),
    )
    schedulePersist()
  },

  setTitle: (title) => {
    set((state) =>
      withUpdatedDoc(state, (doc) => ({
        ...doc,
        title,
      })),
    )
    schedulePersist()
  },

  select: (id) => set({ selectedId: id }),

  addElement: (element) => {
    set((state) =>
      withUpdatedDoc(state, (doc) => ({
        ...doc,
        elements: [...doc.elements, element],
      })),
    )
    set({ selectedId: element.id })
    schedulePersist()
  },

  addTextAt: (x, y, text) => {
    get().addElement(createTextElement(x, y, text))
  },

  addImageAt: (x, y, src, alt) => {
    get().addElement(createImageElement(x, y, src, alt))
  },

  addLinkAt: (x, y, url, meta) => {
    get().addElement(createLinkElement(x, y, url, meta))
  },

  addEmojiAt: (x, y, emoji) => {
    get().addElement(createEmojiElement(x, y, emoji))
  },

  addAudioAt: (x, y, src, title, artist) => {
    get().addElement(createAudioElement(x, y, src, title, artist))
  },

  addEmbedAt: async (x, y, url) => {
    const platform = detectLinkPlatform(url)
    const embedUrl = getEmbedUrl(url, platform)
    if (embedUrl) {
      get().addElement(createEmbedElement(x, y, url, embedUrl, platform))
      return
    }
    const meta = await fetchLinkMeta(url)
    get().addElement(createLinkElement(x, y, url, meta))
  },

  addQrAt: (x, y, url) => {
    get().addElement(createQrElement(x, y, url))
  },

  addGifAt: (x, y, gifUrl) => {
    const el = createImageElement(x, y, gifUrl, 'GIF')
    el.w = 320
    el.h = 240
    get().addElement(el)
  },

  addWidgetAt: (x, y, type) => {
    get().addElement(createWidgetElement(x, y, { type }))
  },

  incrementReaction: (emoji) => {
    set((state) =>
      withUpdatedDoc(state, (doc) => ({
        ...doc,
        reactions: {
          ...doc.reactions,
          [emoji]: (doc.reactions[emoji] ?? 0) + 1,
        },
      })),
    )
    schedulePersist()
  },

  updateElement: (id, patch) => {
    set((state) =>
      withUpdatedDoc(state, (doc) => ({
        ...doc,
        elements: doc.elements.map((el) =>
          el.id === id
            ? {
                ...el,
                ...patch,
                content: patch.content ?? el.content,
                style: patch.style ? { ...el.style, ...patch.style } : el.style,
              }
            : el,
        ),
      })),
    )
    schedulePersist()
  },

  deleteElement: (id) => {
    set((state) =>
      withUpdatedDoc(state, (doc) => ({
        ...doc,
        elements: doc.elements.filter((el) => el.id !== id),
      })),
    )
    set({ selectedId: get().selectedId === id ? null : get().selectedId })
    schedulePersist()
  },

  duplicateElement: (id) => {
    const el = get().doc.elements.find((e) => e.id === id)
    if (!el) return
    const copy: CanvasElement = {
      ...structuredClone(el),
      id: nanoid(),
      x: Math.min(el.x + 24, CANVAS_WIDTH - el.w),
      y: Math.min(el.y + 24, CANVAS_HEIGHT - el.h),
      z: Date.now(),
    }
    get().addElement(copy)
  },

  bringForward: (id) => {
    set((state) =>
      withUpdatedDoc(state, (doc) => ({
        ...doc,
        elements: doc.elements.map((el) =>
          el.id === id ? { ...el, z: Date.now() } : el,
        ),
      })),
    )
    schedulePersist()
  },

  sendBackward: (id) => {
    const minZ = Math.min(...get().doc.elements.map((e) => e.z), 0)
    set((state) =>
      withUpdatedDoc(state, (doc) => ({
        ...doc,
        elements: doc.elements.map((el) =>
          el.id === id ? { ...el, z: minZ - 1 } : el,
        ),
      })),
    )
    schedulePersist()
  },

  toggleLock: (id) => {
    const el = get().doc.elements.find((e) => e.id === id)
    if (!el) return
    get().updateElement(id, { locked: !el.locked })
  },

  loadDoc: (doc) => {
    set((state) => ({
      ...withUpdatedDoc(state, () => structuredClone(doc)),
      selectedId: null,
    }))
    schedulePersist()
  },

  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex <= 0) return
    const nextIndex = historyIndex - 1
    set({
      doc: structuredClone(history[nextIndex]),
      historyIndex: nextIndex,
      saveStatus: shouldPersistDoc(history[nextIndex]) ? 'saving' : 'saved',
    })
    schedulePersist()
  },

  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex >= history.length - 1) return
    const nextIndex = historyIndex + 1
    set({
      doc: structuredClone(history[nextIndex]),
      historyIndex: nextIndex,
      saveStatus: shouldPersistDoc(history[nextIndex]) ? 'saving' : 'saved',
    })
    schedulePersist()
  },

  persist: async () => {
    const { doc } = get()
    if (!shouldPersistDoc(doc)) return
    await saveCanvas(doc)
    set({ saveStatus: 'saved' })
  },

  /** Persist tldraw state only — must not push history or re-feed the live editor snapshot prop. */
  syncFromSnapshot: (snapshot) => {
    set((state) => {
      const doc: CanvasDoc = {
        ...state.doc,
        snapshot,
        meta: { ...state.doc.meta, updatedAt: new Date().toISOString() },
      }
      return {
        doc,
        saveStatus: shouldPersistDoc(doc) ? ('saving' as const) : ('saved' as const),
      }
    })
    schedulePersist()
  },
}))
