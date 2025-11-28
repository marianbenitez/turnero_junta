import { Turno } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge' // Need to install badge
import { Users, Clock, Trash2, Edit } from 'lucide-react'

interface TurnoCardProps {
  turno: Turno
  onEdit: (turno: Turno) => void
  onDelete: (id: number) => void
  onInscribir: (turno: Turno) => void
  onViewInscripciones: (turno: Turno) => void
}

export function TurnoCard({
  turno,
  onEdit,
  onDelete,
  onInscribir,
  onViewInscripciones,
}: TurnoCardProps) {
  const isFull = turno.cupoActual === 0

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {turno.horaInicio} - {turno.horaFin}
        </CardTitle>
        {turno.estado ? (
          <span className={`px-2 py-1 rounded-full text-xs ${isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {isFull ? 'Completo' : 'Disponible'}
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
            Deshabilitado
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          <Users className="h-4 w-4" />
          <span>
            {turno.cupoMaximo - turno.cupoActual} / {turno.cupoMaximo} cupos
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
           <Button variant="outline" size="sm" onClick={() => onEdit(turno)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(turno.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
            <Button variant="secondary" size="sm" onClick={() => onViewInscripciones(turno)}>
                Ver
            </Button>
            <Button 
                size="sm" 
                disabled={!turno.estado || isFull}
                onClick={() => onInscribir(turno)}
            >
                Inscribir
            </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
