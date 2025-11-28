import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEvent } from '@/lib/sse'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id)

  try {
    const body = await request.json()
    const { atendido } = body

    if (typeof atendido !== 'boolean') {
      return NextResponse.json(
        { error: 'atendido must be a boolean' },
        { status: 400 }
      )
    }

    const updatedInscripcion = await prisma.inscripcion.update({
      where: { id },
      data: { atendido },
    })

    // Emit SSE event
    sendEvent('inscripcion-updated', {
      inscripcionId: updatedInscripcion.id,
      turnoId: updatedInscripcion.turnoId,
      atendido: updatedInscripcion.atendido,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(updatedInscripcion)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating inscription' },
      { status: 500 }
    )
  }
}
