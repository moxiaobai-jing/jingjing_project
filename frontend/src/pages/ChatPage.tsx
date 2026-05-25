import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useConversationStore } from '../store/conversationStore'
import { listConversations } from '../api/conversations'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import InputBox from '../components/InputBox'

export default function ChatPage() {
  const { token } = useAuthStore()
  const { setConversations, currentId, conversations, messages, streaming } = useConversationStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    listConversations().then((res) => setConversations(res.data))
  }, [token])

  const currentTitle = conversations.find(c => c.id === currentId)?.title
  const isWelcome = !!currentId && messages.length === 0 && !streaming

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100%',
      color: 'var(--text-primary)', overflow: 'hidden',
    }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, width: '100%' }}>

        {/* 顶部栏 — 玻璃效果 */}
        {!isWelcome && (
          <div style={{
            padding: '0 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', minHeight: '48px',
            background: 'rgba(8,11,15,0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}>
            {currentTitle ? (
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                {currentTitle}
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                请选择或新建对话
              </span>
            )}
          </div>
        )}

        {/* 欢迎页 — 居中输入框 */}
        {isWelcome ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '40px 24px',
            animation: 'welcomeIn 0.4s ease-out',
          }}>
            {/* 标题 */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <h1 style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 600, color: 'var(--text-primary)',
                margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.2,
              }}>
                你今天在想些什么？
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                MiniMax · 智能对话助手
              </p>
            </div>

            {/* 玻璃卡片输入区 */}
            <div style={{
              width: '100%', maxWidth: '680px',
              background: 'rgba(13,17,23,0.4)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '20px',
              padding: '6px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 var(--glass-highlight)',
            }}>
              <InputBox centered />
            </div>

            {/* 快捷操作 chips 已移除 */}
          </div>
        ) : (
          <>
            <ChatWindow />
            <InputBox />
          </>
        )}
      </div>
    </div>
  )
}
