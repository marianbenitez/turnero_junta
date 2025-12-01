# Flujo de Inscripciones - Turnero Junta

## 📋 Flujo Completo

### 1️⃣ Obtener Turnos Disponibles
```
Frontend → GET /api/proxy/turnos → API Externa (puerto 3001)
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "fecha": "2025-12-03T00:00:00.000Z",
    "horaInicio": "09:00",
    "horaFin": "21:15",
    "cupoMaximo": 30,
    "cupoActual": 29,  // Calculado: cupoMaximo - inscripciones.length
    "estado": true,
    "inscripciones": [...]
  }
]
```

### 2️⃣ Mostrar Turnos en el Calendario
- El componente `CalendarView` muestra los turnos en una vista mensual
- Cada turno muestra: fecha, horario y cupo disponible
- Los turnos se agrupan por día

### 3️⃣ Usuario Selecciona un Turno
- Click en un turno abre `TurnoDetailDialog`
- Se muestra información completa del turno
- Botón "Agendar Turno" / "Inscribirse"

### 4️⃣ Formulario de Inscripción
El diálogo `InscripcionDialog` solicita:

```typescript
{
  nombre: string       // Ej: "Juan Pérez"
  dni: string         // Ej: "12345678"
  email: string       // Ej: "juan@ejemplo.com"
  telefono: string    // Ej: "12345678"
}
```

### 5️⃣ Crear Inscripción
```
Frontend → POST /api/proxy/turnos/{id}/inscribir → API Externa
```

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "dni": "12345678",
  "email": "juan@ejemplo.com",
  "telefono": "12345678"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": 123,
  "turnoId": 1,
  "nombre": "Juan Pérez",
  "dni": "12345678",
  "email": "juan@ejemplo.com",
  "telefono": "12345678",
  "atendido": false,
  "fechaInscripcion": "2025-12-01T10:30:00.000Z"
}
```

### 6️⃣ Actualización en Tiempo Real
- Después de crear la inscripción, se emite un evento SSE
- Todos los clientes conectados reciben el evento `inscripcion-updated`
- El frontend refresca automáticamente la lista de turnos
- El cupo disponible se actualiza en tiempo real

---

## 🔐 Autenticación

Todos los endpoints del proxy soportan 3 tipos de autenticación:

### Opción 1: API Key
```bash
# En .env.local
API_KEY=tu_api_key_aqui
```
Header enviado: `X-API-Key: tu_api_key_aqui`

### Opción 2: Bearer Token
```bash
# En .env.local
API_TOKEN=tu_token_aqui
```
Header enviado: `Authorization: Bearer tu_token_aqui`

### Opción 3: Basic Auth
```bash
# En .env.local
API_USERNAME=tu_usuario
API_PASSWORD=tu_password
```
Header enviado: `Authorization: Basic base64(usuario:password)`

---

## 🔄 Endpoints del Proxy

### Turnos
- `GET /api/proxy/turnos` - Listar turnos
- `POST /api/proxy/turnos` - Crear turno (admin)
- `GET /api/proxy/turnos/{id}` - Obtener turno
- `PATCH /api/proxy/turnos/{id}` - Actualizar turno (admin)
- `DELETE /api/proxy/turnos/{id}` - Eliminar turno (admin)

### Inscripciones
- `POST /api/proxy/turnos/{id}/inscribir` - Crear inscripción
- `PATCH /api/proxy/inscripciones/{id}` - Actualizar inscripción
- `DELETE /api/proxy/inscripciones/{id}` - Eliminar inscripción

### Eventos en Tiempo Real
- `GET /api/proxy/turnos/events` - SSE stream

---

## 🚨 Resolución del Error 401

Si recibes un error 401 (Unauthorized):

1. **Verifica que la API externa esté corriendo:**
   ```bash
   curl http://localhost:3001/api/turnos
   ```

2. **Si requiere autenticación, configura las credenciales:**
   - Edita `.env.local`
   - Descomenta y configura la variable apropiada (API_KEY, API_TOKEN, etc.)
   - Reinicia el servidor: `npm run dev`

3. **Verifica los logs del servidor:**
   - Busca mensajes "Proxy GET:" o "API Error Response:"
   - Los logs muestran exactamente qué está fallando

---

## 📱 Componentes de la UI

### `CalendarView`
Calendario mensual con turnos

### `TurnoDetailDialog`
Muestra detalles de un turno seleccionado
- Información del turno
- Lista de inscripciones
- Botón para inscribirse

### `InscripcionDialog`
Formulario para crear una inscripción
- Campos: nombre, DNI, email, teléfono
- Validación con React Hook Form
- Integración con API

### `TurnoDialog`
Formulario para crear/editar turnos (admin)
- Campos: fecha, hora inicio, hora fin, cupo

---

## 🎯 Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ 1. Ve turnos disponibles
       v
┌─────────────────┐
│  CalendarView   │
└──────┬──────────┘
       │ 2. Click en turno
       v
┌──────────────────────┐
│ TurnoDetailDialog    │
│ • Fecha y horario    │
│ • Cupo: 1/30        │
│ • [Agendar]         │
└──────┬───────────────┘
       │ 3. Click Agendar
       v
┌──────────────────────┐
│ InscripcionDialog    │
│ • Nombre: [____]     │
│ • DNI: [____]        │
│ • Email: [____]      │
│ • Teléfono: [____]   │
│ [Confirmar]          │
└──────┬───────────────┘
       │ 4. Submit
       v
┌──────────────────────────┐
│ POST /api/proxy/turnos/  │
│      {id}/inscribir      │
└──────┬───────────────────┘
       │ 5. Respuesta 201
       v
┌──────────────────────────┐
│  SSE Event Emitted       │
│  'inscripcion-updated'   │
└──────┬───────────────────┘
       │ 6. Todos los clientes
       │    reciben evento
       v
┌──────────────────────────┐
│  Frontend Refresca       │
│  Turnos Automáticamente  │
└──────────────────────────┘
```
