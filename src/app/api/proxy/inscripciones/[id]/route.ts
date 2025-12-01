import { NextResponse } from 'next/server'

const API_BASE = process.env.API_URL || 'http://localhost:3001'

// Función auxiliar para construir headers de autenticación
function getAuthHeaders() {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const url = `${API_BASE}/api/inscripciones/${id}`

    console.log('Proxy PATCH inscripción:', url, body)

    const res = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('API Error Response:', res.status, errorText)
      return NextResponse.json(
        { error: `API returned ${res.status}`, details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = `${API_BASE}/api/inscripciones/${id}`

    console.log('Proxy DELETE inscripción:', url)

    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('API Error Response:', res.status, errorText)
      return NextResponse.json(
        { error: `API returned ${res.status}`, details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
