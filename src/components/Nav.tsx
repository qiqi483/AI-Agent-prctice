import { Moon, Settings, Sun } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../lib/storage'

const LINKS = [
  { to: '/', label: '首页' },
  { to: '/projects', label: '项目库' },
  { to: '/learn', label: '学习' },
  { to: '/forum', label: '论坛' },
  { to: '/my-agent', label: '我的 Agent' },
  { to: '/about', label: '关于' },
]

export default function Nav() {
  const [theme, changeTheme] = useTheme()
  const { user } = useAuth()
  const initial = (user?.nickname ?? '').trim().charAt(0).toUpperCase() || '我'

  return (
    <nav className="container nav" aria-label="主导航">
      <Link className="brand" to="/">
        <span className="brand-mark">A</span>
        <span>
          Agent 项目练习场
          <small>练手题库</small>
        </span>
      </Link>

      <div className="nav-links">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="nav-actions">
        <Link className="icon-btn" to="/settings" title="设置" aria-label="设置">
          <Settings size={17} />
        </Link>
        <button
          type="button"
          className="icon-btn"
          onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
          title={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <Link
          className="avatar"
          to="/my-agent"
          title={user?.nickname ? `我的 Agent：${user.nickname}` : '配置我的 Agent'}
          aria-label="我的 Agent"
        >
          {user?.avatar ? <img className="avatar-img" src={user.avatar} alt="头像" /> : initial}
        </Link>
      </div>
    </nav>
  )
}
