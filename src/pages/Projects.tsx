import { SearchX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import CaseCard from '../components/CaseCard'
import EmptyState from '../components/EmptyState'
import FilterBar from '../components/FilterBar'
import type { SortValue } from '../components/FilterBar'
import ProjectCard from '../components/ProjectCard'
import { caseStudies, difficultyOrder, projects } from '../lib/data'
import { useCompleted } from '../lib/storage'

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isDone, toggle } = useCompleted()

  const direction = searchParams.get('direction') ?? '全部'
  const difficulty = searchParams.get('difficulty') ?? '全部'
  const query = searchParams.get('q') ?? ''
  const sort = (searchParams.get('sort') as SortValue) ?? 'default'

  const setParam = (key: string, value: string, clearValue = '') => {
    const next = new URLSearchParams(searchParams)
    if (value === clearValue) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next)
  }

  let list = projects
  if (direction !== '全部') list = list.filter((project) => project.direction === direction)
  if (difficulty !== '全部') list = list.filter((project) => project.difficulty === difficulty)
  if (query.trim()) {
    const keyword = query.trim().toLowerCase()
    list = list.filter((project) =>
      [
        project.name,
        project.repo,
        project.direction,
        project.summary,
        ...project.tech,
        ...project.learnPoints,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    )
  }

  const sorted = [...list].sort((a, b) => {
    if (sort === 'stars-desc') return b.stars - a.stars
    if (sort === 'stars-asc') return a.stars - b.stars
    return difficultyOrder(a.difficulty) - difficultyOrder(b.difficulty) || b.stars - a.stars
  })

  const hasFilter = direction !== '全部' || difficulty !== '全部' || query.trim() !== ''

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="section-eyebrow">PROJECT GYM</span>
          <h1 className="section-title">项目库</h1>
          <p className="section-sub">按方向、难度和关键词筛选，找到最适合现在的练手项目。</p>
        </div>
        <span className="stat">
          共 <strong>{sorted.length}</strong> 个
        </span>
      </div>

      <FilterBar
        direction={direction}
        difficulty={difficulty}
        query={query}
        sort={sort}
        onDirection={(value) => setParam('direction', value, '全部')}
        onDifficulty={(value) => setParam('difficulty', value, '全部')}
        onQuery={(value) => setParam('q', value)}
        onSort={(value) => setParam('sort', value, 'default')}
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={<SearchX size={38} aria-hidden="true" />}
          title="没有匹配的项目"
          sub="换个关键词，或清空筛选条件再试。"
          action={
            <button
              type="button"
              className="chip"
              onClick={() => setSearchParams({})}
            >
              清空筛选
            </button>
          }
        />
      ) : (
        <div className="grid">
          {sorted.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isDone={isDone(project.id)}
              onToggle={toggle}
            />
          ))}
        </div>
      )}

      {!hasFilter && (
        <section className="section">
          <div className="section-head">
            <div>
              <span className="section-eyebrow">CASE STUDY</span>
              <h2 className="section-title">实战案例拆解</h2>
              <p className="section-sub">两篇深度长文：真实项目怎么拆、怎么跑、怎么讲清楚。</p>
            </div>
          </div>
          <div className="grid">
            {caseStudies.map((item) => (
              <CaseCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
