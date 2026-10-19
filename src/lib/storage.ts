import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type { AgentConfig, AuthUser, ForumComment, ForumPost, InspectorReport, PracticePrompt, ThemeMode } from './types'
import { wallpapers } from './wallpapers'

const PREFIX = 'apg:'
const KEYS = {
  theme: 'theme',
  agent: 'agent',
  completed: 'completed',
  notes: 'notes',
  reports: 'reports',
  auth: 'auth',
  session: 'session',
  posts: 'posts',
  wallpaper: 'wallpaper',
  prompts: 'prompts',
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
  session: boolean
  posts: ForumPost[]
  wallpaper: string | null
  prompts: Record<string, PracticePrompt>
} = {
  theme: read<ThemeMode>(KEYS.theme, 'dark'),
  agent: read<AgentConfig>(KEYS.agent, DEFAULT_AGENT),
  completed: read<string[]>(KEYS.completed, []),
  notes: read<Record<string, string>>(KEYS.notes, {}),
  reports: read<Record<string, InspectorReport>>(KEYS.reports, {}),
  auth: read<AuthUser | null>(KEYS.auth, null),
  session: read<boolean>(KEYS.session, false),
  posts: read<ForumPost[]>(KEYS.posts, []),
  wallpaper: read<string | null>(KEYS.wallpaper, null),
  prompts: read<Record<string, PracticePrompt>>(KEYS.prompts, {}),
}

function applyWallpaper(id: string | null): void {
  const item = wallpapers.find((wallpaper) => wallpaper.id === id)
  const url = item?.url ?? null
  document.documentElement.classList.toggle('has-wallpaper', Boolean(url))
  if (url) {
    document.documentElement.style.setProperty('--wallpaper', `url("${url}")`)
  } else {
    document.documentElement.style.removeProperty('--wallpaper')
  }
}

applyWallpaper(store.wallpaper)

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
  return store.session ? store.auth : null
}

export function getAccount(): AuthUser | null {
  return store.auth
}

export function registerUser(user: AuthUser): void {
  store.auth = user
  store.session = true
  write(KEYS.auth, user)
  write(KEYS.session, true)
  emitChange()
}

export function loginUser(user: AuthUser): void {
  store.auth = { ...(store.auth ?? {}), ...user }
  store.session = true
  write(KEYS.auth, store.auth)
  write(KEYS.session, true)
  emitChange()
}

export function signOut(): void {
  store.session = false
  write(KEYS.session, false)
  emitChange()
}

export function updateAuthUser(patch: Partial<AuthUser>): void {
  if (!store.auth) return
  store.auth = { ...store.auth, ...patch }
  write(KEYS.auth, store.auth)
  emitChange()
}

export function useAuthUser(): AuthUser | null {
  return useStore(getAuthUser)
}

export function useAccount(): AuthUser | null {
  return useStore(getAccount)
}

export function getPosts(): ForumPost[] {
  return store.posts
}

export function addPost(post: ForumPost): void {
  store.posts = [post, ...store.posts]
  write(KEYS.posts, store.posts)
  emitChange()
}

export function addComment(postId: string, comment: ForumComment): void {
  store.posts = store.posts.map((post) =>
    post.id === postId ? { ...post, comments: [...(post.comments ?? []), comment] } : post,
  )
  write(KEYS.posts, store.posts)
  emitChange()
}

export function usePosts(): ForumPost[] {
  return useStore(getPosts)
}

export function getWallpaper(): string | null {
  return store.wallpaper
}

export function setWallpaper(id: string | null): void {
  store.wallpaper = id
  write(KEYS.wallpaper, id)
  applyWallpaper(id)
  emitChange()
}

export function useWallpaper(): [string | null, (id: string | null) => void] {
  const id = useStore(getWallpaper)

  const changeWallpaper = useCallback((next: string | null) => {
    setWallpaper(next)
  }, [])

  return [id, changeWallpaper]
}

export function getPrompt(id: string): PracticePrompt | undefined {
  return store.prompts[id]
}

export function setPrompt(id: string, prompt: PracticePrompt): void {
  store.prompts = { ...store.prompts, [id]: prompt }
  write(KEYS.prompts, store.prompts)
  emitChange()
}

export function usePrompt(id: string): [PracticePrompt | undefined, (prompt: PracticePrompt) => void] {
  const prompt = useStore(() => getPrompt(id))

  const changePrompt = useCallback((next: PracticePrompt) => {
    setPrompt(id, next)
  }, [id])

  return [prompt, changePrompt]
}
