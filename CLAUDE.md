# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

**Turnero Junta** - Sistema de gestión de turnos para una junta. Permite crear turnos con horarios específicos, gestionar inscripciones de personas y hacer seguimiento del cupo disponible en tiempo real.

## Comandos de Desarrollo

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo en http://localhost:3000

# Base de datos (Prisma)
npx prisma migrate dev      # Crear y aplicar migración
npx prisma db push         # Sincronizar schema sin crear migración
npx prisma studio          # Abrir Prisma Studio (GUI para DB)
npx prisma generate        # Regenerar Prisma Client después de cambios en schema

# Build y producción
npm run build        # Construir para producción
npm start           # Iniciar en modo producción
npm run lint        # Ejecutar linter
```

## Arquitectura del Sistema

### Stack Tecnológico
- **Framework**: Next.js 16 (App Router)
- **Base de datos**: SQLite con Prisma ORM
- **UI**: React 19 + Tailwind CSS + shadcn/ui components
- **Validación**: Zod + React Hook Form
- **Estado en tiempo real**: Server-Sent Events (SSE)

### Estructura de Base de Datos

El schema de Prisma define dos modelos principales:

**Turno** - Representa un turno con horario y cupo
- `fecha`: DateTime del turno
- `horaInicio` / `horaFin`: Strings que definen el rango horario
- `cupoMaximo`: Número máximo de inscripciones permitidas
- `estado`: Boolean para habilitar/deshabilitar el turno
- Relación: `inscripciones` (one-to-many)

**Inscripcion** - Representa una persona inscrita a un turno
- `turnoId`: Foreign key al turno
- `nombre`, `dni`, `email`, `telefono`: Datos del inscrito
- `atendido`: Boolean para marcar si ya fue atendido
- Relación: `turno` (many-to-one) con `onDelete: Cascade`

### Arquitectura de la Aplicación

**Patrón de diseño**: Next.js App Router con API Routes

**Frontend** ([src/app/page.tsx](src/app/page.tsx)):
- Cliente React con estado local usando hooks
- Calendario para selección de fecha (react-day-picker)
- Lista de turnos con sus inscripciones
- Dialogs para crear/editar turnos e inscripciones
- Conexión SSE para actualizaciones en tiempo real

**API Routes** (src/app/api):
- `GET/POST /api/turnos` - Listar y crear turnos
- `PATCH/DELETE /api/turnos/[id]` - Actualizar y eliminar turnos
- `POST /api/turnos/[id]/inscribir` - Inscribir persona a un turno
- `DELETE /api/inscripciones/[id]` - Eliminar inscripción
- `GET /api/turnos/events` - Endpoint SSE para tiempo real

**Componentes principales**:
- `TurnoList` - Lista de turnos del día seleccionado
- `TurnoCard` - Card individual de un turno con sus inscripciones
- `TurnoDialog` - Formulario para crear/editar turnos
- `InscripcionDialog` - Formulario para inscribirse a un turno

### Sistema de Tiempo Real (SSE)

El archivo [src/lib/sse.ts](src/lib/sse.ts) exporta un `EventEmitter` singleton que permite comunicación en tiempo real:

- **Server**: Las API routes usan `sendEvent()` para emitir eventos
- **Client**: Se conecta a `/api/turnos/events` y escucha eventos tipo `inscripcion-updated`
- **Propósito**: Sincronizar la vista de turnos cuando hay cambios (inscripciones, actualizaciones)

El SSE emitter usa un singleton global para persistir durante hot reloads en desarrollo.

### Manejo de Cupos

El cupo disponible (`cupoActual`) se calcula dinámicamente:
```typescript
cupoActual = cupoMaximo - inscripciones.length
```

No se almacena en la base de datos, se calcula en el backend al hacer queries y se incluye en la respuesta JSON.

### Singleton Patterns

Dos singletons globales importantes para evitar problemas en desarrollo (hot reload):
- `prisma` en [src/lib/prisma.ts](src/lib/prisma.ts) - Cliente de Prisma
- `sseEmitter` en [src/lib/sse.ts](src/lib/sse.ts) - EventEmitter para SSE

### Tipos TypeScript

Los tipos en [src/types/index.ts](src/types/index.ts) replican el schema de Prisma pero con ajustes:
- `fecha` y `fechaInscripcion` son strings (JSON serialization)
- `Turno` incluye `cupoActual` calculado
- `Turno` incluye array de `inscripciones`

### Path Alias

El proyecto usa `@/*` para importar desde `src/*`:
```typescript
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
```

## Base de Datos

- Ubicación: `dev.db` en la raíz del proyecto (SQLite)
- Schema: `prisma/schema.prisma`
- Configuración: `prisma.config.ts` carga variables de `.env`
- Variable de entorno: `DATABASE_URL="file:./dev.db"`

Al modificar el schema, ejecutar:
```bash
npx prisma migrate dev --name descripcion_del_cambio
```

## UI Components (shadcn/ui)

Componentes de UI pre-construidos en `src/components/ui/`:
- Instalados vía shadcn/ui CLI
- Configuración en `components.json`
- Basados en Radix UI + Tailwind CSS
- Modificar libremente según necesidades del proyecto
