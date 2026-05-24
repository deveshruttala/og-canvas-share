import Dexie, { type Table } from 'dexie'
import type { CanvasDoc } from '@/types/canvas'
import type { WidgetInstance } from '@/types/widget-instance'
import { LOCAL_CANVAS_ID } from '@/persist/constants'

export { LOCAL_CANVAS_ID } from '@/persist/constants'

export class WallDatabase extends Dexie {
  canvases!: Table<CanvasDoc, string>
  widgetInstances!: Table<WidgetInstance, string>

  constructor() {
    super('wall-db')
    this.version(1).stores({
      canvases: 'id',
    })
    this.version(2).stores({
      canvases: 'id',
      widgetInstances: 'id, ownerId, widgetId',
    })
  }
}

export const db = new WallDatabase()

export async function loadCanvas(id = LOCAL_CANVAS_ID): Promise<CanvasDoc | undefined> {
  return db.canvases.get(id)
}

export async function saveCanvas(doc: CanvasDoc): Promise<void> {
  const updated: CanvasDoc = {
    ...doc,
    meta: {
      ...doc.meta,
      updatedAt: new Date().toISOString(),
    },
  }
  await db.canvases.put(updated)
}

export async function loadWidgetInstance(id: string): Promise<WidgetInstance | undefined> {
  return db.widgetInstances.get(id)
}

export async function saveWidgetInstance(widget: WidgetInstance): Promise<void> {
  await db.widgetInstances.put({ ...widget, updatedAt: new Date().toISOString() })
}

export async function listLocalWidgets(ownerId: string): Promise<WidgetInstance[]> {
  const items = await db.widgetInstances.where('ownerId').equals(ownerId).toArray()
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function deleteWidgetInstance(id: string): Promise<void> {
  await db.widgetInstances.delete(id)
}
