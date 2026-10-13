import { DIFFICULTY_MAP } from '../lib/data'
import type { Difficulty } from '../lib/types'

export default function DifficultyBadge({ value }: { value: Difficulty }) {
  const meta = DIFFICULTY_MAP[value]
  return (
    <span className="badge-difficulty">
      <span aria-hidden="true">{meta.emoji}</span>
      {meta.label}
    </span>
  )
}
