import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setToken } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fn = mode === 'login' ? login : register
      const res = await fn(email, password)
      setToken(res.data.access_token)
      navigate('/chat')
    } catch (err: any) {
      setError(err.response?.data?.detail || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10a37f, #0d8a6c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '22px'
          }}>
            ✦
          </div>
          <h1 style={{ color: '#ececec', fontSize: '22px', fontWeight: 600, margin: '0 0 6px' }}>
            {mode === 'login' ? '欢迎回来' : '创建账号'}
          </h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            {mode === 'login' ? '登录以继续使用' : '注册一个新账号'}
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '13px', marginBottom: '6px' }}>
              邮箱地址
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{
                width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: '8px', padding: '10px 12px', color: '#ececec',
                fontSize: '14px', outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#10a37f'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '13px', marginBottom: '6px' }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: '8px', padding: '10px 12px', color: '#ececec',
                fontSize: '14px', outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#10a37f'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', padding: '10px 12px', color: '#f87171',
              fontSize: '13px', marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px', background: loading ? '#1a1a1a' : '#10a37f',
              border: 'none', borderRadius: '8px', color: loading ? '#555' : '#fff',
              fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        {/* 切换模式 */}
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#555', fontSize: '13px' }}>
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: '#10a37f', cursor: 'pointer', fontSize: '13px', padding: '0 4px' }}
          >
            {mode === 'login' ? '注册' : '登录'}
          </button>
        </p>
      </div>
    </div>
  )
}
