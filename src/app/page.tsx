'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { CalendarView } from '@/components/calendar/CalendarView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TurnoDialog } from '@/components/turnos/TurnoDialog'
import { TurnoDetailDialog } from '@/components/turnos/TurnoDetailDialog'
import { InscripcionDialog } from '@/components/turnos/InscripcionDialog'
import { Turno } from '@/types'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '@/lib/config'
import { Search, X } from 'lucide-react'

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

  // Search state
  const [searchDni, setSearchDni] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Fetch turnos for the current month
  useEffect(() => {
    fetchTurnosForMonth(currentDate)
  }, [currentDate])

  // SSE Connection to external API
  useEffect(() => {
    let eventSource: EventSource | null = null

    try {
      eventSource = new EventSource(API_ENDPOINTS.events)

      eventSource.addEventListener('inscripcion-updated', (e) => {
        const data = JSON.parse(e.data)
        console.log('✅ Inscripción actualizada:', data)
        // Refresh turnos when there's an update
        fetchTurnosForMonth(currentDate)
      })

      eventSource.addEventListener('open', () => {
        console.log('✅ SSE conectado a:', API_ENDPOINTS.events)
      })

      eventSource.onerror = () => {
        console.warn('⚠️ SSE desconectado (reconectando automáticamente):', API_ENDPOINTS.events)
        // La reconexión es automática, no es necesario hacer nada
      }
    } catch (error) {
      console.warn('⚠️ No se pudo conectar al SSE. La aplicación funcionará sin sincronización en tiempo real.')
    }

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [currentDate])

  const fetchTurnosForMonth = async (date: Date) => {
    setLoading(true)
    try {
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)

      console.log('Fetching turnos for month:', format(date, 'MMMM yyyy'))
      console.log('API URL:', API_ENDPOINTS.turnos)

      // Fetch all turnos from external API
      const res = await fetch(API_ENDPOINTS.turnos)
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

      const res = await fetch(API_ENDPOINTS.turnos, {
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
      const res = await fetch(API_ENDPOINTS.turnoById(selectedTurno.id), {
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
      const res = await fetch(API_ENDPOINTS.turnoById(id), {
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
      const res = await fetch(API_ENDPOINTS.inscribir(selectedTurno.id), {
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
      const res = await fetch(API_ENDPOINTS.inscripcion(inscripcionId), {
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

  const handleSearchByDni = async () => {
    if (!searchDni.trim()) {
      toast.error('Ingrese un DNI para buscar')
      return
    }

    setIsSearching(true)
    try {
      // Fetch all turnos from the API
      const res = await fetch(API_ENDPOINTS.turnos)
      if (!res.ok) throw new Error('Failed to fetch turnos')

      const allTurnos: Turno[] = await res.json()

      // Find turno that has an inscripcion with the searched DNI
      const foundTurno = allTurnos.find(turno =>
        turno.inscripciones?.some(inscripcion =>
          inscripcion.dni.toLowerCase().includes(searchDni.toLowerCase().trim())
        )
      )

      if (foundTurno) {
        setSelectedTurno(foundTurno)
        setIsTurnoDetailDialogOpen(true)
        toast.success(`Turno encontrado para DNI: ${searchDni}`)
      } else {
        toast.error(`No se encontró ningún turno para el DNI: ${searchDni}`)
      }
    } catch (error) {
      toast.error('Error al buscar turno por DNI')
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchDni('')
  }

  return (
    <div className="container mx-auto p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
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

        {/* Search Bar */}
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por DNI..."
              value={searchDni}
              onChange={(e) => setSearchDni(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchByDni()
                }
              }}
              className="pl-9 pr-9"
            />
            {searchDni && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSearchByDni}
            disabled={isSearching || !searchDni.trim()}
            size="default"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
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
