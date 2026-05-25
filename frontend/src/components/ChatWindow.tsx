import { useEffect, useRef } from 'react'
import { useConversationStore } from '../store/conversationStore'
import { listMessages } from '../api/messages'
import MessageBubble from './MessageBubble'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

export default function ChatWindow() {
  const { currentId, messages, setMessages, streaming, streamingContent } =
    useConversationStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!currentId) return
    listMessages(currentId).then((res) => setMessages(res.data))
  }, [currentId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  if (!currentId) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', width: '100%',
        background: 'var(--bg-base)',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(16,163,127,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 0 24px var(--accent-glow)',
          }}>✦</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: '0 0 6px', fontWeight: 500 }}>
              MiniMax Chat
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
              选择或新建一个对话开始聊天
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '28px 0 8px',
      width: '100%', background: 'var(--bg-base)',
    }}>
      <div style={{
        maxWidth: '860px', width: '100%',
        margin: '0 auto', padding: '0 clamp(20px, 5vw, 80px)',
      }}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* 流式输出中的 AI 消息 */}
        {streaming && (
          <div style={{
            display: 'flex', gap: '10px', alignItems: 'flex-start',
            marginBottom: '20px', animation: 'messageIn 0.2s ease-out',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', flexShrink: 0, marginTop: '1px',
              boxShadow: '0 0 8px var(--accent-glow)',
            }}>✦</div>
            <div style={{
              fontSize: '14px', lineHeight: '1.75',
              color: 'var(--text-primary)', paddingTop: '1px', flex: 1,
            }}>
              {streamingContent ? (
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {streamingContent}
                </ReactMarkdown>
              ) : (
                <span style={{
                  display: 'inline-flex', gap: '5px',
                  alignItems: 'center', paddingTop: '6px',
                }}>
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: 'var(--accent)', display: 'inline-block',
                        animation: `bounce 1.1s ${delay}ms infinite`,
                      }}
                    />
                  ))}
                </span>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height: '16px' }} />
      </div>
    </div>
  )
}
