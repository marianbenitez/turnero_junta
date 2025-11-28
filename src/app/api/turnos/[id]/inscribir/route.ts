import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id)

  try {
    const body = await request.json()
    const { nombre, dni, email, telefono } = body

    if (!nombre || !dni) {
      return NextResponse.json(
        { error: 'Nombre and DNI are required' },
        { status: 400 }
      )
    }

    // Transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get Turno
      const turno = await tx.turno.findUnique({
        where: { id },
        include: { inscripciones: true },
      })

      if (!turno) {
        throw new Error('Turno not found')
      }

      // 2. Validations
      if (!turno.estado) {
        throw new Error('Turno no habilitado')
      }

      if (turno.inscripciones.length >= turno.cupoMaximo) {
        throw new Error('No hay cupos disponibles')
      }

      const existingInscripcion = turno.inscripciones.find((i) => i.dni === dni)
      if (existingInscripcion) {
        throw new Error('Ya está inscrito en este turno')
      }

      // 3. Create Inscripcion
      const inscripcion = await tx.inscripcion.create({
        data: {
          turnoId: id,
          nombre,
          dni,
          email,
          telefono,
        },
      })

      return inscripcion
    })

    return NextResponse.json(
      { message: 'Inscripción registrada exitosamente', inscripcion: result },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.message === 'Turno not found') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (
      error.message === 'Turno no habilitado' ||
      error.message === 'No hay cupos disponibles' ||
      error.message === 'Ya está inscrito en este turno'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Error processing inscription' }, { status: 500 })
  }
}
