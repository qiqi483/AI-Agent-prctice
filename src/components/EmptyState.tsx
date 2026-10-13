import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  sub?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, sub, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-art">{icon}</div>}
      <h3 className="empty-title">{title}</h3>
      {sub && <p className="empty-sub">{sub}</p>}
      {action}
    </div>
  )
}
