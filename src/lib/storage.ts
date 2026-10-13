import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type { AgentConfig, ThemeMode } from './types'

const PREFIX = 'apg:'
const KEYS = {
  theme: 'theme',
  agent: 'agent',
  completed: 'completed',
  notes: 'notes',
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
} = {
  theme: read<ThemeMode>(KEYS.theme, 'dark'),
  agent: read<AgentConfig>(KEYS.agent, DEFAULT_AGENT),
  completed: read<string[]>(KEYS.completed, []),
  notes: read<Record<string, string>>(KEYS.notes, {}),
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
