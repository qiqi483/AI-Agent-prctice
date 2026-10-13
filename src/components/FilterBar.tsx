import { Search } from 'lucide-react'
import { DIFFICULTIES, DIRECTIONS } from '../lib/data'

export type SortValue = 'default' | 'stars-desc' | 'stars-asc'

const SORTS: { value: SortValue; label: string }[] = [
  { value: 'default', label: '默认：难度阶梯' },
  { value: 'stars-desc', label: '星标最多' },
  { value: 'stars-asc', label: '星标最少' },
]

interface FilterBarProps {
  direction: string
  difficulty: string
  query: string
  sort: SortValue
  onDirection: (value: string) => void
  onDifficulty: (value: string) => void
  onQuery: (value: string) => void
  onSort: (value: SortValue) => void
}

export default function FilterBar({
  direction,
  difficulty,
  query,
  sort,
  onDirection,
  onDifficulty,
  onQuery,
  onSort,
}: FilterBarProps) {
  return (
    <div className="filterbar">
      <div className="filterbar-row">
        <div className="chips" role="group" aria-label="方向筛选">
          <button
            type="button"
            className={`chip${direction === '全部' ? ' is-active' : ''}`}
            onClick={() => onDirection('全部')}
          >
            全部
          </button>
          {DIRECTIONS.map((item) => (
            <button
              type="button"
              key={item}
              className={`chip${direction === item ? ' is-active' : ''}`}
              onClick={() => onDirection(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="filterbar-row">
        <div className="searchbox">
          <Search size={16} aria-hidden="true" />
          <input
            className="text-input"
            type="search"
            placeholder="搜索项目、技术栈或学习点"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            aria-label="搜索项目"
          />
        </div>
        <select
          className="select"
          value={difficulty}
          onChange={(event) => onDifficulty(event.target.value)}
          aria-label="难度筛选"
        >
          <option value="全部">全部难度</option>
          {DIFFICULTIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.emoji} {item.label}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={sort}
          onChange={(event) => onSort(event.target.value as SortValue)}
          aria-label="排序方式"
        >
          {SORTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
