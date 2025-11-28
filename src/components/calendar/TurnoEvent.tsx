'use client'

import { Turno } from '@/types'
import { cn } from '@/lib/utils'
import { Users, Clock } from 'lucide-react'

interface TurnoEventProps {
  turno: Turno
  onClick: () => void
}

const EVENT_COLORS = [
  'bg-orange-500 hover:bg-orange-600',
  'bg-purple-500 hover:bg-purple-600',
  'bg-blue-500 hover:bg-blue-600',
  'bg-pink-500 hover:bg-pink-600',
  'bg-green-500 hover:bg-green-600',
  'bg-yellow-500 hover:bg-yellow-600',
  'bg-red-500 hover:bg-red-600',
  'bg-indigo-500 hover:bg-indigo-600',
]

export function TurnoEvent({ turno, onClick }: TurnoEventProps) {
  // Get a consistent color based on turno ID
  const colorClass = EVENT_COLORS[turno.id % EVENT_COLORS.length]

  const cupoDisponible = turno.cupoActual
  const cupoPercentage = (cupoDisponible / turno.cupoMaximo) * 100

  // Determine status color based on availability
  let statusColor = 'text-green-100'
  if (cupoPercentage <= 25) {
    statusColor = 'text-red-100'
  } else if (cupoPercentage <= 50) {
    statusColor = 'text-yellow-100'
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "w-full text-left px-2 py-1 rounded text-xs text-white transition-colors cursor-pointer group",
        colorClass,
        !turno.estado && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="font-medium truncate">
            {turno.horaInicio}
          </span>
        </div>

        <div className={cn("flex items-center gap-1 flex-shrink-0", statusColor)}>
          <Users className="h-3 w-3" />
          <span className="text-[10px] font-semibold">
            {cupoDisponible}/{turno.cupoMaximo}
          </span>
        </div>
      </div>
    </button>
  )
}
