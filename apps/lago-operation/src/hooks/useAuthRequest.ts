'use client'

import { useAuth } from '../providers/AuthProvider'
import { useCallback } from 'react'

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

export function useAuthRequest() {
  const { token, logout } = useAuth()

  const authRequest = useCallback(async (url: string, options: RequestOptions = {}) => {
    const { skipAuth = false, ...requestOptions } = options

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(requestOptions.headers as Record<string, string> || {}),
    }

    if (!skipAuth && token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...requestOptions,
      headers,
      credentials: 'include', // 支持跨域cookie和认证
    })

    // Handle unauthorized response
    if (response.status === 401 && !skipAuth) {
      logout()
      throw new Error('Session expired. Please log in again.')
    }

    return response
  }, [token, logout])

  return authRequest
}