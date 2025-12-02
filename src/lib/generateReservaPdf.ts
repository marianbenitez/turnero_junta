import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Turno } from '@/types'

interface InscripcionData {
  nombre: string
  dni: string
  email?: string | null
  telefono?: string | null
}

export function generateReservaPdf(
  turno: Turno,
  inscripcion: InscripcionData
): void {
  const doc = new jsPDF()

  // Colores
  const primaryColor = [34, 197, 94] // green-500
  const textColor = [15, 23, 42] // slate-900
  const lightGray = [241, 245, 249] // slate-100
  const mediumGray = [148, 163, 184] // slate-400

  // Configuración inicial
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 210, 40, 'F')

  // Título
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Comprobante de Reserva', 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Turno Junta', 105, 30, { align: 'center' })

  // Resetear color de texto
  doc.setTextColor(textColor[0], textColor[1], textColor[2])

  // Información del turno
  let yPosition = 55

  // Box para datos del turno
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
  doc.roundedRect(15, yPosition, 180, 35, 3, 3, 'F')

  yPosition += 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Información del Turno', 20, yPosition)

  yPosition += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2])
  doc.text('Fecha:', 20, yPosition)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFont('helvetica', 'bold')
  const fechaFormatted = format(new Date(turno.fecha), 'EEEE, dd MMMM yyyy', {
    locale: es,
  })
  doc.text(fechaFormatted.charAt(0).toUpperCase() + fechaFormatted.slice(1), 70, yPosition)

  yPosition += 7
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2])
  doc.text('Horario:', 20, yPosition)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFont('helvetica', 'bold')
  doc.text(`${turno.horaInicio} - ${turno.horaFin}`, 70, yPosition)

  // Información de la persona
  yPosition += 20
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
  doc.roundedRect(15, yPosition, 180, 55, 3, 3, 'F')

  yPosition += 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text('Datos del Solicitante', 20, yPosition)

  yPosition += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2])
  doc.text('Nombre:', 20, yPosition)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFont('helvetica', 'bold')
  doc.text(inscripcion.nombre, 70, yPosition)

  yPosition += 7
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2])
  doc.text('DNI:', 20, yPosition)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFont('helvetica', 'bold')
  doc.text(inscripcion.dni, 70, yPosition)

  if (inscripcion.email) {
    yPosition += 7
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2])
    doc.text('Email:', 20, yPosition)
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFont('helvetica', 'normal')
    doc.text(inscripcion.email, 70, yPosition)
  }

  if (inscripcion.telefono) {
    yPosition += 7
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2])
    doc.text('Teléfono:', 20, yPosition)
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFont('helvetica', 'normal')
    doc.text(inscripcion.telefono, 70, yPosition)
  }

  // Notas importantes
  yPosition += 15
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
  doc.roundedRect(15, yPosition, 180, 50, 3, 3, 'F')

  yPosition += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text('Importante', 20, yPosition)

  yPosition += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2])

  const nota1 = '• Debe presentarse con este comprobante y su DNI en el'
  const nota2 = '  horario indicado.'
  const nota3 = '• Si es por primera vez, presentar carpeta con los títulos'
  const nota4 = '  para ser valorados.'

  doc.text(nota1, 20, yPosition)
  doc.text(nota2, 20, yPosition + 5)
  doc.text(nota3, 20, yPosition + 12)
  doc.text(nota4, 20, yPosition + 17)

  // Footer
  yPosition = 270
  doc.setFontSize(9)
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2])
  doc.text(
    `Generado el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}`,
    105,
    yPosition,
    { align: 'center' }
  )

  // Línea decorativa en el footer
  doc.setDrawColor(mediumGray[0], mediumGray[1], mediumGray[2])
  doc.setLineWidth(0.5)
  doc.line(15, yPosition - 5, 195, yPosition - 5)

  // Descargar el PDF
  const fileName = `Reserva_Turno_${inscripcion.dni}_${format(
    new Date(turno.fecha),
    'ddMMyyyy'
  )}.pdf`
  doc.save(fileName)
}
