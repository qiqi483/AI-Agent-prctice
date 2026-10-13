import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Bot, Compass, Layers, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { caseStudies, projects, updatedAt } from '../lib/data'

const QUICK_ENTRIES = [
  {
    direction: '从零构建',
    label: '从零构建 Agent',
    desc: '读懂 agent loop 与工具注册',
    icon: <Bot size={16} aria-hidden="true" />,
  },
  {
    direction: 'Deep Research / RAG',
    label: 'Deep Research / RAG',
    desc: '检索、记忆与知识库',
    icon: <Layers size={16} aria-hidden="true" />,
  },
  {
    direction: '浏览器 / 垂直领域',
    label: '浏览器 / 垂直领域',
    desc: '真实网页与垂直场景',
    icon: <Compass size={16} aria-hidden="true" />,
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/projects?q=${encodeURIComponent(value)}` : '/projects')
  }

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <span className="hero-eyebrow">
            <span aria-hidden="true">●</span> Agent 项目练习场
          </span>
          <h1 className="hero-title">不缺教程，缺的是练手的项目</h1>
          <p className="hero-sub">
            把热门 Agent GitHub 项目整理成可练习、可追踪进度的题库。选一个方向，跑通、讲清楚、再扩展。
          </p>

          <form className="hero-form" onSubmit={submit}>
            <div className="searchbox">
              <Search size={17} aria-hidden="true" />
              <input
                className="text-input"
                type="search"
                placeholder="搜索项目、技术栈或学习点"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="搜索项目"
              />
            </div>
            <button className="primary-btn" type="submit">
              开始练习
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>

          <div className="hero-quick">
            {QUICK_ENTRIES.map((entry) => (
              <Link
                key={entry.direction}
                className="quick-entry"
                to={`/projects?direction=${encodeURIComponent(entry.direction)}`}
                title={entry.desc}
              >
                {entry.icon}
                {entry.label}
              </Link>
            ))}
          </div>

          <div className="stats-strip" style={{ marginTop: 34 }}>
            <span className="stat">
              <strong>{projects.length}</strong> 个练手项目
            </span>
            <span className="stat">
              <strong>{caseStudies.length}</strong> 篇深度案例
            </span>
            <span className="stat">
              数据更新 <strong>{updatedAt}</strong>
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-eyebrow">START HERE</span>
              <h2 className="section-title">从三个方向开始</h2>
              <p className="section-sub">按方向筛选后，再按难度阶梯从入门项目逐个击破。</p>
            </div>
            <Link className="read-link" to="/projects">
              进入完整项目库
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid">
            {QUICK_ENTRIES.map((entry) => (
              <Link
                key={entry.direction}
                className="case-card"
                to={`/projects?direction=${encodeURIComponent(entry.direction)}`}
              >
                <span className="badge-direction">{entry.direction}</span>
                <h3 className="case-title">{entry.label}</h3>
                <p className="case-summary">{entry.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
