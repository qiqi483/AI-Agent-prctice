import { useEffect, useState } from 'react'
import { Copy, Sparkles, Wand2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { generatePracticePrompt, revisePrompt, scorePrompt } from '../lib/promptCoach'
import { usePrompt } from '../lib/storage'
import type { Project } from '../lib/types'

export default function PromptCoach({ project }: { project: Project }) {
  const { user, requireLogin } = useAuth()
  const [prompt, changePrompt] = usePrompt(project.id)
  const [draft, setDraft] = useState(prompt?.submitted ?? '')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setDraft(prompt?.submitted ?? '')
  }, [prompt?.submitted])

  if (project.difficulty === 'intermediate') return null

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // 剪贴板不可用时静默失败。
    }
  }

  const generate = () => {
    if (!user) {
      requireLogin()
      return
    }
    changePrompt({ ...prompt, generated: generatePracticePrompt(project) })
  }

  const submit = () => {
    if (!user) {
      requireLogin()
      return
    }
    if (!draft.trim()) return
    const result = scorePrompt(project, draft)
    changePrompt({
      submitted: draft,
      score: result.score,
      feedback: result.feedback,
      revised: revisePrompt(project, draft),
    })
  }

  if (!user) {
    return (
      <section className="note-panel note-locked prompt-coach">
        <div className="note-head">
          <h2>
            <Sparkles size={16} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: 6 }} />
            练习提示词
          </h2>
          <span className="note-hint">登录后可用</span>
        </div>
        <p className="lock-hint">
          {project.difficulty === 'beginner'
            ? '登录后由 AI 生成参考提示词。'
            : '登录后提交你的提示词，AI 会打分并给出改后版本。'}
        </p>
        <button className="primary-btn" type="button" onClick={() => requireLogin()}>
          登录后使用
        </button>
      </section>
    )
  }

  return (
    <section className="note-panel prompt-coach">
      <div className="note-head">
        <h2>
          <Sparkles size={16} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: 6 }} />
          练习提示词
        </h2>
        <span className="note-hint">
          {project.difficulty === 'beginner' ? 'AI 根据项目描述生成参考提示词' : 'AI 打分后给出改后提示词'}
        </span>
      </div>

      {project.difficulty === 'beginner' ? (
        <>
          <p className="lock-hint">AI 会把项目目标、步骤与验收标准整理成一份可直接使用的提示词。</p>
          <div className="prompt-actions">
            <button className="primary-btn" type="button" onClick={generate}>
              <Wand2 size={15} aria-hidden="true" />
              生成参考提示词
            </button>
            {prompt?.generated && (
              <button className="chip" type="button" onClick={() => copy(prompt.generated ?? '')}>
                <Copy size={13} aria-hidden="true" />
                {copied ? '已复制' : '复制'}
              </button>
            )}
          </div>
          {prompt?.generated && <pre className="prompt-output">{prompt.generated}</pre>}
        </>
      ) : (
        <>
          <textarea
            className="textarea"
            style={{ minHeight: 150 }}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={'写出你的练习提示词，AI 会从目标、步骤、技术栈、验收标准等维度打分，并给出改后版本…'}
          />
          <div className="prompt-actions">
            <button className="primary-btn" type="button" onClick={submit}>
              <Sparkles size={15} aria-hidden="true" />
              提交并打分
            </button>
          </div>

          {prompt?.score != null && (
            <div className="prompt-result">
              <div className="prompt-score">
                <strong>{prompt.score}</strong> / 100
              </div>
              {prompt.feedback && prompt.feedback.length > 0 && (
                <ul className="prompt-feedback">
                  {prompt.feedback.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {prompt.revised && (
                <div className="prompt-block">
                  <div className="note-head">
                    <h2>AI 改后的提示词</h2>
                    <button className="chip" type="button" onClick={() => copy(prompt.revised ?? '')}>
                      <Copy size={13} aria-hidden="true" />
                      {copied ? '已复制' : '复制'}
                    </button>
                  </div>
                  <pre className="prompt-output">{prompt.revised}</pre>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}
