import type { Message } from '../api/messages'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '20px',
      gap: '10px',
      alignItems: 'flex-start',
      animation: 'messageIn 0.2s ease-out',
    }}>
      {/* AI 头像 */}
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', flexShrink: 0, marginTop: '1px',
          boxShadow: '0 0 8px var(--accent-glow)',
        }}>
          ✦
        </div>
      )}

      <div style={{
        maxWidth: isUser ? '68%' : '82%',
        fontSize: '14px',
        lineHeight: '1.75',
        color: isUser ? 'var(--text-primary)' : 'var(--text-primary)',
        background: isUser
          ? 'rgba(26,38,64,0.65)'
          : 'transparent',
        backdropFilter: isUser ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isUser ? 'blur(12px)' : 'none',
        borderRadius: isUser ? '14px 14px 4px 14px' : '0',
        padding: isUser ? '10px 16px' : '2px 0',
        border: isUser ? '1px solid rgba(255,255,255,0.07)' : 'none',
        boxShadow: isUser ? '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
      }}>
        {isUser ? (
          <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '14px' }}>{message.content}</p>
        ) : (
          <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            components={{
              p: ({ children }) => (
                <p style={{ margin: '0 0 12px', lineHeight: 1.75 }}>{children}</p>
              ),
              ul: ({ children }) => (
                <ul style={{ margin: '6px 0 12px', paddingLeft: '20px' }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ margin: '6px 0 12px', paddingLeft: '20px' }}>{children}</ol>
              ),
              li: ({ children }) => (
                <li style={{ margin: '3px 0' }}>{children}</li>
              ),
              h1: ({ children }) => (
                <h1 style={{ margin: '16px 0 8px', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 style={{ margin: '14px 0 6px', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 style={{ margin: '12px 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{children}</h3>
              ),
              blockquote: ({ children }) => (
                <blockquote style={{
                  margin: '8px 0', paddingLeft: '14px',
                  borderLeft: '3px solid var(--accent)',
                  color: 'var(--text-secondary)',
                }}>{children}</blockquote>
              ),
              code({ className, children, ...props }) {
                const isBlock = className?.includes('language-')
                return isBlock ? (
                  <code
                    className={className}
                    style={{
                      display: 'block', overflowX: 'auto',
                      padding: '14px 16px', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)', fontSize: '12.5px',
                      border: '1px solid var(--border-subtle)', marginTop: '4px',
                      lineHeight: 1.6,
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code
                    style={{
                      background: 'var(--bg-surface)', padding: '1px 6px',
                      borderRadius: '4px', color: 'var(--accent)',
                      fontSize: '12.5px', border: '1px solid var(--border-subtle)',
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                )
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      {/* 用户头像 */}
      {isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', fontSize: '11px',
          fontWeight: 600, flexShrink: 0, marginTop: '1px',
        }}>
          我
        </div>
      )}
    </div>
  )
}
