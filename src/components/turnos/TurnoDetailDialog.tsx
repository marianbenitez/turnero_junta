'use client'

import { Turno } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useForm } from 'react-hook-form'

// Función auxiliar para formatear fechas de forma segura
function formatSafeDate(dateValue: any, formatString: string): string {
  try {
    if (!dateValue) return '-'
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return '-'
    return format(date, formatString, { locale: es })
  } catch {
    return '-'
  }
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock, Users, Calendar, UserPlus, User, Mail, Phone, CreditCard, CheckCircle2, Download } from 'lucide-react'
import { generateReservaPdf } from '@/lib/generateReservaPdf'

interface TurnoDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  turno: Turno | null
  onSubmitInscripcion?: (data: any) => void
  onToggleAtendido?: (inscripcionId: number, atendido: boolean) => void
  highlightedDni?: string // DNI to highlight when opened from search
}

export function TurnoDetailDialog({
  open,
  onOpenChange,
  turno,
  onSubmitInscripcion,
  onToggleAtendido,
  highlightedDni,
}: TurnoDetailDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  if (!turno) return null

  // Find the highlighted inscription if searching by DNI
  const highlightedInscripcion = highlightedDni
    ? turno.inscripciones?.find(
        (inscripcion) => inscripcion.dni.toLowerCase() === highlightedDni.toLowerCase()
      )
    : null

  // Calculate occupied spots directly from inscripciones array
  const cupoOcupado = turno.inscripciones?.length || 0
  const cupoDisponible = turno.cupoMaximo - cupoOcupado
  const cupoPercentage = (cupoDisponible / turno.cupoMaximo) * 100
  const canInscribe = cupoDisponible > 0 && turno.estado

  const onFormSubmit = (data: any) => {
    if (onSubmitInscripcion) {
      onSubmitInscripcion(data)
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-hidden bg-card w-[95vw] sm:w-full">
        {/* Header with colored background */}
        <div className="bg-muted/40 px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full flex-shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
               <DialogTitle className="text-base sm:text-xl truncate">Detalles del Turno</DialogTitle>
               <p className="text-xs sm:text-sm text-muted-foreground capitalize truncate">
                {formatSafeDate(turno.fecha, 'EEEE, dd MMMM yyyy')}
               </p>
            </div>
          </div>
          <Badge variant={turno.estado ? 'default' : 'secondary'} className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs flex-shrink-0">
            {turno.estado ? 'Habilitado' : 'Deshabilitado'}
          </Badge>
        </div>

        <div className={highlightedInscripcion ? "h-full" : "grid grid-cols-1 lg:grid-cols-5 h-full"}>
          {/* Left Column: Details - Hidden when showing search results */}
          {!highlightedInscripcion && (
            <div className="lg:col-span-2 p-4 sm:p-6 border-r bg-muted/5 space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">Información</h4>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background border shadow-sm">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Horario</p>
                    <p className="font-semibold text-lg">
                      {turno.horaInicio} - {turno.horaFin}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background border shadow-sm">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div className="w-full">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-xs text-muted-foreground font-medium">Cupo Utilizado</p>
                      <p className="text-sm font-bold">
                        {cupoOcupado} / {turno.cupoMaximo}
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cupoPercentage < 50
                            ? 'bg-[var(--chart-2)]'
                            : cupoPercentage < 75
                            ? 'bg-[var(--chart-3)]'
                            : 'bg-[var(--chart-5)]'
                        }`}
                        style={{ width: `${100 - cupoPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Inscription Form or Search Result */}
          <div className={highlightedInscripcion ? "p-4 sm:p-6 bg-card" : "lg:col-span-3 p-4 sm:p-6 bg-card"}>
            <div className="h-full flex flex-col">
              {/* Show highlighted inscription if found via DNI search */}
              {highlightedInscripcion ? (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-bold text-green-600">Turno Encontrado</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Se encontró una inscripción para el DNI buscado.
                    </p>
                  </div>

                  {/* Person Details Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-green-200 dark:border-green-800">
                      <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                        <User className="h-6 w-6 text-green-700 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-green-900 dark:text-green-100">
                          {highlightedInscripcion.nombre}
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Datos de la inscripción
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-black/20 border border-green-100 dark:border-green-900">
                        <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-green-700 dark:text-green-500 font-medium">DNI</p>
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            {highlightedInscripcion.dni}
                          </p>
                        </div>
                      </div>

                      {highlightedInscripcion.email && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-black/20 border border-green-100 dark:border-green-900">
                          <Mail className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-green-700 dark:text-green-500 font-medium">Email</p>
                            <p className="font-semibold text-green-900 dark:text-green-100 truncate">
                              {highlightedInscripcion.email}
                            </p>
                          </div>
                        </div>
                      )}

                      {highlightedInscripcion.telefono && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-black/20 border border-green-100 dark:border-green-900">
                          <Phone className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-green-700 dark:text-green-500 font-medium">Teléfono</p>
                            <p className="font-semibold text-green-900 dark:text-green-100">
                              {highlightedInscripcion.telefono}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-black/20 border border-green-100 dark:border-green-900">
                        <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-green-700 dark:text-green-500 font-medium">Fecha del Turno</p>
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            {formatSafeDate(turno.fecha, 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-black/20 border border-green-100 dark:border-green-900">
                        <Clock className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-green-700 dark:text-green-500 font-medium">Horario</p>
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            {turno.horaInicio} - {turno.horaFin}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between gap-2">
                        <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          highlightedInscripcion.atendido
                            ? 'bg-green-600 text-white'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {highlightedInscripcion.atendido ? '✓ Atendido' : '⏳ Pendiente'}
                        </div>
                        <Button
                          onClick={() => generateReservaPdf(turno, highlightedInscripcion)}
                          variant="outline"
                          size="sm"
                          className="gap-1 sm:gap-2 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30 touch-manipulation text-xs sm:text-sm px-2 sm:px-3"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Descargar Reserva</span>
                          <span className="sm:hidden">Descargar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Original inscription form */}
                  <div className="mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Nueva Inscripción
                </h3>
                <p className="text-muted-foreground text-sm">
                  Complete los datos para inscribir a una persona.
                </p>
              </div>

              {canInscribe ? (
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input
                        id="nombre"
                        placeholder="Ej. Juan Pérez"
                        {...register('nombre', { required: true })}
                        className={errors.nombre ? "border-red-500" : ""}
                      />
                      {errors.nombre && <span className="text-xs text-red-500">Requerido</span>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dni">DNI</Label>
                      <Input
                        id="dni"
                        placeholder="Ej. 12345678"
                        {...register('dni', { required: true })}
                         className={errors.dni ? "border-red-500" : ""}
                      />
                       {errors.dni && <span className="text-xs text-red-500">Requerido</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        {...register('email')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></Label>
                      <Input
                        id="telefono"
                        placeholder="Ej. 264..."
                        {...register('telefono')}
                      />
                    </div>
                  </div>

                  <div className="pt-4 mt-auto">
                    <Button type="submit" className="w-full md:w-auto md:min-w-[200px] touch-manipulation" size="lg">
                      Confirmar Inscripción
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-8 bg-muted/20 rounded-xl border border-dashed">
                  <div className="bg-muted rounded-full p-4 mb-4">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h4 className="font-semibold text-lg text-muted-foreground">Inscripción No Disponible</h4>
                  <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
                    {!turno.estado 
                      ? "Este turno se encuentra deshabilitado temporalmente." 
                      : "Se han agotado todos los cupos disponibles para este horario."}
                  </p>
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-3 sm:p-4 border-t bg-muted/10 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="touch-manipulation w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
