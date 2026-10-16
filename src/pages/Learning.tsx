import type { MouseEvent } from 'react'
import { ArrowUpRight, BookOpen, Lock, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { learningArticles, learningResources, learningUpdated } from '../lib/learning'

export default function Learning() {
  const { user, requireLogin } = useAuth()
  const featured = learningArticles.filter((article) => article.featured)
  const rest = learningArticles.filter((article) => !article.featured)

  const openArticle = (event: MouseEvent, url: string) => {
    event.preventDefault()
    const target = () => window.open(url, '_blank', 'noopener')
    if (!user) {
      requireLogin(target)
      return
    }
    target()
  }

  const readLabel = user ? '打开原文' : '登录后阅读'
  const resourceLabel = user ? '前往查看' : '登录后查看'

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="section-eyebrow">LEARN</span>
          <h1 className="section-title">学习栏目</h1>
          <p className="section-sub">从概念到实操的入门材料，配合项目库按需学习。</p>
          {!user && (
            <p className="lock-hint">
              <Lock size={13} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 4 }} />
              目录可自由浏览，登录后即可阅读文章内容。
            </p>
          )}
        </div>
        <span className="stat">
          内容更新 <strong>{learningUpdated}</strong>
        </span>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <span className="section-eyebrow">必学</span>
            <h2 className="section-title">强推荐</h2>
            <p className="section-sub">优先投入时间，理解这些内容后再继续往下学。</p>
          </div>
        </div>

        <div className="featured-list">
          {featured.map((article) => (
            <article className="learning-featured" key={article.id}>
              <div className="featured-top">
                <span className="badge-required">
                  <Star size={13} aria-hidden="true" />
                  {article.recommend ?? '必学'} · 强推荐
                </span>
                <span className="report-meta">
                  {article.author} · {article.date}
                </span>
              </div>
              <h3 className="case-title">{article.title}</h3>
              <p className="case-summary">{article.summary}</p>
              <div className="card-tags">
                {article.topics.map((topic) => (
                  <span className="badge-direction" key={topic}>
                    {topic}
                  </span>
                ))}
              </div>
              {article.note && <p className="hint" style={{ margin: 0 }}>{article.note}</p>}
              <a
                className="read-link"
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => openArticle(event, article.url)}
              >
                {user ? <ArrowUpRight size={14} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}
                {readLabel}
              </a>
            </article>
          ))}
        </div>
      </section>

      {rest.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <span className="section-eyebrow">文章</span>
              <h2 className="section-title">精选文章</h2>
            </div>
          </div>

          <div className="grid">
            {rest.map((article) => (
              <article className="case-card" key={article.id}>
                <div className="card-top">
                  <h3 className="case-title">{article.title}</h3>
                  <span className="card-stars">
                    <BookOpen size={13} aria-hidden="true" />
                  </span>
                </div>
                <div className="report-meta">
                  {article.author} · {article.date}
                </div>
                <p className="case-summary">{article.summary}</p>
                <div className="card-tags">
                  {article.topics.map((topic) => (
                    <span className="badge-direction" key={topic}>
                      {topic}
                    </span>
                  ))}
                </div>
                {article.note && <p className="hint" style={{ margin: 0 }}>{article.note}</p>}
                <a
                  className="read-link"
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => openArticle(event, article.url)}
                >
                  {user ? <ArrowUpRight size={14} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}
                  {readLabel}
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">资料库</span>
            <h2 className="section-title">外部资源</h2>
          </div>
        </div>

        <div className="grid">
          {learningResources.map((resource) => (
            <article className="case-card" key={resource.id}>
              <div className="card-top">
                <h3 className="case-title">{resource.title}</h3>
                {/login|登录/.test(resource.note ?? '') && <Lock size={16} aria-hidden="true" />}
              </div>
              {resource.note && <p className="case-summary">{resource.note}</p>}
              <a
                className="read-link"
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => openArticle(event, resource.url)}
              >
                {user ? <ArrowUpRight size={14} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}
                {resourceLabel}
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
