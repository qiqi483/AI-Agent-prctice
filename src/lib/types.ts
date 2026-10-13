export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Project {
  id: string
  name: string
  repo: string
  direction: string
  difficulty: Difficulty
  summary: string
  tech: string[]
  github: string
  stars: number
  learnPoints: string[]
  steps: string[]
  acceptance: string[]
  recommendation?: string
}

export interface CaseStudy {
  id: string
  title: string
  url: string
  summary: string
}

export interface AgentConfig {
  nickname: string
  agent: string
  model: string
  dailyHours: string
  goal: string
}

export type ThemeMode = 'dark' | 'light'
