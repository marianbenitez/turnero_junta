'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Filter, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Turno } from '@/types'
import { TurnoEvent } from './TurnoEvent'
import { cn } from '@/lib/utils'

interface CalendarViewProps {
  turnos: Turno[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onTurnoClick: (turno: Turno) => void
  onCreateTurno?: (date: Date) => void
  viewMode: 'month' | 'week' | 'day' | 'list'
}

export function CalendarView({
  turnos,
  currentDate,
  onDateChange,
  onTurnoClick,
  onCreateTurno,
  viewMode
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { locale: es })
  const endDate = endOfWeek(monthEnd, { locale: es })

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1)
    onDateChange(newDate)
  }

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1)
    onDateChange(newDate)
  }

  const handleToday = () => {
    const today = new Date()
    onDateChange(today)
    setSelectedDate(today)
  }

  const getTurnosForDate = (date: Date) => {
    return turnos.filter(turno => {
      const turnoDate = new Date(turno.fecha)
      return isSameDay(turnoDate, date)
    }).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  }

  const renderDays = () => {
    const days = []
    const dateFormat = 'EEEEEE'
    let startDateCopy = startDate

    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={i}
          className="text-center text-sm font-medium text-muted-foreground py-3 border-b"
        >
          {format(addDays(startDateCopy, i), dateFormat, { locale: es }).toUpperCase()}
        </div>
      )
    }

    return <div className="grid grid-cols-7">{days}</div>
  }

  const renderCells = () => {
    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day
        const dayTurnos = getTurnosForDate(cloneDay)
        const isCurrentMonth = isSameMonth(day, monthStart)
        const isDayToday = isToday(day)
        const isSelected = isSameDay(day, selectedDate)

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[120px] border-r border-b p-2 transition-colors relative group",
              !isCurrentMonth && "bg-muted/30 text-muted-foreground",
              isDayToday && "bg-blue-50 dark:bg-blue-950/20",
              isSelected && "ring-2 ring-blue-500 ring-inset"
            )}
            onClick={() => {
              setSelectedDate(cloneDay)
              if (onCreateTurno && isCurrentMonth) {
                // Optional: trigger create dialog on day click
              }
            }}
          >
            <div className="flex justify-between items-start mb-1">
              <span
                className={cn(
                  "text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full",
                  !isCurrentMonth && "text-muted-foreground",
                  isDayToday && "bg-blue-600 text-white font-bold"
                )}
              >
                {format(cloneDay, 'd')}
              </span>

              {isCurrentMonth && onCreateTurno && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCreateTurno(cloneDay)
                  }}
                >
                  <span className="text-lg">+</span>
                </Button>
              )}
            </div>

            <div className="space-y-1 overflow-y-auto max-h-[90px]">
              {dayTurnos.map((turno) => (
                <TurnoEvent
                  key={turno.id}
                  turno={turno}
                  onClick={() => onTurnoClick(turno)}
                />
              ))}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      )
      days = []
    }
    return <div>{rows}</div>
  }

  if (viewMode !== 'month') {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Vista {viewMode} en desarrollo
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 py-3 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={handleToday}
            className="h-9"
          >
            Hoy
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-background">
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  )
}
