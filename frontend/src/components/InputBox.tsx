import { useState, useRef } from 'react'
import { useConversationStore } from '../store/conversationStore'
import { streamChat } from '../api/messages'
import { updateConversation } from '../api/conversations'
import type { Message } from '../api/messages'

interface Props {
  centered?: boolean
}

export default function InputBox({ centered = false }: Props) {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const {
    currentId, streaming, setStreaming,
    appendStreamChunk, resetStream, addMessage,
    conversations, updateConversationTitle,
  } = useConversationStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = async () => {
    if (!input.trim() || !currentId || streaming) return

    const content = input.trim()
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const tempUserMsg: Message = {
      id: Date.now(),
      conversation_id: currentId,
      role: 'user',
      content,
      token_count: 0,
      created_at: new Date().toISOString(),
    }
    addMessage(tempUserMsg)
    setStreaming(true)

    const currentConv = conversations.find((c) => c.id === currentId)
    const needsAutoTitle = currentConv?.title === '新对话'

    try {
      await streamChat(
        currentId, content,
        (chunk) => appendStreamChunk(chunk),
        () => {
          const aiMsg: Message = {
            id: Date.now() + 1,
            conversation_id: currentId,
            role: 'assistant',
            content: useConversationStore.getState().streamingContent,
            token_count: 0,
            created_at: new Date().toISOString(),
          }
          addMessage(aiMsg)
          resetStream()

          if (needsAutoTitle && currentId) {
            const title = content.slice(0, 20) + (content.length > 20 ? '…' : '')
            updateConversation(currentId, { title }).then((res) => {
              updateConversationTitle(currentId, res.data.title)
            })
          }
        }
      )
    } catch {
      resetStream()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }

  const canSend = !!(input.trim() && currentId && !streaming)

  const inputBox = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: focused
        ? 'rgba(13,17,23,0.72)'
        : centered ? 'rgba(13,17,23,0.52)' : 'rgba(13,17,23,0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${focused ? 'rgba(16,163,127,0.45)' : 'var(--glass-border)'}`,
      borderRadius: centered ? '16px' : 'var(--radius-lg)',
      padding: centered ? '14px 16px' : '10px 12px',
      transition: 'all 0.2s',
      boxShadow: focused
        ? '0 0 0 3px var(--accent-dim), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 var(--glass-highlight)'
        : '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 var(--glass-highlight)',
    }}>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={currentId ? (centered ? '有问题，尽管问…' : '发送消息…') : '请先选择或新建一个对话'}
        disabled={!currentId || streaming}
        rows={1}
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--text-primary)', fontSize: centered ? '15px' : '14px',
          resize: 'none', lineHeight: '1.6', maxHeight: '160px',
          overflowY: 'auto', fontFamily: 'inherit', padding: 0,
        }}
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        style={{
          width: centered ? '36px' : '32px',
          height: centered ? '36px' : '32px',
          borderRadius: centered ? '10px' : '8px',
          border: 'none',
          background: canSend
            ? 'linear-gradient(135deg, var(--accent), var(--accent-hover))'
            : 'rgba(255,255,255,0.05)',
          cursor: canSend ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.15s',
          boxShadow: canSend ? '0 0 12px var(--accent-glow)' : 'none',
        }}
      >
        {streaming ? (
          <span style={{
            width: '12px', height: '12px',
            border: '2px solid rgba(255,255,255,0.2)',
            borderTopColor: 'var(--accent)', borderRadius: '50%',
            display: 'inline-block', animation: 'spin 0.7s linear infinite',
          }} />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={canSend ? '#fff' : 'var(--text-muted)'}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  )

  if (centered) {
    return (
      <div style={{ width: '100%' }}>
        {inputBox}
      </div>
    )
  }

  return (
    <div style={{
      padding: '12px 0 18px',
      borderTop: '1px solid var(--border-subtle)',
      width: '100%',
    }}>
      <div style={{
        maxWidth: '860px', width: '100%',
        margin: '0 auto', padding: '0 clamp(20px, 5vw, 80px)',
      }}>
        {inputBox}
        <p style={{
          color: 'var(--text-muted)', fontSize: '11px',
          textAlign: 'center', marginTop: '8px', letterSpacing: '0.02em',
        }}>
          由 MiniMax 提供支持 · Enter 发送 · Shift+Enter 换行
        </p>
      </div>
    </div>
  )
}
