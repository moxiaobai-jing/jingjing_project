import client from './client'

export interface User {
  id: number
  email: string
}

export const register = (email: string, password: string) =>
  client.post<{ access_token: string }>('/auth/register', { email, password })

export const login = (email: string, password: string) =>
  client.post<{ access_token: string }>('/auth/login', { email, password })

export const getMe = () => client.get<User>('/auth/me')
