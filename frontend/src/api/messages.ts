import client from './client'

export interface Message {
  id: number
  conversation_id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  token_count: number
  created_at: string
}

export const listMessages = (convId: number) =>
  client.get<Message[]>(`/conversations/${convId}/messages`)

/**
 * 流式发送消息，通过 fetch + ReadableStream 逐 chunk 回调
 * onChunk: 每收到一段文字时调用
 * onDone: 流结束时调用
 */
export async function streamChat(
  convId: number,
  content: string,
  onChunk: (text: string) => void,
  onDone: () => void
) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/conversations/${convId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
  })

  if (!res.ok) throw new Error(`请求失败: ${res.status}`)

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })
    const lines = text.split('\n')
    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (data === '[DONE]') {
        onDone()
        return
      }
      if (data) onChunk(data)
    }
  }
  onDone()
}
