import { Turno } from '@/types'
import { TurnoCard } from './TurnoCard'

interface TurnoListProps {
  turnos: Turno[]
  onEdit: (turno: Turno) => void
  onDelete: (id: number) => void
  onInscribir: (turno: Turno) => void
  onViewInscripciones: (turno: Turno) => void
}

export function TurnoList({
  turnos,
  onEdit,
  onDelete,
  onInscribir,
  onViewInscripciones,
}: TurnoListProps) {
  if (turnos.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No hay turnos para esta fecha.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {turnos.map((turno) => (
        <TurnoCard
          key={turno.id}
          turno={turno}
          onEdit={onEdit}
          onDelete={onDelete}
          onInscribir={onInscribir}
          onViewInscripciones={onViewInscripciones}
        />
      ))}
    </div>
  )
}
