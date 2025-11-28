import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar datos existentes
  await prisma.inscripcion.deleteMany()
  await prisma.turno.deleteMany()

  // Crear turnos de ejemplo para noviembre 2025
  const turnos = await prisma.turno.createMany({
    data: [
      {
        fecha: new Date('2025-11-28'),
        horaInicio: '08:00',
        horaFin: '09:00',
        cupoMaximo: 10,
        estado: true,
      },
      {
        fecha: new Date('2025-11-28'),
        horaInicio: '10:00',
        horaFin: '11:00',
        cupoMaximo: 15,
        estado: true,
      },
      {
        fecha: new Date('2025-11-29'),
        horaInicio: '09:00',
        horaFin: '10:00',
        cupoMaximo: 20,
        estado: true,
      },
      {
        fecha: new Date('2025-12-02'),
        horaInicio: '14:00',
        horaFin: '15:00',
        cupoMaximo: 12,
        estado: true,
      },
    ],
  })

  console.log(`✅ Creados ${turnos.count} turnos de ejemplo`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
