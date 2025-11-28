import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Turno } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox' // Need to install checkbox

interface TurnoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Turno>) => void
  initialData?: Turno | null
  selectedDate?: Date
}

export function TurnoDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  selectedDate,
}: TurnoDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Turno>>({
    defaultValues: {
      estado: true,
      cupoMaximo: 10,
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          horaInicio: initialData.horaInicio,
          horaFin: initialData.horaFin,
          cupoMaximo: initialData.cupoMaximo,
          estado: initialData.estado,
        })
      } else {
        reset({
          horaInicio: '',
          horaFin: '',
          cupoMaximo: 10,
          estado: true,
        })
      }
    }
  }, [open, initialData, reset])

  const onFormSubmit = (data: Partial<Turno>) => {
    // If creating, we might need to add the date
    if (!initialData && selectedDate) {
      // Format date as YYYY-MM-DD for the API
      // But API expects ISO string or YYYY-MM-DD.
      // Let's pass the date object or string to the parent handler
    }
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Turno' : 'Crear Turno'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="horaInicio" className="text-right">
              Inicio
            </Label>
            <Input
              id="horaInicio"
              type="time"
              className="col-span-3"
              {...register('horaInicio', { required: true })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="horaFin" className="text-right">
              Fin
            </Label>
            <Input
              id="horaFin"
              type="time"
              className="col-span-3"
              {...register('horaFin', { required: true })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cupoMaximo" className="text-right">
              Cupo
            </Label>
            <Input
              id="cupoMaximo"
              type="number"
              className="col-span-3"
              {...register('cupoMaximo', { required: true, min: 1 })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="estado" className="text-right">
              Habilitado
            </Label>
            <div className="flex items-center space-x-2">
                <input 
                    type="checkbox" 
                    id="estado" 
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    {...register('estado')}
                />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
