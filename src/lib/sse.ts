import { EventEmitter } from 'events'

// Use a global singleton for the emitter to persist across hot reloads in dev
const globalForEmitter = globalThis as unknown as { sseEmitter: EventEmitter }

export const sseEmitter = globalForEmitter.sseEmitter || new EventEmitter()

if (process.env.NODE_ENV !== 'production') globalForEmitter.sseEmitter = sseEmitter

export function sendEvent(event: string, data: any) {
  sseEmitter.emit(event, data)
}
