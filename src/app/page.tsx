'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { CalendarView } from '@/components/calendar/CalendarView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TurnoDetailDialog } from '@/components/turnos/TurnoDetailDialog'
import { Turno } from '@/types'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '@/lib/config'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'month' | 'week' | 'day' | 'list'

export default function Home() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  // Dialog states
  const [isTurnoDetailDialogOpen, setIsTurnoDetailDialogOpen] = useState(false)
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Search state
  const [searchDni, setSearchDni] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [highlightedDni, setHighlightedDni] = useState<string | undefined>(undefined)

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



  const fetchTurnoById = async (id: number) => {
    try {
      const res = await fetch(API_ENDPOINTS.turnoById(id))
      if (res.ok) {
        const updatedTurno = await res.json()
        setSelectedTurno(updatedTurno)
      }
    } catch (error) {
      console.error('Error refreshing turno:', error)
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

      await res.json()

      // Show success message
      toast.success('Inscripción exitosa')

      // Don't close the dialog, just refresh data so the list updates
      fetchTurnosForMonth(currentDate)

      // Also update the selected turno to reflect the new inscription immediately if possible
      fetchTurnoById(selectedTurno.id)

      // Set the highlighted DNI to show the newly created inscription
      setHighlightedDni(data.dni)

    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleTurnoClick = (turno: Turno) => {
    setSelectedTurno(turno)
    setHighlightedDni(undefined) // Clear highlighted DNI when clicking normally
    setIsTurnoDetailDialogOpen(true)
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
        setHighlightedDni(searchDni.trim()) // Set the DNI to highlight
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
    <div className="container mx-auto p-3 sm:p-4 md:p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">Calendario de Turnos</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Gestiona los turnos y la disponibilidad.</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 bg-card p-1 sm:p-1.5 rounded-xl border shadow-sm w-full md:w-auto overflow-x-auto">
            {/* View Mode Selector */}
            <div className="flex items-center bg-muted/50 rounded-lg p-0.5 sm:p-1 min-w-max">
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className={cn(
                  "rounded-md px-2 sm:px-3 py-1 sm:py-1.5 h-7 sm:h-8 text-xs sm:text-sm font-medium transition-all touch-manipulation",
                  viewMode === 'month' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Mes
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className={cn(
                  "rounded-md px-2 sm:px-3 py-1 sm:py-1.5 h-7 sm:h-8 text-xs sm:text-sm font-medium transition-all touch-manipulation",
                  viewMode === 'week' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Semana
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
                className={cn(
                  "rounded-md px-2 sm:px-3 py-1 sm:py-1.5 h-7 sm:h-8 text-xs sm:text-sm font-medium transition-all touch-manipulation",
                  viewMode === 'day' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Día
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  "rounded-md px-2 sm:px-3 py-1 sm:py-1.5 h-7 sm:h-8 text-xs sm:text-sm font-medium transition-all touch-manipulation",
                  viewMode === 'list' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Lista
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:max-w-md relative group">
          <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            type="text"
            placeholder="Buscar turno por DNI..."
            value={searchDni}
            onChange={(e) => setSearchDni(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchByDni()
              }
            }}
            className="pl-8 sm:pl-10 pr-16 sm:pr-20 h-10 sm:h-11 bg-card border-border/60 focus-visible:ring-primary/20 transition-all shadow-sm text-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-1 sm:pr-1.5 gap-0.5 sm:gap-1">
            {searchDni && (
              <button
                onClick={handleClearSearch}
                className="p-1 sm:p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
              >
                <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
            )}
            <Button
              onClick={handleSearchByDni}
              disabled={isSearching || !searchDni.trim()}
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-xs font-medium touch-manipulation"
            >
              {isSearching ? '...' : 'Buscar'}
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
            setHighlightedDni(undefined) // Clear highlighted DNI when closing
          }
        }}
        turno={selectedTurno}
        onSubmitInscripcion={handleInscribir}
        onToggleAtendido={handleToggleAtendido}
        highlightedDni={highlightedDni}
      />
    </div>
  )
}
