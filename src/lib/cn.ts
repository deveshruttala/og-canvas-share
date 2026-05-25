import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number,
): ((...args: Parameters<T>) => void) & { flush: () => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout>
  let pending: Parameters<T> | null = null

  const run = () => {
    if (pending) {
      fn(...(pending as Parameters<T>))
      pending = null
    }
  }

  const debounced = (...args: Parameters<T>) => {
    pending = args
    clearTimeout(timer)
    timer = setTimeout(run, ms)
  }

  debounced.flush = () => {
    clearTimeout(timer)
    run()
  }

  debounced.cancel = () => {
    clearTimeout(timer)
    pending = null
  }

  return debounced
}

export function snapToGrid(value: number, grid = 16): number {
  return Math.round(value / grid) * grid
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
