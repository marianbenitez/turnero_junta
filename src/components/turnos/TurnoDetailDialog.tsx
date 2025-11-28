'use client'

import { Turno } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Clock, Users, Calendar, Edit, Trash, UserPlus, CheckCircle } from 'lucide-react'

interface TurnoDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  turno: Turno | null
  onEdit?: () => void
  onDelete?: () => void
  onInscribir?: () => void
  onToggleAtendido?: (inscripcionId: number, atendido: boolean) => void
}

export function TurnoDetailDialog({
  open,
  onOpenChange,
  turno,
  onEdit,
  onDelete,
  onInscribir,
  onToggleAtendido,
}: TurnoDetailDialogProps) {
  if (!turno) return null

  const cupoDisponible = turno.cupoActual
  const cupoPercentage = (cupoDisponible / turno.cupoMaximo) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalles del Turno</span>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Turno Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-semibold">
                  {format(new Date(turno.fecha), 'EEEE, dd MMMM yyyy', { locale: es })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Horario</p>
                <p className="font-semibold">
                  {turno.horaInicio} - {turno.horaFin}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Cupo</p>
                <p className="font-semibold">
                  {cupoDisponible} de {turno.cupoMaximo} disponibles
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${
                      cupoPercentage > 50
                        ? 'bg-green-500'
                        : cupoPercentage > 25
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${cupoPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={turno.estado ? 'default' : 'secondary'}>
                  {turno.estado ? 'Habilitado' : 'Deshabilitado'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Inscripciones */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Inscripciones ({turno.inscripciones.length})
              </h3>
              {onInscribir && cupoDisponible > 0 && turno.estado && (
                <Button size="sm" onClick={onInscribir}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nueva Inscripción
                </Button>
              )}
            </div>

            {turno.inscripciones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay inscripciones para este turno
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Fecha Inscripción</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {turno.inscripciones.map((inscripcion) => (
                      <TableRow key={inscripcion.id}>
                        <TableCell className="font-medium">{inscripcion.nombre}</TableCell>
                        <TableCell>{inscripcion.dni}</TableCell>
                        <TableCell>{inscripcion.email || '-'}</TableCell>
                        <TableCell>{inscripcion.telefono || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(inscripcion.fechaInscripcion), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() =>
                              onToggleAtendido?.(inscripcion.id, !inscripcion.atendido)
                            }
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                              inscripcion.atendido
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            <CheckCircle className="h-3 w-3" />
                            {inscripcion.atendido ? 'Atendido' : 'Pendiente'}
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
