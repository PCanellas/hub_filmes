import { api } from './client'
import type { TokenResponse } from './types'

export function register(username: string, password: string): Promise<TokenResponse> {
  return api('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) })
}

export function login(username: string, password: string): Promise<TokenResponse> {
  return api('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
}
