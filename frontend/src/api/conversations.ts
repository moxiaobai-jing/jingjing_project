import client from './client'

export interface Conversation {
  id: number
  title: string
  system_prompt: string
  model: string
  created_at: string
  updated_at: string
}

export const listConversations = () =>
  client.get<Conversation[]>('/conversations')

export const createConversation = (title = '新对话') =>
  client.post<Conversation>('/conversations', { title })

export const updateConversation = (id: number, data: Partial<Pick<Conversation, 'title' | 'system_prompt' | 'model'>>) =>
  client.patch<Conversation>(`/conversations/${id}`, data)

export const deleteConversation = (id: number) =>
  client.delete(`/conversations/${id}`)
