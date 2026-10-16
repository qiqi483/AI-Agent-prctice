import { Bot, Clock, Target, UserRound, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAgentConfig } from '../lib/storage'

interface ProfileModalProps {
  author: { nickname: string; avatar?: string } | null
  onClose: () => void
}

function maskPhone(phone?: string): string {
  if (!phone) return '未公开'
  if (phone.length < 7) return `${phone.slice(0, 1)}****`
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

export default function ProfileModal({ author, onClose }: ProfileModalProps) {
  const { user } = useAuth()
  const [agent] = useAgentConfig()

  if (!author) return null
  const isSelf = user?.nickname === author.nickname

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="关闭">
          <X size={18} />
        </button>

        <div className="profile-head">
          <div className="avatar-lg">
            {author.avatar ? <img src={author.avatar} alt="头像" /> : <UserRound size={30} aria-hidden="true" />}
          </div>
          <div>
            <div className="profile-name">{author.nickname}</div>
            <div className="report-meta">{isSelf ? maskPhone(user?.phone) : '未公开'}</div>
          </div>
        </div>

        <div className="profile-section">
          <div className="note-head">
            <h2>
              <Bot size={16} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: 6 }} />
              他的 Agent
            </h2>
          </div>
          {isSelf ? (
            <div className="profile-agent">
              <div>
                <span className="label">使用的智能体</span>
                <p>{agent.agent || '未填写'}</p>
              </div>
              <div>
                <span className="label">模型</span>
                <p>{agent.model || '未填写'}</p>
              </div>
              <div>
                <span className="label">
                  <Clock size={13} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  每日可用时长
                </span>
                <p>{agent.dailyHours || '未填写'}</p>
              </div>
              <div>
                <span className="label">
                  <Target size={13} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  当前目标
                </span>
                <p>{agent.goal || '未填写'}</p>
              </div>
            </div>
          ) : (
            <p className="case-summary">该用户暂未公开 Agent 配置。</p>
          )}
        </div>
      </div>
    </div>
  )
}
