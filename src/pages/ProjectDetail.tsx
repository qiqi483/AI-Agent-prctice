import { ArrowLeft, BookOpen, ExternalLink, Play, Puzzle, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import DifficultyBadge from '../components/DifficultyBadge'
import EmptyState from '../components/EmptyState'
import { getProject, SOURCE_URL } from '../lib/data'
import { useAgentConfig, useCompleted, useNote } from '../lib/storage'

const ACCEPTANCE_ICONS = [
  <Play key="run" size={17} aria-hidden="true" />,
  <BookOpen key="explain" size={17} aria-hidden="true" />,
  <Puzzle key="extend" size={17} aria-hidden="true" />,
]

export default function ProjectDetail() {
  const { id } = useParams()
  const project = getProject(id)
  const [agent] = useAgentConfig()
  const { isDone, toggle } = useCompleted()
  const [note, setNote] = useNote(id ?? '')

  if (!project) {
    return (
      <div className="container page">
        <EmptyState
          title="项目不存在"
          sub="它可能已经从题库中移除。"
          action={
            <Link className="primary-btn" to="/projects">
              <ArrowLeft size={16} aria-hidden="true" />
              返回项目库
            </Link>
          }
        />
      </div>
    )
  }

  const done = isDone(project.id)
  const hasConfig = Boolean(agent.nickname.trim() || agent.model.trim())

  return (
    <div>
      <div className="detail-hero">
        <div className="container">
          <Link className="back-link" to="/projects">
            <ArrowLeft size={14} aria-hidden="true" />
            返回项目库
          </Link>

          <div className="detail-title-row">
            <h1 className="detail-title">{project.name}</h1>
            <span className="card-stars">{project.stars.toLocaleString()} stars</span>
            <span className="badge-direction">{project.direction}</span>
            <DifficultyBadge value={project.difficulty} />
          </div>

          <div className="agent-summary">
            <UserRound size={17} aria-hidden="true" />
            {hasConfig ? (
              <span>
                你正在用 <strong>{agent.agent}</strong>
                {agent.model ? (
                  <>
                    {' '}
                    + <strong>{agent.model}</strong>
                  </>
                ) : null}
                挑战本项目
              </span>
            ) : (
              <span>
                还没配置「我的 Agent」，<Link to="/my-agent">先去填写</Link>再开始挑战。
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container detail-grid">
        <div>
          <section className="detail-block">
            <h2>项目背景</h2>
            <p>{project.summary}</p>
            <ul className="learn-points">
              {project.learnPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          <section className="detail-block">
            <h2>复刻目标</h2>
            <p>{project.recommendation ?? project.summary}</p>
          </section>

          <section className="detail-block">
            <h2>建议步骤</h2>
            <div className="steps">
              {project.steps.map((step, index) => (
                <div className="step" key={step}>
                  <span className="step-num">S{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <section className="detail-block">
            <h2>验收标准</h2>
            <div className="acceptance">
              {project.acceptance.map((item, index) => (
                <div className="accept-tier" key={item}>
                  <span className="accept-tier-icon">{ACCEPTANCE_ICONS[index]}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="detail-block">
            <h2>技术栈</h2>
            <div className="card-tags">
              {project.tech.map((tech) => (
                <span className="badge-direction" key={tech}>
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section className="detail-block">
            <h2>参考链接</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              <a className="ref-link" href={project.github} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} aria-hidden="true" />
                GitHub 仓库
              </a>
              <a className="ref-link" href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} aria-hidden="true" />
                learnagent 项目库
              </a>
            </div>
          </section>
        </aside>
      </div>

      <div className="container" style={{ paddingBottom: 40 }}>
        <button
          type="button"
          className={`checkin${done ? ' is-done' : ''}`}
          onClick={() => toggle(project.id)}
          aria-pressed={done}
        >
          <Play size={16} aria-hidden="true" />
          {done ? '已完成，取消打卡' : '完成打卡'}
        </button>

        <section className="note-panel" style={{ marginTop: 18 }}>
          <div className="note-head">
            <h2>练习笔记</h2>
            <span className="note-hint">支持 Markdown，自动保存到本地</span>
          </div>
          <textarea
            className="textarea"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={'记录跑通过程、卡点和下一步计划…\n\n## 今天做了什么\n'}
            aria-label="练习笔记"
          />
        </section>
      </div>
    </div>
  )
}
