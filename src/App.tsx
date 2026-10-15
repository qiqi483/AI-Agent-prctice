import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import TopBanner from './components/TopBanner'
import { AuthProvider } from './context/AuthContext'
import About from './pages/About'
import Forum from './pages/Forum'
import Home from './pages/Home'
import Learning from './pages/Learning'
import MyAgent from './pages/MyAgent'
import ProjectDetail from './pages/ProjectDetail'
import Projects from './pages/Projects'
import Settings from './pages/Settings'
import { GITHUB_REPO_URL } from './config'
import { SOURCE_URL, updatedAt } from './lib/data'

export default function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <div className="app-shell">
        <header className="site-header">
          <TopBanner />
          <Nav />
        </header>

        <main className="main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/learn" element={<Learning />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/my-agent" element={<MyAgent />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="footer">
          <div className="container footer-inner">
            <span>
              数据来自 <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">learnagent.org</a> · 更新于 {updatedAt}
            </span>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              GitHub 仓库
            </a>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}
