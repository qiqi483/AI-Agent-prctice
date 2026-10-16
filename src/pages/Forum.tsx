import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ImagePlus, LogIn, MessageCircle, Send, X } from 'lucide-react'
import ProfileModal from '../components/ProfileModal'
import { useAuth } from '../context/AuthContext'
import { addComment, addPost, usePosts } from '../lib/storage'

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '我'
}

export default function Forum() {
  const { user, requireLogin } = useAuth()
  const posts = usePosts()
  const [draft, setDraft] = useState('')
  const [image, setImage] = useState<string | undefined>(undefined)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ nickname: string; avatar?: string } | null>(null)
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const replyTarget = posts.find((post) => post.id === replyTo) ?? null

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

  const submit = () => {
    if (!user) {
      requireLogin()
      return
    }
    if (!draft.trim() && !image) {
      setNotice('先写点内容。')
      return
    }

    if (replyTo) {
      addComment(replyTo, {
        id: `${Date.now()}`,
        author: user.nickname,
        avatar: user.avatar,
        content: draft.trim(),
        createdAt: Date.now(),
      })
      setDraft('')
      setReplyTo(null)
      setNotice('')
      return
    }

    addPost({
      id: `${Date.now()}`,
      author: user.nickname,
      avatar: user.avatar,
      content: draft.trim(),
      image,
      createdAt: Date.now(),
      comments: [],
    })
    setDraft('')
    setImage(undefined)
    setNotice('')
  }

  return (
    <div className="container page forum-page">
      <div className="section-head">
        <div>
          <span className="section-eyebrow">FORUM</span>
          <h1 className="section-title">公共论坛</h1>
          <p className="section-sub">像朋友圈一样随手提问，也随时在别人问题下交流。</p>
        </div>
        {user && (
          <span className="stat">
            <MessageCircle size={14} aria-hidden="true" /> {user.nickname}
          </span>
        )}
      </div>

      <div className="forum-list">
        {posts.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={30} aria-hidden="true" />
            <h3 className="empty-title">还没有提问</h3>
            <p className="empty-sub">在底部输入框发布第一个问题。</p>
          </div>
        ) : (
          posts.map((post) => (
            <article className="forum-post" key={post.id}>
              <div className="forum-post-head">
                <button
                  className="avatar-sm"
                  type="button"
                  onClick={() => setProfile({ nickname: post.author, avatar: post.avatar })}
                  aria-label={`查看 ${post.author} 的主页`}
                >
                  {post.avatar ? <img src={post.avatar} alt="头像" /> : initial(post.author)}
                </button>
                <div className="forum-author-block">
                  <button
                    className="forum-author"
                    type="button"
                    onClick={() => setProfile({ nickname: post.author, avatar: post.avatar })}
                  >
                    {post.author}
                  </button>
                  <div className="report-meta">
                    {new Date(post.createdAt).toLocaleString('zh-CN', { hour12: false })}
                  </div>
                </div>
              </div>

              {post.content && <p className="forum-content">{post.content}</p>}
              {post.image && <img className="forum-image" src={post.image} alt="提问附图" />}

              <div className="post-actions">
                <button
                  className="comment-btn"
                  type="button"
                  onClick={() => {
                    if (!user) {
                      requireLogin()
                      return
                    }
                    setReplyTo(post.id)
                    window.setTimeout(() => inputRef.current?.focus(), 0)
                  }}
                >
                  <MessageCircle size={14} aria-hidden="true" />
                  评论
                </button>
              </div>

              {post.comments && post.comments.length > 0 && (
                <div className="comment-list">
                  {post.comments.map((comment) => (
                    <div className="comment" key={comment.id}>
                      <button
                        className="avatar-sm avatar-tiny"
                        type="button"
                        onClick={() => setProfile({ nickname: comment.author, avatar: comment.avatar })}
                        aria-label={`查看 ${comment.author} 的主页`}
                      >
                        {comment.avatar ? <img src={comment.avatar} alt="头像" /> : initial(comment.author)}
                      </button>
                      <div className="comment-body">
                        <div className="comment-head">
                          <button
                            className="comment-author"
                            type="button"
                            onClick={() => setProfile({ nickname: comment.author, avatar: comment.avatar })}
                          >
                            {comment.author}
                          </button>
                          <span className="report-meta">
                            {new Date(comment.createdAt).toLocaleString('zh-CN', { hour12: false })}
                          </span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      <div className="forum-composer">
        {user ? (
          <div className="composer-inner">
            <button
              className="avatar-sm"
              type="button"
              onClick={() => setProfile({ nickname: user.nickname, avatar: user.avatar })}
              aria-label="查看我的主页"
            >
              {user.avatar ? <img src={user.avatar} alt="头像" /> : initial(user.nickname)}
            </button>

            <div className="composer-box">
              {replyTarget && (
                <div className="composer-reply">
                  回复 {replyTarget.author}
                  <button type="button" onClick={() => setReplyTo(null)} aria-label="取消回复">
                    <X size={13} />
                  </button>
                </div>
              )}
              <input
                ref={inputRef}
                className="text-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submit()
                }}
                placeholder={replyTarget ? '写下你的评论…' : '说说你的问题…'}
              />
            </div>

            {!replyTarget && (
              <label className="icon-btn" title="上传图片">
                <ImagePlus size={16} aria-hidden="true" />
                <input type="file" accept="image/*" onChange={pickImage} hidden />
              </label>
            )}

            <button className="send-btn" type="button" onClick={submit} aria-label="发送">
              <Send size={16} />
            </button>
          </div>
        ) : (
          <button className="primary-btn" type="button" onClick={() => requireLogin()}>
            <LogIn size={16} aria-hidden="true" />
            登录后参与讨论
          </button>
        )}
      </div>

      {image && !replyTarget && (
        <div className="composer-preview">
          <img className="forum-preview" src={image} alt="待上传预览" />
          <button className="chip" type="button" onClick={() => setImage(undefined)}>
            移除
          </button>
        </div>
      )}

      {notice && <p className="inspector-error">{notice}</p>}

      <ProfileModal author={profile} onClose={() => setProfile(null)} />
    </div>
  )
}
