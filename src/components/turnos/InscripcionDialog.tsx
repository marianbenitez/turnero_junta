import { useForm } from 'react-hook-form'
import { Turno } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InscripcionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  turno: Turno | null
}

export function InscripcionDialog({
  open,
  onOpenChange,
  onSubmit,
  turno,
}: InscripcionDialogProps) {
  const { register, handleSubmit, reset } = useForm()

  const onFormSubmit = (data: any) => {
    onSubmit(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inscripción</DialogTitle>
          <DialogDescription>
            Inscribirse al turno de {turno?.horaInicio} - {turno?.horaFin}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nombre" className="text-right">
              Nombre
            </Label>
            <Input
              id="nombre"
              className="col-span-3"
              {...register('nombre', { required: true })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dni" className="text-right">
              DNI
            </Label>
            <Input
              id="dni"
              className="col-span-3"
              {...register('dni', { required: true })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              className="col-span-3"
              {...register('email')}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telefono" className="text-right">
              Teléfono
            </Label>
            <Input
              id="telefono"
              className="col-span-3"
              {...register('telefono')}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Inscribir</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
