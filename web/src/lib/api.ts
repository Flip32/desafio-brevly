export type LinkItem = {
  id: string
  shortCode: string
  originalUrl: string
  accessCount: number
  createdAt: string
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const backendUrl = (import.meta.env.VITE_BACKEND_URL ?? '').replace(/\/$/, '')

if (!backendUrl) {
  console.warn('VITE_BACKEND_URL is not set')
}

export function getFrontendUrl() {
  return (import.meta.env.VITE_FRONTEND_URL || window.location.origin).replace(
    /\/$/,
    ''
  )
}

export async function apiFetch<T>(path: string, options?: RequestInit) {
  if (!backendUrl) {
    throw new ApiError('VITE_BACKEND_URL não configurado', 500)
  }

  const url = `${backendUrl}${path}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {})
    },
    ...options
  })

  if (response.status === 204) {
    return null as T
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.message ?? 'Erro inesperado'
    throw new ApiError(message, response.status)
  }

  return data as T
}
