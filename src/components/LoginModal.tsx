import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { MessageCircle, Smartphone, X } from 'lucide-react'
import { signIn } from '../lib/storage'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sentCode, setSentCode] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const reset = () => {
    setNickname('')
    setPhone('')
    setCode('')
    setSentCode('')
    setNotice('')
    setError('')
  }

  const sendCode = () => {
    if (!phone.trim()) {
      setError('请先填写手机号')
      return
    }
    const next = String(Math.floor(100000 + Math.random() * 900000))
    setSentCode(next)
    setNotice(`演示验证码：${next}（真实短信需接入后端服务）`)
    setError('')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (tab === 'register' && !nickname.trim()) {
      setError('请填写昵称')
      return
    }
    if (!phone.trim()) {
      setError('请填写手机号')
      return
    }
    if (!sentCode) {
      setError('请先获取验证码')
      return
    }
    if (code.trim() !== sentCode) {
      setError('验证码不正确')
      return
    }
    signIn({ nickname: (tab === 'register' ? nickname : phone).trim(), method: 'password' })
    reset()
    onSuccess()
  }

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="登录或注册"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="关闭">
          <X size={18} />
        </button>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab${tab === 'login' ? ' is-active' : ''}`}
            onClick={() => {
              setTab('login')
              setError('')
            }}
          >
            登录
          </button>
          <button
            type="button"
            className={`auth-tab${tab === 'register' ? ' is-active' : ''}`}
            onClick={() => {
              setTab('register')
              setError('')
            }}
          >
            注册
          </button>
        </div>

        <form className="form" onSubmit={submit}>
          {tab === 'register' && (
            <div className="field">
              <label className="label" htmlFor="auth-nickname">
                昵称
              </label>
              <input
                id="auth-nickname"
                className="text-input"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="你的昵称"
              />
            </div>
          )}

          <div className="field">
            <label className="label" htmlFor="auth-phone">
              手机号
            </label>
            <input
              id="auth-phone"
              className="text-input"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="用于接收验证码"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="auth-code">
              验证码
            </label>
            <div className="code-row">
              <input
                id="auth-code"
                className="text-input"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="6 位数字"
              />
              <button className="chip" type="button" onClick={sendCode}>
                获取验证码
              </button>
            </div>
          </div>

          {notice && <p className="hint" style={{ margin: 0 }}>{notice}</p>}
          {error && <p className="inspector-error" style={{ margin: 0 }}>{error}</p>}

          <button className="primary-btn" type="submit">
            {tab === 'login' ? '登录' : '注册并登录'}
          </button>
        </form>

        <div className="auth-divider">或</div>

        <button
          className="wechat-btn"
          type="button"
          onClick={() => setNotice('微信登录需要后端 AppID 与回调地址，当前为本地演示，暂未开通。')}
        >
          <MessageCircle size={17} aria-hidden="true" />
          微信登录
        </button>

        <p className="auth-note">
          <Smartphone size={13} aria-hidden="true" />
          当前为本地演示版，账号只保存在本机浏览器；真实验证码与微信登录需接入后端。
        </p>
      </div>
    </div>
  )
}
