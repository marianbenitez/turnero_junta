'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { CalendarView } from '@/components/calendar/CalendarView'
import { Button } from '@/components/ui/button'
import { TurnoDialog } from '@/components/turnos/TurnoDialog'
import { TurnoDetailDialog } from '@/components/turnos/TurnoDetailDialog'
import { InscripcionDialog } from '@/components/turnos/InscripcionDialog'
import { Turno } from '@/types'
import { toast } from 'sonner'

type ViewMode = 'month' | 'week' | 'day' | 'list'

export default function Home() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  // Dialog states
  const [isTurnoDialogOpen, setIsTurnoDialogOpen] = useState(false)
  const [isTurnoDetailDialogOpen, setIsTurnoDetailDialogOpen] = useState(false)
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isInscripcionDialogOpen, setIsInscripcionDialogOpen] = useState(false)

  // Fetch turnos for the current month
  useEffect(() => {
    fetchTurnosForMonth(currentDate)
  }, [currentDate])

  // SSE Connection
  useEffect(() => {
    const eventSource = new EventSource('/api/turnos/events')

    eventSource.addEventListener('inscripcion-updated', (e) => {
      const data = JSON.parse(e.data)
      console.log('Inscripción actualizada:', data)
      // Refresh turnos when there's an update
      fetchTurnosForMonth(currentDate)
    })

    return () => {
      eventSource.close()
    }
  }, [currentDate])

  const fetchTurnosForMonth = async (date: Date) => {
    setLoading(true)
    try {
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)

      console.log('Fetching turnos for month:', format(date, 'MMMM yyyy'))

      // Fetch all turnos for the month
      const res = await fetch(`/api/turnos`)
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to fetch turnos: ${res.status}`)
      }

      const data = await res.json()
      console.log('Received turnos:', data.length)

      // Filter turnos to only show those in the current month
      const filtered = data.filter((turno: any) => {
        const turnoDate = new Date(turno.fecha)
        const isInMonth = turnoDate >= monthStart && turnoDate <= monthEnd
        return isInMonth
      })

      console.log('Filtered turnos for current month:', filtered.length)
      setTurnos(filtered)
    } catch (error: any) {
      console.error('Error fetching turnos:', error)
      toast.error('Error al cargar turnos: ' + (error.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTurno = async (data: Partial<Turno>) => {
    try {
      const formattedDate = selectedDate
        ? format(selectedDate, 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd')

      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, fecha: formattedDate }),
      })

      if (!res.ok) throw new Error('Failed to create turno')

      toast.success('Turno creado exitosamente')
      setIsTurnoDialogOpen(false)
      setSelectedDate(undefined)
      fetchTurnosForMonth(currentDate)
    } catch (error) {
      toast.error('Error al crear turno')
    }
  }

  const handleUpdateTurno = async (data: Partial<Turno>) => {
    if (!selectedTurno) return

    try {
      const res = await fetch(`/api/turnos/${selectedTurno.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to update turno')

      toast.success('Turno actualizado exitosamente')
      setIsTurnoDialogOpen(false)
      setSelectedTurno(null)
      fetchTurnosForMonth(currentDate)
    } catch (error) {
      toast.error('Error al actualizar turno')
    }
  }

  const handleDeleteTurno = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este turno?')) return

    try {
      const res = await fetch(`/api/turnos/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete turno')
      }

      toast.success('Turno eliminado exitosamente')
      fetchTurnosForMonth(currentDate)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleInscribir = async (data: any) => {
    if (!selectedTurno) return

    try {
      const res = await fetch(`/api/turnos/${selectedTurno.id}/inscribir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to inscribe')
      }

      toast.success('Inscripción exitosa')
      setIsInscripcionDialogOpen(false)
      setSelectedTurno(null)
      fetchTurnosForMonth(currentDate)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleTurnoClick = (turno: Turno) => {
    setSelectedTurno(turno)
    setIsTurnoDetailDialogOpen(true)
  }

  const handleCreateFromDate = (date: Date) => {
    setSelectedDate(date)
    setSelectedTurno(null)
    setIsTurnoDialogOpen(true)
  }

  const handleEditFromDetail = () => {
    setIsTurnoDetailDialogOpen(false)
    setIsTurnoDialogOpen(true)
  }

  const handleDeleteFromDetail = async () => {
    if (!selectedTurno) return
    setIsTurnoDetailDialogOpen(false)
    await handleDeleteTurno(selectedTurno.id)
  }

  const handleInscribirFromDetail = () => {
    setIsTurnoDetailDialogOpen(false)
    setIsInscripcionDialogOpen(true)
  }

  const handleToggleAtendido = async (inscripcionId: number, atendido: boolean) => {
    try {
      const res = await fetch(`/api/inscripciones/${inscripcionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ atendido }),
      })

      if (!res.ok) throw new Error('Failed to update inscripción')

      toast.success(atendido ? 'Marcado como atendido' : 'Marcado como pendiente')
      fetchTurnosForMonth(currentDate)
    } catch (error) {
      toast.error('Error al actualizar inscripción')
    }
  }

  return (
    <div className="container mx-auto p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendario de Turnos</h1>

        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Mes
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Semana
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Día
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 overflow-hidden">
        {loading && turnos.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Cargando turnos...</p>
          </div>
        ) : (
          <CalendarView
            turnos={turnos}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onTurnoClick={handleTurnoClick}
            onCreateTurno={handleCreateFromDate}
            viewMode={viewMode}
          />
        )}
      </div>

      {/* Dialogs */}
      <TurnoDetailDialog
        open={isTurnoDetailDialogOpen}
        onOpenChange={(open) => {
          setIsTurnoDetailDialogOpen(open)
          if (!open) {
            setSelectedTurno(null)
          }
        }}
        turno={selectedTurno}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
        onInscribir={handleInscribirFromDetail}
        onToggleAtendido={handleToggleAtendido}
      />

      <TurnoDialog
        open={isTurnoDialogOpen}
        onOpenChange={(open) => {
          setIsTurnoDialogOpen(open)
          if (!open) {
            setSelectedTurno(null)
            setSelectedDate(undefined)
          }
        }}
        onSubmit={selectedTurno ? handleUpdateTurno : handleCreateTurno}
        initialData={selectedTurno}
        selectedDate={selectedDate}
      />

      <InscripcionDialog
        open={isInscripcionDialogOpen}
        onOpenChange={(open) => {
          setIsInscripcionDialogOpen(open)
          if (!open) {
            setSelectedTurno(null)
          }
        }}
        onSubmit={handleInscribir}
        turno={selectedTurno}
      />
    </div>
  )
}
