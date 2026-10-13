import { ArrowUpRight } from 'lucide-react'
import { GITHUB_REPO_URL } from '../config'
import { SOURCE_URL, starsFetchedAt, updatedAt } from '../lib/data'

export default function About() {
  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="section-eyebrow">ABOUT</span>
          <h1 className="section-title">关于这个练习场</h1>
          <p className="section-sub">数据来源、抓取时间与使用说明。</p>
        </div>
      </div>

      <div className="detail-grid" style={{ paddingTop: 0 }}>
        <section className="detail-block">
          <h2>数据来源</h2>
          <p>
            项目与案例整理自{' '}
            <a className="ref-link" href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
              learnagent.org/projects/
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
            ，题面最后更新于 {updatedAt}；GitHub 星标为 {starsFetchedAt} 的静态快照。
          </p>

          <h2>免责声明</h2>
          <p>
            本站仅用于学习与练手，项目名称、描述与链接均归各自作者与社区所有。星级是量级信号而非推荐排序，复现前请自行评估安全、成本与权限边界。
          </p>
        </section>

        <aside className="detail-block">
          <h2>代码仓库</h2>
          <p>本站源码开源，欢迎补充项目与修正题面。</p>
          <a className="ref-link" href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub 仓库
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </aside>
      </div>
    </div>
  )
}
