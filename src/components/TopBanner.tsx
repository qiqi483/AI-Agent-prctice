import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronDown, ChevronUp, MonitorX } from 'lucide-react'

const BILI_URL = 'https://www.bilibili.com/toy/ai-model-world'

type PanelState = 'closed' | 'loading' | 'embed' | 'blocked'

export default function TopBanner() {
  const [state, setState] = useState<PanelState>('closed')
  const timerRef = useRef<number | undefined>(undefined)

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
  }

  const close = () => {
    clearTimer()
    setState('closed')
  }

  const toggle = () => {
    if (state !== 'closed') {
      close()
      return
    }

    setState('loading')
    timerRef.current = window.setTimeout(() => {
      setState((current) => (current === 'loading' ? 'blocked' : current))
    }, 3500)

    fetch(BILI_URL, { method: 'HEAD', mode: 'cors' })
      .then((res) => {
        const xfo = res.headers.get('x-frame-options')?.toUpperCase()
        const csp = res.headers.get('content-security-policy') ?? ''
        const denied =
          xfo === 'DENY' ||
          xfo === 'SAMEORIGIN' ||
          /frame-ancestors\s+(?:'none'|(?!\s*\*))/.test(csp)
        if (denied) {
          clearTimer()
          setState('blocked')
        }
      })
      .catch(() => {
        // CORS 不放开响应头时无法读取 X-Frame-Options，交给 iframe 自行判定。
      })
  }

  useEffect(() => clearTimer, [])

  return (
    <div className="top-banner">
      <div className="container banner-inner">
        <a className="banner-cta" href={BILI_URL} target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">🤖</span>
          查看最新智能体
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
        <button
          type="button"
          className="banner-toggle"
          onClick={toggle}
          aria-expanded={state !== 'closed'}
        >
          {state === 'closed' ? '内嵌预览' : '收起预览'}
          {state === 'closed' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {state !== 'closed' && (
        <div className="banner-panel">
          <div className="container">
            <div className="banner-panel-frame">
              {state === 'blocked' ? (
                <div className="banner-blocked">
                  <MonitorX size={34} aria-hidden="true" />
                  <div>
                    <div className="banner-blocked-title">该页面不允许内嵌</div>
                    <div className="banner-blocked-sub">已在浏览器中阻止 iframe 加载</div>
                  </div>
                  <a className="primary-btn" href={BILI_URL} target="_blank" rel="noopener noreferrer">
                    在新标签页打开
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
              ) : (
                <iframe
                  src={BILI_URL}
                  title="B 站最新智能体"
                  loading="lazy"
                  onLoad={() => {
                    clearTimer()
                    setState('embed')
                  }}
                  onError={() => {
                    clearTimer()
                    setState('blocked')
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
