import { useState } from 'react'
import { useConversationStore } from '../store/conversationStore'
import { createConversation, deleteConversation, updateConversation } from '../api/conversations'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const { conversations, currentId, addConversation, removeConversation, setCurrentId, setMessages, updateConversationTitle } =
    useConversationStore()
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const handleNew = async () => {
    const res = await createConversation()
    addConversation(res.data)
    setCurrentId(res.data.id)
    setMessages([])
  }

  const handleSelect = (id: number) => {
    if (editingId !== id) setCurrentId(id)
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    await deleteConversation(id)
    removeConversation(id)
    if (currentId === id) setCurrentId(null)
  }

  const handleStartRename = (e: React.MouseEvent, id: number, title: string) => {
    e.stopPropagation()
    setEditingId(id)
    setEditingTitle(title)
  }

  const handleRenameConfirm = async (id: number) => {
    const trimmed = editingTitle.trim()
    if (trimmed) {
      await updateConversation(id, { title: trimmed })
      updateConversationTitle(id, trimmed)
    }
    setEditingId(null)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') handleRenameConfirm(id)
    if (e.key === 'Escape') setEditingId(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      width: '248px',
      background: 'rgba(8,11,15,0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--glass-border)', flexShrink: 0,
    }}>
      {/* 顶部品牌区 */}
      <div style={{ padding: '20px 16px 14px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '16px', padding: '0 2px',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', flexShrink: 0,
            boxShadow: '0 0 12px var(--accent-glow)',
          }}>✦</div>
          <div>
            <div style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em' }}>
              MiniMax Chat
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              AI Assistant
            </div>
          </div>
        </div>

        <button
          onClick={handleNew}
          style={{
            width: '100%', padding: '8px 12px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(16,163,127,0.2)',
            borderRadius: 'var(--radius-md)', color: 'var(--accent)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.15s', fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,163,127,0.18)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16,163,127,0.35)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-dim)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16,163,127,0.2)'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新建对话
        </button>
      </div>

      {/* 分割线 */}
      <div style={{ margin: '0 16px 8px', borderTop: '1px solid var(--border-subtle)' }} />

      {/* 会话列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {conversations.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '40px 16px', gap: '8px',
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '20px' }}>✦</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
              暂无对话<br/>点击上方按钮开始
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = currentId === conv.id
            const isHovered = hoveredId === conv.id
            return (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center',
                  padding: '7px 10px', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', marginBottom: '1px',
                  background: isActive ? 'var(--bg-active)' : isHovered ? 'var(--bg-hover)' : 'transparent',
                  transition: 'background 0.12s',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                <span style={{
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1, fontSize: '13px',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 500 : 400,
                  paddingRight: '4px',
                }}
                  onDoubleClick={(e) => handleStartRename(e, conv.id, conv.title)}
                  title="双击重命名"
                >
                  {editingId === conv.id ? (
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleRenameConfirm(conv.id)}
                      onKeyDown={(e) => handleRenameKeyDown(e, conv.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-focus)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)', fontSize: '13px',
                        padding: '1px 6px', outline: 'none', width: '100%',
                        fontFamily: 'inherit',
                      }}
                    />
                  ) : conv.title}
                </span>

                {(isActive || isHovered) && editingId !== conv.id && (
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      padding: '2px 3px', fontSize: '11px', flexShrink: 0,
                      borderRadius: '4px', lineHeight: 1,
                      transition: 'color 0.12s, background 0.12s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = '#f85149'
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,81,73,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 底部用户区 */}
      <div style={{
        padding: '12px 8px', borderTop: '1px solid var(--border-subtle)',
      }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '8px 12px', background: 'transparent',
            border: 'none', borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer',
            textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.15s', fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          退出登录
        </button>
      </div>
    </div>
  )
}
