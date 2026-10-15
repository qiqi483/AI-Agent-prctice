import { motion } from 'framer-motion'
import { ArrowRight, Check, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatStars } from '../lib/data'
import type { Project } from '../lib/types'
import DifficultyBadge from './DifficultyBadge'

interface ProjectCardProps {
  project: Project
  index: number
  isDone: boolean
  onToggle: (id: string) => void
}

export default function ProjectCard({ project, index, isDone, onToggle }: ProjectCardProps) {
  const { user, requireLogin } = useAuth()

  const toggle = () => {
    if (!user) {
      requireLogin(() => onToggle(project.id))
      return
    }
    onToggle(project.id)
  }

  return (
    <motion.article
      className="project-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.3), ease: 'easeOut' }}
    >
      <div className="card-top">
        <div>
          <Link to={`/project/${project.id}`}>
            <h3 className="card-name">{project.name}</h3>
          </Link>
          <div className="card-repo">{project.repo}</div>
        </div>
        <span className="card-stars" title={`${project.stars.toLocaleString()} stars`}>
          <Star size={13} aria-hidden="true" />
          {formatStars(project.stars)}
        </span>
      </div>

      <p className="card-summary">{project.summary}</p>

      <div className="card-tags">
        <span className="badge-direction">{project.direction}</span>
        <DifficultyBadge value={project.difficulty} />
      </div>

      <div className="card-foot">
        <button
          type="button"
          className={`done-toggle${isDone ? ' is-done' : ''}`}
          onClick={toggle}
          aria-pressed={isDone}
        >
          <span className="done-box" aria-hidden="true">
            {isDone && <Check size={13} />}
          </span>
          {isDone ? '已完成' : '标记完成'}
        </button>
        <Link className="card-link" to={`/project/${project.id}`}>
          查看练习
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  )
}
