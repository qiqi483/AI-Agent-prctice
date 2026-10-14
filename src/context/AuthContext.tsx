import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import LoginModal from '../components/LoginModal'
import { signOut as signOutStore, useAuthUser } from '../lib/storage'
import type { AuthUser } from '../lib/types'

interface AuthContextValue {
  user: AuthUser | null
  requireLogin: (after?: () => void) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthUser()
  const [open, setOpen] = useState(false)
  const [afterLogin, setAfterLogin] = useState<(() => void) | null>(null)

  const requireLogin = useCallback((after?: () => void) => {
    setAfterLogin(() => after ?? null)
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setAfterLogin(null)
  }, [])

  const handleSuccess = useCallback(() => {
    setOpen(false)
    const after = afterLogin
    setAfterLogin(null)
    after?.()
  }, [afterLogin])

  const signOut = useCallback(() => signOutStore(), [])

  return (
    <AuthContext.Provider value={{ user, requireLogin, signOut }}>
      {children}
      <LoginModal open={open} onClose={close} onSuccess={handleSuccess} />
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return context
}
