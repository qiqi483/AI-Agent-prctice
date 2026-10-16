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

export interface InspectorDimensionScores {
  completion: number
  innovation: number
  similarity: number
  aesthetics: number
}

export interface InspectorFinding {
  dimension: string
  level: 'good' | 'warn' | 'miss'
  text: string
}

export interface InspectorReport {
  projectId: string
  checkedAt: string
  fileCount: number
  total: number
  dimensions: InspectorDimensionScores
  findings: InspectorFinding[]
  summary: string
}

export interface LearningArticle {
  id: string
  title: string
  author: string
  date: string
  url: string
  summary: string
  topics: string[]
  note?: string
  featured?: boolean
  recommend?: string
}

export interface LearningResource {
  id: string
  title: string
  url: string
  note?: string
}

export interface AuthUser {
  nickname: string
  phone?: string
  avatar?: string
  passwordHash?: string
  method: 'password' | 'wechat'
  encouragement?: string
}

export interface ForumPost {
  id: string
  author: string
  content: string
  image?: string
  createdAt: number
}
