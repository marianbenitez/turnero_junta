import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear turnos para diciembre 2025
  const turnos = await prisma.turno.createMany({
    data: [
      // Semana 1
      {
        fecha: new Date('2025-12-01'),
        horaInicio: '08:00',
        horaFin: '09:00',
        cupoMaximo: 10,
        estado: true,
      },
      {
        fecha: new Date('2025-12-01'),
        horaInicio: '10:00',
        horaFin: '11:00',
        cupoMaximo: 15,
        estado: true,
      },
      {
        fecha: new Date('2025-12-03'),
        horaInicio: '14:00',
        horaFin: '15:00',
        cupoMaximo: 8,
        estado: true,
      },
      // Semana 2
      {
        fecha: new Date('2025-12-08'),
        horaInicio: '09:00',
        horaFin: '10:00',
        cupoMaximo: 12,
        estado: true,
      },
      {
        fecha: new Date('2025-12-10'),
        horaInicio: '11:00',
        horaFin: '12:00',
        cupoMaximo: 20,
        estado: true,
      },
      // Semana 3
      {
        fecha: new Date('2025-12-15'),
        horaInicio: '08:30',
        horaFin: '09:30',
        cupoMaximo: 10,
        estado: true,
      },
      {
        fecha: new Date('2025-12-18'),
        horaInicio: '16:00',
        horaFin: '17:00',
        cupoMaximo: 25,
        estado: true,
      },
      // Semana 4
      {
        fecha: new Date('2025-12-22'),
        horaInicio: '10:00',
        horaFin: '11:00',
        cupoMaximo: 15,
        estado: true,
      },
      {
        fecha: new Date('2025-12-23'),
        horaInicio: '14:00',
        horaFin: '15:00',
        cupoMaximo: 18,
        estado: true,
      },
      {
        fecha: new Date('2025-12-27'),
        horaInicio: '09:00',
        horaFin: '10:00',
        cupoMaximo: 12,
        estado: true,
      },
    ],
  })

  console.log(`✅ Creados ${turnos.count} turnos para diciembre 2025`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
