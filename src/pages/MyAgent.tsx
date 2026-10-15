import { useEffect, useState } from 'react'
import { Check, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAgentConfig } from '../lib/storage'
import type { AgentConfig } from '../lib/types'

const AGENT_OPTIONS = ['Claude Code', 'Codex CLI', 'Cursor', 'OpenHands', '其他']

export default function MyAgent() {
  const { user, requireLogin } = useAuth()
  const [agent, changeAgent] = useAgentConfig()
  const [form, setForm] = useState<AgentConfig>(agent)
  const [saved, setSaved] = useState(false)

  const update = <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const persist = () => {
    changeAgent({ ...form, nickname: form.nickname.trim() })
    setSaved(true)
  }

  const save = () => {
    if (!user) {
      requireLogin(() => persist())
      return
    }
    persist()
  }

  useEffect(() => {
    if (!saved) return
    const timer = window.setTimeout(() => setSaved(false), 2200)
    return () => window.clearTimeout(timer)
  }, [saved])

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="section-eyebrow">MY AGENT</span>
          <h1 className="section-title">我的 Agent</h1>
          <p className="section-sub">保存后全站生效，详情页和导航栏都会使用这份配置。</p>
        </div>
        {saved && (
          <span className="toast">
            <Check size={14} aria-hidden="true" />
            已保存
          </span>
        )}
      </div>

      <div className="form">
        <div className="field">
          <label className="label" htmlFor="nickname">
            昵称
          </label>
          <input
            id="nickname"
            className="text-input"
            value={form.nickname}
            onChange={(event) => update('nickname', event.target.value)}
            placeholder="例如：阿杰"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="agent">
            使用的智能体
          </label>
          <select
            id="agent"
            className="select"
            value={form.agent}
            onChange={(event) => update('agent', event.target.value)}
          >
            {AGENT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="model">
            模型
          </label>
          <input
            id="model"
            className="text-input"
            value={form.model}
            onChange={(event) => update('model', event.target.value)}
            placeholder="例如：GPT-5.4"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="dailyHours">
            每日可用时长
          </label>
          <input
            id="dailyHours"
            className="text-input"
            value={form.dailyHours}
            onChange={(event) => update('dailyHours', event.target.value)}
            placeholder="例如：2 小时"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="goal">
            当前目标
          </label>
          <textarea
            id="goal"
            className="textarea"
            style={{ minHeight: 110 }}
            value={form.goal}
            onChange={(event) => update('goal', event.target.value)}
            placeholder="例如：这个月跑通 3 个 Coding Agent 项目"
          />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="primary-btn" type="button" onClick={save}>
            <Save size={16} aria-hidden="true" />
            保存配置
          </button>
          <Link className="read-link" to="/projects">
            去项目库开始练习
          </Link>
        </div>
      </div>
    </div>
  )
}
