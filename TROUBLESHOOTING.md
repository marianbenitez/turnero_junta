# Troubleshooting - Error al Cargar Turnos

## Problema Reportado
"Error al cargar turnos" - La aplicación muestra un error al intentar cargar los turnos desde la API.

## Diagnóstico Realizado

### ✅ API está funcionando correctamente
```bash
curl http://localhost:3001/api/turnos
# Respuesta: HTTP 200 OK con 2 turnos
```

### ✅ Servidor Next.js está corriendo
- Puerto: **3001** (3000 estaba ocupado)
- Estado: Activo y respondiendo

### ✅ Base de datos tiene datos
- 2 turnos disponibles en la base de datos
- Estructura correcta con inscripciones

## Pasos para Diagnosticar el Error

### 1. Abrir la Consola del Navegador
1. Abre **Chrome DevTools** (F12)
2. Ve a la pestaña **Console**
3. Recarga la página (Ctrl+R)
4. Busca mensajes rojos de error

Los logs ahora incluyen:
```
Fetching turnos for month: [mes año]
Received turnos: [número]
Filtered turnos for current month: [número]
```

### 2. Verificar la Pestaña Network
1. En DevTools, ve a **Network**
2. Recarga la página
3. Busca la petición a `/api/turnos`
4. Verifica:
   - Status Code: debe ser `200`
   - Response: debe tener un array JSON

### 3. Página de Prueba
Visita: **http://localhost:3001/test-api**

Esta página hace un fetch simple y muestra:
- ✅ Si la API responde correctamente
- ❌ Si hay un error (con detalles)
- Los datos JSON recibidos

### 4. Verificar Errores Comunes

#### Error: "Failed to fetch"
**Causa**: El navegador no puede conectar con la API
**Solución**:
```bash
# Verifica que el servidor esté corriendo
lsof -i:3001

# Si no hay nada, reinicia:
npm run dev
```

#### Error: "CORS"
**Causa**: Problema de política de origen cruzado
**Solución**: No debería ocurrir en desarrollo local, pero verifica que estés accediendo a `localhost:3001` y no a otra URL

#### Error: "Unexpected token" en JSON
**Causa**: La respuesta no es JSON válido
**Solución**:
1. Ve a Network > /api/turnos
2. Mira la pestaña Response
3. Verifica que sea JSON válido

#### Error: Network timeout
**Causa**: La petición tarda demasiado
**Solución**:
```bash
# Limpia la cache de Next.js
rm -rf .next
npm run dev
```

## Comandos Útiles

### Reiniciar Servidor
```bash
# Mata todos los procesos Node
pkill -9 node

# Limpia la cache
rm -rf .next

# Reinicia
npm run dev
```

### Probar API directamente
```bash
# GET todos los turnos
curl http://localhost:3001/api/turnos

# GET con formato bonito
curl -s http://localhost:3001/api/turnos | jq '.'

# POST crear turno de prueba
curl -X POST http://localhost:3001/api/turnos \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2025-12-01",
    "horaInicio": "10:00",
    "horaFin": "11:00",
    "cupoMaximo": 15,
    "estado": true
  }'
```

### Ver logs del servidor
Los logs del servidor aparecen en la terminal donde ejecutaste `npm run dev`

## Soluciones Rápidas

### 1. Limpiar todo y empezar de nuevo
```bash
pkill -9 node
rm -rf .next node_modules/.cache
npm run dev
```

### 2. Regenerar base de datos
```bash
npx prisma generate
npx prisma db push
```

### 3. Verificar puerto correcto
El servidor puede estar en un puerto diferente:
- Mira la terminal donde corre `npm run dev`
- Busca: `- Local: http://localhost:XXXX`
- Usa ese puerto en el navegador

## Contacto con el Desarrollador

Si después de estos pasos sigue el error:

1. **Toma screenshot** de:
   - Mensaje de error en pantalla
   - Console (DevTools)
   - Network tab mostrando el request a /api/turnos

2. **Copia** el mensaje completo del error

3. **Comparte** la salida de:
```bash
curl http://localhost:3001/api/turnos
npm run dev (últimas 20 líneas)
```

## Estado Actual del Sistema

✅ API respondiendo correctamente
✅ 2 turnos en base de datos
✅ Servidor corriendo en puerto 3001
✅ Endpoints SSE funcionando
✅ Tipos TypeScript correctos
✅ Componentes creados y compilados

El sistema está operativo. El error probablemente sea:
- Caché del navegador
- Puerto incorrecto
- Error de JavaScript específico en el navegador
