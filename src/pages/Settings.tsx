import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Camera, Check, LogOut, RefreshCw, Save, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { generateEncouragement } from '../lib/encouragement'
import { updateAuthUser } from '../lib/storage'

export default function Settings() {
  const { user, requireLogin, signOut } = useAuth()
  const [name, setName] = useState(user?.nickname ?? '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [notice, setNotice] = useState('')
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setName(user?.nickname ?? '')
  }, [user?.nickname])

  useEffect(() => {
    if (user && !user.encouragement) {
      updateAuthUser({ encouragement: generateEncouragement(user.nickname) })
    }
  }, [user])

  useEffect(() => {
    if (!saved) return
    const timer = window.setTimeout(() => setSaved(false), 2200)
    return () => window.clearTimeout(timer)
  }, [saved])

  if (!user) {
    return (
      <div className="container page">
        <div className="empty-state">
          <UserRound size={34} aria-hidden="true" />
          <h3 className="empty-title">登录后管理个人资料</h3>
          <p className="empty-sub">浏览不受限制，修改资料需要先登录。</p>
          <button className="primary-btn" type="button" onClick={() => requireLogin()}>
            登录 / 注册
          </button>
        </div>
      </div>
    )
  }

  const saveName = () => {
    if (!name.trim()) {
      setNotice('昵称不能为空。')
      return
    }
    updateAuthUser({ nickname: name.trim() })
    setNotice('')
    setSaved(true)
  }

  const savePassword = () => {
    if (newPw.length < 6) {
      setNotice('新密码至少 6 位。')
      return
    }
    if (user.passwordHash && btoa(currentPw) !== user.passwordHash) {
      setNotice('当前密码不正确。')
      return
    }
    updateAuthUser({ passwordHash: btoa(newPw) })
    setCurrentPw('')
    setNewPw('')
    setNotice('密码已更新。')
    setSaved(true)
  }

  const pickAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 500_000) {
      setNotice('头像图片请控制在 500KB 以内。')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateAuthUser({ avatar: String(reader.result) })
      setNotice('')
      setSaved(true)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="section-eyebrow">SETTINGS</span>
          <h1 className="section-title">设置</h1>
          <p className="section-sub">管理头像、名称与密码。</p>
        </div>
        {saved && (
          <span className="toast">
            <Check size={14} aria-hidden="true" />
            已保存
          </span>
        )}
      </div>

      <div className="settings-layout">
        <section className="note-panel">
          <div className="note-head">
            <h2>头像</h2>
          </div>
          <div className="avatar-row">
            <div className="avatar-lg">
              {user.avatar ? <img src={user.avatar} alt="头像" /> : <UserRound size={30} aria-hidden="true" />}
            </div>
            <button className="chip" type="button" onClick={() => fileRef.current?.click()}>
              <Camera size={14} aria-hidden="true" />
              上传照片
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={pickAvatar} hidden />
          </div>
        </section>

        <section className="note-panel">
          <div className="note-head">
            <h2>修改名称</h2>
          </div>
          <div className="code-row">
            <input
              className="text-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="你的昵称"
            />
            <button className="primary-btn" type="button" onClick={saveName}>
              <Save size={15} aria-hidden="true" />
              保存
            </button>
          </div>
        </section>

        <section className="note-panel">
          <div className="note-head">
            <h2>修改密码</h2>
          </div>
          <div className="field">
            <input
              className="text-input"
              type="password"
              value={currentPw}
              onChange={(event) => setCurrentPw(event.target.value)}
              placeholder="当前密码（首次设置可留空）"
            />
            <input
              className="text-input"
              type="password"
              value={newPw}
              onChange={(event) => setNewPw(event.target.value)}
              placeholder="新密码，至少 6 位"
            />
            <button className="primary-btn" type="button" onClick={savePassword}>
              <ShieldCheck size={15} aria-hidden="true" />
              更新密码
            </button>
          </div>
        </section>

        <section className="note-panel encouragement">
          <div className="note-head">
            <h2>今天的一句话</h2>
            <button
              className="chip"
              type="button"
              onClick={() => updateAuthUser({ encouragement: generateEncouragement(user.nickname) })}
            >
              <RefreshCw size={13} aria-hidden="true" />
              换一句
            </button>
          </div>
          <p className="encouragement-text">{user.encouragement ?? generateEncouragement(user.nickname)}</p>
        </section>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="checkin" type="button" onClick={signOut}>
            <LogOut size={16} aria-hidden="true" />
            退出登录
          </button>
        </div>
      </div>

      {notice && <p className="inspector-error" style={{ marginTop: 14 }}>{notice}</p>}
    </div>
  )
}
