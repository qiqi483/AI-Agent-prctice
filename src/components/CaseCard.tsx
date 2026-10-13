import { ArrowUpRight } from 'lucide-react'
import type { CaseStudy } from '../lib/types'

export default function CaseCard({ item }: { item: CaseStudy }) {
  return (
    <article className="case-card">
      <h3 className="case-title">{item.title}</h3>
      <p className="case-summary">{item.summary}</p>
      <a className="read-link" href={item.url} target="_blank" rel="noopener noreferrer">
        读拆解
        <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </article>
  )
}
