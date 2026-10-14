import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { ImagePlus, LogIn, MessageSquare, Send, Video } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { addPost, usePosts } from '../lib/storage'

export default function Forum() {
  const { user, requireLogin } = useAuth()
  const posts = usePosts()
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | undefined>(undefined)
  const [notice, setNotice] = useState('')

  const pickImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 800_000) {
      setNotice('图片过大，请压缩到 800KB 以内（本地演示限制）。')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImage(String(reader.result))
      setNotice('')
    }
    reader.readAsDataURL(file)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!content.trim() && !image) {
      setNotice('先写点内容或附上一张图。')
      return
    }
    addPost({
      id: `${Date.now()}`,
      author: user?.nickname ?? '匿名',
      content: content.trim(),
      image,
      createdAt: Date.now(),
    })
    setContent('')
    setImage(undefined)
    setNotice('')
  }

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="section-eyebrow">FORUM</span>
          <h1 className="section-title">公共论坛</h1>
          <p className="section-sub">遇到不懂的地方就在这里提问，图片与视频会帮大家更快定位问题。</p>
        </div>
        {user ? (
          <span className="stat">
            <MessageSquare size={14} aria-hidden="true" /> {user.nickname}
          </span>
        ) : (
          <button className="primary-btn" type="button" onClick={() => requireLogin()}>
            <LogIn size={16} aria-hidden="true" />
            登录后发帖
          </button>
        )}
      </div>

      {user ? (
        <form className="note-panel" onSubmit={submit}>
          <div className="note-head">
            <h2>提出你的问题</h2>
            <span className="note-hint">本地演示版：内容只保存在这台电脑的浏览器里</span>
          </div>
          <textarea
            className="textarea"
            style={{ minHeight: 120 }}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="描述你卡住的地方、期望效果和已尝试的方法…"
          />
          <div className="forum-actions">
            <label className="chip">
              <ImagePlus size={14} aria-hidden="true" />
              上传图片
              <input type="file" accept="image/*" onChange={pickImage} hidden />
            </label>
            <button
              className="chip"
              type="button"
              title="视频上传需要后端对象存储，本地演示暂不支持"
              onClick={() => setNotice('视频上传需要后端对象存储，本地演示版暂不支持。')}
            >
              <Video size={14} aria-hidden="true" />
              上传视频
            </button>
            <button className="primary-btn" type="submit">
              <Send size={15} aria-hidden="true" />
              发布
            </button>
          </div>
          {image && <img className="forum-preview" src={image} alt="待上传预览" />}
          {notice && <p className="inspector-error" style={{ margin: 0 }}>{notice}</p>}
        </form>
      ) : (
        <div className="empty-state">
          <MessageSquare size={34} aria-hidden="true" />
          <h3 className="empty-title">登录后参与讨论</h3>
          <p className="empty-sub">浏览不受限制，发帖、传图需要先登录。</p>
          <button className="primary-btn" type="button" onClick={() => requireLogin()}>
            <LogIn size={16} aria-hidden="true" />
            登录 / 注册
          </button>
        </div>
      )}

      <div className="forum-list">
        {posts.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 18 }}>
            <MessageSquare size={28} aria-hidden="true" />
            <h3 className="empty-title">还没有提问</h3>
            <p className="empty-sub">成为第一个提问的人。</p>
          </div>
        ) : (
          posts.map((post) => (
            <article className="forum-post" key={post.id}>
              <div className="forum-post-head">
                <span className="forum-author">{post.author}</span>
                <span className="report-meta">
                  {new Date(post.createdAt).toLocaleString('zh-CN', { hour12: false })}
                </span>
              </div>
              {post.content && <p className="forum-content">{post.content}</p>}
              {post.image && <img className="forum-image" src={post.image} alt="提问附图" />}
            </article>
          ))
        )}
      </div>
    </div>
  )
}
