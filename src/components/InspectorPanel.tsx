import { useRef, useState } from 'react'
import type { DragEvent, InputHTMLAttributes } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  FolderUp,
  Link2,
  Loader2,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { inspectProject, readFolderFiles } from '../lib/inspector'
import { useReport } from '../lib/storage'
import type { InspectorFinding, InspectorReport, Project } from '../lib/types'

const DIRECTORY_PROPS = { webkitdirectory: '' } as InputHTMLAttributes<HTMLInputElement>

const DIMENSIONS: { key: keyof InspectorReport['dimensions']; label: string; weight: number }[] = [
  { key: 'completion', label: '完成度', weight: 40 },
  { key: 'innovation', label: '创新度', weight: 20 },
  { key: 'similarity', label: '相似度', weight: 20 },
  { key: 'aesthetics', label: '美观度', weight: 20 },
]

function FindingIcon({ level }: { level: InspectorFinding['level'] }) {
  if (level === 'good') return <CheckCircle2 size={15} aria-hidden="true" />
  if (level === 'warn') return <AlertTriangle size={15} aria-hidden="true" />
  return <XCircle size={15} aria-hidden="true" />
}

export default function InspectorPanel({ project }: { project: Project }) {
  const [report, changeReport] = useReport(project.id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [mode, setMode] = useState<'folder' | 'link'>('folder')
  const [url, setUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const inspect = async (fileList: FileList | File[]) => {
    setLoading(true)
    setError('')
    try {
      const files = await readFolderFiles(fileList)
      if (files.length === 0) {
        setError('没有读到可分析的文本文件，请确认选择的是项目代码目录。')
        return
      }
      changeReport(inspectProject(project, files))
    } catch {
      setError('读取文件失败，请重试。')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    if (event.dataTransfer.files.length) {
      void inspect(event.dataTransfer.files)
    }
  }

  const inspectUrl = async () => {
    const target = url.trim()
    if (!/^https?:\/\//i.test(target)) {
      setError('请输入 http 或 https 开头的链接。')
      return
    }
    setLoading(true)
    setError('')
    try {
      const controller = new AbortController()
      const timer = window.setTimeout(() => controller.abort(), 12000)
      const response = await fetch(target, { signal: controller.signal })
      window.clearTimeout(timer)
      if (!response.ok) throw new Error('bad status')
      const text = await response.text()
      if (!text.trim()) {
        setError('链接返回内容为空。')
        return
      }
      changeReport(inspectProject(project, [{ name: target, content: text }]))
    } catch {
      setError('无法读取该链接：可能被跨域限制或站点拒绝访问，请改用文件夹提交。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="inspector">
      <div className="note-head">
        <h2>
          <ShieldCheck size={18} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: 6 }} />
          AI 检察官
        </h2>
        <span className="note-hint">本地规则引擎分析，文件不会上传</span>
      </div>

      <div className="inspector-mode" role="tablist" aria-label="提交方式">
        <button
          type="button"
          className={`chip${mode === 'folder' ? ' is-active' : ''}`}
          onClick={() => {
            setMode('folder')
            setError('')
          }}
        >
          文件夹
        </button>
        <button
          type="button"
          className={`chip${mode === 'link' ? ' is-active' : ''}`}
          onClick={() => {
            setMode('link')
            setError('')
          }}
        >
          链接
        </button>
      </div>

      {mode === 'folder' ? (
        <div
          className={`inspector-drop${dragging ? ' is-dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
          }}
        >
          <FolderUp size={26} aria-hidden="true" />
          <div>
            <div className="inspector-drop-title">
              {loading ? '正在检查…' : '上传项目文件夹'}
            </div>
            <div className="inspector-drop-sub">点击选择或拖入文件夹，支持 Node / Python / 前端项目</div>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            {...DIRECTORY_PROPS}
            onChange={(event) => {
              if (event.target.files) void inspect(event.target.files)
              event.target.value = ''
            }}
            hidden
          />
        </div>
      ) : (
        <div className="url-submit">
          <div className="searchbox" style={{ flex: 1 }}>
            <Link2 size={16} aria-hidden="true" />
            <input
              className="text-input"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="粘贴项目仓库或演示链接"
              aria-label="项目链接"
            />
          </div>
          <button className="primary-btn" type="button" onClick={() => void inspectUrl()}>
            检查链接
          </button>
        </div>
      )}

      {error && <p className="inspector-error">{error}</p>}

      {loading && (
        <div className="inspector-loading">
          <Loader2 className="spin" size={16} aria-hidden="true" />
          正在按四个维度检查文件…
        </div>
      )}

      {report && !loading && (
        <div className="inspector-report">
          <div className="report-summary">
            <div className="score-ring">
              <strong>{report.total}</strong>
              <span>/ 100</span>
            </div>
            <div>
              <div className="report-title">综合评分</div>
              <p className="report-summary-text">{report.summary}</p>
              <div className="report-meta">已分析 {report.fileCount} 个文件</div>
            </div>
          </div>

          <div className="dim-bars">
            {DIMENSIONS.map((item) => {
              const value = report.dimensions[item.key]
              return (
                <div className="dim-row" key={item.key}>
                  <div className="dim-label">
                    <span>{item.label}</span>
                    <span>
                      {value}
                      <em> / {item.weight}%</em>
                    </span>
                  </div>
                  <div className="dim-track">
                    <span className="dim-fill" style={{ width: `${value}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="findings">
            {report.findings.map((finding, index) => (
              <div className={`finding finding-${finding.level}`} key={`${finding.text}-${index}`}>
                <span className="finding-icon">
                  <FindingIcon level={finding.level} />
                </span>
                <span className="finding-dim">{finding.dimension}</span>
                <span className="finding-text">{finding.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
