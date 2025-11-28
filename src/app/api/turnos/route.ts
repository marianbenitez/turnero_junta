import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const habilitados = searchParams.get('habilitados')
  const fecha = searchParams.get('fecha')

  const where: any = {}

  if (habilitados === 'true') {
    where.estado = true
  }

  if (fecha) {
    // Assuming fecha is YYYY-MM-DD, we need to filter by that day
    // Prisma stores DateTime, so we might need range or just simple match if we store just date part effectively
    // But schema says DateTime. Let's assume we want to match the day.
    const startDate = new Date(fecha)
    const endDate = new Date(fecha)
    endDate.setDate(endDate.getDate() + 1)

    where.fecha = {
      gte: startDate,
      lt: endDate,
    }
  }

  try {
    const turnos = await prisma.turno.findMany({
      where,
      include: {
        inscripciones: true,
      },
      orderBy: {
        fecha: 'asc',
      },
    })

    // Calculate cupoActual (available spots)
    const turnosWithCupo = turnos.map((turno) => ({
      ...turno,
      cupoActual: turno.cupoMaximo - turno.inscripciones.length,
    }))

    return NextResponse.json(turnosWithCupo)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching turnos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fecha, horaInicio, horaFin, cupoMaximo, estado } = body

    if (!fecha || !horaInicio || !horaFin || !cupoMaximo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newTurno = await prisma.turno.create({
      data: {
        fecha: new Date(fecha),
        horaInicio,
        horaFin,
        cupoMaximo: Number(cupoMaximo),
        estado: estado ?? true,
      },
    })

    return NextResponse.json(newTurno, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error creating turno' }, { status: 500 })
  }
}
