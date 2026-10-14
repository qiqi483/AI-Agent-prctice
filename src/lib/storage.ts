import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type { AgentConfig, AuthUser, ForumPost, InspectorReport, ThemeMode } from './types'

const PREFIX = 'apg:'
const KEYS = {
  theme: 'theme',
  agent: 'agent',
  completed: 'completed',
  notes: 'notes',
  reports: 'reports',
  auth: 'auth',
  posts: 'posts',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(PREFIX + key)
    return value == null ? fallback : (JSON.parse(value) as T)
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // 隐私模式或配额超限时静默失败，不阻塞页面。
  }
}

export const DEFAULT_AGENT: AgentConfig = {
  nickname: '',
  agent: 'Codex CLI',
  model: '',
  dailyHours: '',
  goal: '',
}

const store: {
  theme: ThemeMode
  agent: AgentConfig
  completed: string[]
  notes: Record<string, string>
  reports: Record<string, InspectorReport>
  auth: AuthUser | null
  posts: ForumPost[]
} = {
  theme: read<ThemeMode>(KEYS.theme, 'dark'),
  agent: read<AgentConfig>(KEYS.agent, DEFAULT_AGENT),
  completed: read<string[]>(KEYS.completed, []),
  notes: read<Record<string, string>>(KEYS.notes, {}),
  reports: read<Record<string, InspectorReport>>(KEYS.reports, {}),
  auth: read<AuthUser | null>(KEYS.auth, null),
  posts: read<ForumPost[]>(KEYS.posts, []),
}

type Listener = () => void
const listeners = new Set<Listener>()

function emitChange(): void {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function useStore<T>(selector: () => T): T {
  return useSyncExternalStore(subscribe, selector, selector)
}

export function getTheme(): ThemeMode {
  return store.theme
}

export function setTheme(theme: ThemeMode): void {
  store.theme = theme
  write(KEYS.theme, theme)
  document.documentElement.dataset.theme = theme
}

export function getAgent(): AgentConfig {
  return store.agent
}

export function setAgent(config: AgentConfig): void {
  store.agent = config
  write(KEYS.agent, config)
}

export function getCompleted(): string[] {
  return store.completed
}

function setCompleted(ids: string[]): void {
  store.completed = ids
  write(KEYS.completed, ids)
}

export function getNotes(): Record<string, string> {
  return store.notes
}

export function getNote(id: string): string {
  return store.notes[id] ?? ''
}

export function setNote(id: string, text: string): void {
  const notes = { ...store.notes }
  if (text.trim()) {
    notes[id] = text
  } else {
    delete notes[id]
  }
  store.notes = notes
  write(KEYS.notes, notes)
}

export function getReport(id: string): InspectorReport | undefined {
  return store.reports[id]
}

export function setReport(report: InspectorReport): void {
  store.reports = { ...store.reports, [report.projectId]: report }
  write(KEYS.reports, store.reports)
}

export function useTheme(): [ThemeMode, (theme: ThemeMode) => void] {
  const theme = useStore(getTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const changeTheme = useCallback((next: ThemeMode) => {
    setTheme(next)
    emitChange()
  }, [])

  return [theme, changeTheme]
}

export function useAgentConfig(): [AgentConfig, (config: AgentConfig) => void] {
  const agent = useStore(getAgent)

  const changeAgent = useCallback((config: AgentConfig) => {
    setAgent(config)
    emitChange()
  }, [])

  return [agent, changeAgent]
}

export function useCompleted(): {
  completed: string[]
  isDone: (id: string) => boolean
  toggle: (id: string) => void
} {
  const completed = useStore(getCompleted)

  const toggle = useCallback((id: string) => {
    const current = getCompleted()
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    setCompleted(next)
    emitChange()
  }, [])

  const isDone = useCallback((id: string) => completed.includes(id), [completed])

  return { completed, isDone, toggle }
}

export function useNote(id: string): [string, (text: string) => void] {
  const note = useStore(() => getNote(id))

  const changeNote = useCallback(
    (text: string) => {
      setNote(id, text)
      emitChange()
    },
    [id],
  )

  return [note, changeNote]
}

export function useReport(id: string): [InspectorReport | undefined, (report: InspectorReport) => void] {
  const report = useStore(() => getReport(id))

  const changeReport = useCallback((next: InspectorReport) => {
    setReport(next)
    emitChange()
  }, [])

  return [report, changeReport]
}

export function getAuthUser(): AuthUser | null {
  return store.auth
}

export function signIn(user: AuthUser): void {
  store.auth = user
  write(KEYS.auth, user)
  emitChange()
}

export function signOut(): void {
  store.auth = null
  write(KEYS.auth, null)
  emitChange()
}

export function useAuthUser(): AuthUser | null {
  return useStore(getAuthUser)
}

export function getPosts(): ForumPost[] {
  return store.posts
}

export function addPost(post: ForumPost): void {
  store.posts = [post, ...store.posts]
  write(KEYS.posts, store.posts)
  emitChange()
}

export function usePosts(): ForumPost[] {
  return useStore(getPosts)
}
