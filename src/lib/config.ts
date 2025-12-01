// API Configuration
// Usar proxy local para evitar problemas de CORS
const USE_PROXY = true
const API_BASE_URL = USE_PROXY ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
const API_PREFIX = USE_PROXY ? '/api/proxy' : '/api'

// API Endpoints
export const API_ENDPOINTS = {
  turnos: `${API_BASE_URL}${API_PREFIX}/turnos`,
  turnoById: (id: number) => `${API_BASE_URL}${API_PREFIX}/turnos/${id}`,
  inscribir: (turnoId: number) => `${API_BASE_URL}${API_PREFIX}/turnos/${turnoId}/inscribir`,
  inscripcion: (id: number) => `${API_BASE_URL}${API_PREFIX}/inscripciones/${id}`,
  events: `${API_BASE_URL}${API_PREFIX}/turnos/events`,
}

// External API URL for server-side requests
export const EXTERNAL_API_URL = process.env.API_URL || 'http://localhost:3001'
