import { create } from 'zustand'
import type { Conversation } from '../api/conversations'
import type { Message } from '../api/messages'

interface ConversationState {
  conversations: Conversation[]
  currentId: number | null
  messages: Message[]
  streaming: boolean
  streamingContent: string

  setConversations: (list: Conversation[]) => void
  addConversation: (conv: Conversation) => void
  removeConversation: (id: number) => void
  updateConversationTitle: (id: number, title: string) => void
  setCurrentId: (id: number | null) => void
  setMessages: (msgs: Message[]) => void
  addMessage: (msg: Message) => void
  appendStreamChunk: (chunk: string) => void
  setStreaming: (v: boolean) => void
  resetStream: () => void
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  currentId: null,
  messages: [],
  streaming: false,
  streamingContent: '',

  setConversations: (list) => set({ conversations: list }),
  addConversation: (conv) =>
    set((s) => ({ conversations: [conv, ...s.conversations] })),
  removeConversation: (id) =>
    set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) })),
  updateConversationTitle: (id, title) =>
    set((s) => ({ conversations: s.conversations.map((c) => c.id === id ? { ...c, title } : c) })),
  setCurrentId: (id) => set({ currentId: id, messages: [], streamingContent: '' }),
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  appendStreamChunk: (chunk) =>
    set((s) => ({ streamingContent: s.streamingContent + chunk })),
  setStreaming: (v) => set({ streaming: v }),
  resetStream: () => set({ streamingContent: '', streaming: false }),
}))
