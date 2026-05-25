import type { JsonObject } from '@tldraw/utils'

/** Strip undefined and non-JSON values so tldraw shape meta passes validation. */
export function toJsonMeta(meta: Record<string, unknown>): JsonObject {
  return JSON.parse(JSON.stringify(meta)) as JsonObject
}
