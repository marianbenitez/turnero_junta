import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id)

  try {
    const turno = await prisma.turno.findUnique({
      where: { id },
      include: {
        inscripciones: true,
      },
    })

    if (!turno) {
      return NextResponse.json({ error: 'Turno not found' }, { status: 404 })
    }

    const turnoWithCupo = {
      ...turno,
      cupoActual: turno.cupoMaximo - turno.inscripciones.length,
    }

    return NextResponse.json(turnoWithCupo)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching turno' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id)

  try {
    const body = await request.json()
    const { fecha, horaInicio, horaFin, cupoMaximo, estado } = body

    const updateData: any = {}
    if (fecha) updateData.fecha = new Date(fecha)
    if (horaInicio) updateData.horaInicio = horaInicio
    if (horaFin) updateData.horaFin = horaFin
    if (cupoMaximo) updateData.cupoMaximo = Number(cupoMaximo)
    if (estado !== undefined) updateData.estado = estado

    const updatedTurno = await prisma.turno.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedTurno)
  } catch (error) {
    return NextResponse.json({ error: 'Error updating turno' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id)

  try {
    // Check if there are inscriptions
    const turno = await prisma.turno.findUnique({
      where: { id },
      include: { inscripciones: true },
    })

    if (!turno) {
      return NextResponse.json({ error: 'Turno not found' }, { status: 404 })
    }

    if (turno.inscripciones.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete turno with inscriptions' },
        { status: 400 }
      )
    }

    await prisma.turno.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Turno eliminado exitosamente' })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting turno' }, { status: 500 })
  }
}
