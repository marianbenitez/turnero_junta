import { NextResponse } from 'next/server'
import { sseEmitter } from '@/lib/sse'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const encoder = new TextEncoder()

  const customReadable = new ReadableStream({
    start(controller) {
      const onInscripcionUpdated = (data: any) => {
        const message = `event: inscripcion-updated\ndata: ${JSON.stringify(
          data
        )}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      sseEmitter.on('inscripcion-updated', onInscripcionUpdated)

      // Send initial keep-alive
      const keepAliveInterval = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'))
      }, 30000)

      request.signal.addEventListener('abort', () => {
        sseEmitter.off('inscripcion-updated', onInscripcionUpdated)
        clearInterval(keepAliveInterval)
        controller.close()
      })
    },
  })

  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
