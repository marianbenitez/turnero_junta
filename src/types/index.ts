export interface Inscripcion {
  id: number
  turnoId: number
  nombre: string
  dni: string
  email?: string | null
  telefono?: string | null
  atendido: boolean
  fechaInscripcion: string
}

export interface Turno {
  id: number
  fecha: string
  horaInicio: string
  horaFin: string
  cupoMaximo: number
  estado: boolean
  inscripciones: Inscripcion[]
  cupoActual: number
}
