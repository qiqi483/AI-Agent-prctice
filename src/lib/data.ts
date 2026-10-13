import raw from '../../data/projects.json'
import type { CaseStudy, Difficulty, Project } from './types'

export interface DifficultyMeta {
  value: Difficulty
  label: string
  emoji: string
  order: number
}

export const projects = raw.projects as Project[]
export const caseStudies = raw.cases as CaseStudy[]
export const updatedAt = raw.updated
export const starsFetchedAt = raw.starsFetchedAt
export const SOURCE_URL = raw.source

export const DIFFICULTIES: DifficultyMeta[] = [
  { value: 'beginner', label: '入门', emoji: '🌱', order: 0 },
  { value: 'intermediate', label: '进阶', emoji: '🌿', order: 1 },
  { value: 'advanced', label: '高级', emoji: '🌳', order: 2 },
]

export const DIFFICULTY_MAP: Record<Difficulty, DifficultyMeta> = {
  beginner: DIFFICULTIES[0],
  intermediate: DIFFICULTIES[1],
  advanced: DIFFICULTIES[2],
}

export const DIRECTIONS = Array.from(new Set(projects.map((p) => p.direction)))

export function getProject(id: string | undefined): Project | undefined {
  return projects.find((p) => p.id === id)
}

export function formatStars(stars: number): string {
  if (stars >= 1_000_000) return `${(stars / 1_000_000).toFixed(1)}M`
  if (stars >= 1_000) return `${Math.round(stars / 1_000)}k`
  return String(stars)
}

export function difficultyOrder(difficulty: Difficulty): number {
  return DIFFICULTY_MAP[difficulty].order
}
