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
  viewMode: 'month' | 'week' | 'day' | 'list'
}

export function CalendarView({
  turnos,
  currentDate,
  onDateChange,
  onTurnoClick,
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
          className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground py-2 sm:py-4 border-b border-border/50 uppercase tracking-wider"
        >
          {format(addDays(startDateCopy, i), dateFormat, { locale: es })}
        </div>
      )
    }

    return <div className="grid grid-cols-7 bg-muted/20">{days}</div>
  }

  const renderCells = () => {
    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ''

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd')
        const cloneDay = day
        const dayTurnos = getTurnosForDate(cloneDay)
        const isCurrentMonth = isSameMonth(day, monthStart)
        const isDayToday = isToday(day)
        const isSelected = isSameDay(day, selectedDate)

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[80px] sm:min-h-[120px] lg:min-h-[140px] border-r border-b border-border/50 p-1 sm:p-2 transition-all relative group bg-card hover:bg-muted/30",
              !isCurrentMonth && "bg-muted/10 text-muted-foreground/50",
              isSelected && "ring-1 ring-primary ring-inset bg-primary/5"
            )}
            onClick={() => {
              setSelectedDate(cloneDay)
            }}
          >
            <div className="flex justify-between items-start mb-1 sm:mb-2">
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-colors",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isDayToday && "bg-primary text-primary-foreground shadow-sm font-bold",
                  !isDayToday && isSelected && "text-primary font-bold"
                )}
              >
                {formattedDate}
              </span>
            </div>

            <div className="space-y-0.5 sm:space-y-1 overflow-y-auto max-h-[50px] sm:max-h-[80px] lg:max-h-[100px] pr-0.5 sm:pr-1 custom-scrollbar">
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
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
        <p className="text-lg font-medium">Vista {viewMode} en desarrollo</p>
        <p className="text-sm">Pronto estará disponible</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-border/60 bg-card gap-3 sm:gap-0">
        <div className="flex items-center justify-between sm:justify-start gap-2">
           <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8 hover:bg-background hover:shadow-sm touch-manipulation"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8 hover:bg-background hover:shadow-sm touch-manipulation"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-base sm:text-xl font-bold capitalize ml-2 text-foreground/90">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handleToday}
            className="h-9 px-3 sm:px-4 font-medium hover:bg-muted/50 touch-manipulation flex-1 sm:flex-none"
          >
            Hoy
          </Button>

          <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground touch-manipulation hidden sm:flex">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground touch-manipulation hidden sm:flex">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden bg-background">
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  )
}
