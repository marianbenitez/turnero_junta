import { NextResponse } from 'next/server'

const API_BASE = process.env.API_URL || 'http://localhost:3001'

// Función auxiliar para construir headers de autenticación
function getAuthHeaders() {
  const headers: HeadersInit = {}

  // Agregar API Key si existe
  if (process.env.API_KEY) {
    headers['X-API-Key'] = process.env.API_KEY
  }

  // Agregar Bearer Token si existe
  if (process.env.API_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.API_TOKEN}`
  }

  // Agregar Basic Auth si existe
  if (process.env.API_USERNAME && process.env.API_PASSWORD) {
    const credentials = Buffer.from(
      `${process.env.API_USERNAME}:${process.env.API_PASSWORD}`
    ).toString('base64')
    headers['Authorization'] = `Basic ${credentials}`
  }

  return headers
}

export async function GET(request: Request) {
  try {
    const url = `${API_BASE}/api/turnos/events`

    console.log('Proxy SSE:', url)

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('SSE Error Response:', res.status, errorText)
      return NextResponse.json(
        { error: `API returned ${res.status}`, details: errorText },
        { status: res.status }
      )
    }

    // Stream the SSE response
    return new NextResponse(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Proxy SSE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
