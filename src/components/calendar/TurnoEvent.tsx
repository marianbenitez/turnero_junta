'use client'

import { Turno } from '@/types'
import { cn } from '@/lib/utils'
import { Users, Clock } from 'lucide-react'

interface TurnoEventProps {
  turno: Turno
  onClick: () => void
}

const EVENT_STYLES = [
  'bg-[var(--chart-1)]/15 text-[var(--chart-1)] border-l-[3px] border-l-[var(--chart-1)] hover:bg-[var(--chart-1)]/25',
  'bg-[var(--chart-2)]/15 text-[var(--chart-2)] border-l-[3px] border-l-[var(--chart-2)] hover:bg-[var(--chart-2)]/25',
  'bg-[var(--chart-3)]/15 text-[var(--chart-3)] border-l-[3px] border-l-[var(--chart-3)] hover:bg-[var(--chart-3)]/25',
  'bg-[var(--chart-4)]/15 text-[var(--chart-4)] border-l-[3px] border-l-[var(--chart-4)] hover:bg-[var(--chart-4)]/25',
  'bg-[var(--chart-5)]/15 text-[var(--chart-5)] border-l-[3px] border-l-[var(--chart-5)] hover:bg-[var(--chart-5)]/25',
]

export function TurnoEvent({ turno, onClick }: TurnoEventProps) {
  // Get a consistent color based on turno ID
  const styleClass = EVENT_STYLES[turno.id % EVENT_STYLES.length]

  const cupoOcupado = turno.inscripciones?.length || 0
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "w-full text-left px-2 py-1.5 rounded-r-md text-xs transition-all cursor-pointer group mb-1",
        styleClass,
        !turno.estado && "opacity-50 cursor-not-allowed grayscale"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Clock className="h-3 w-3 flex-shrink-0 opacity-70" />
          <span className="font-semibold truncate">
            {turno.horaInicio}
          </span>
        </div>

        <div className={cn("flex items-center gap-1 flex-shrink-0 opacity-80")}>
          <Users className="h-3 w-3" />
          <span className="text-[10px] font-bold">
            {cupoOcupado}/{turno.cupoMaximo}
          </span>
        </div>
      </div>
    </button>
  )
}
