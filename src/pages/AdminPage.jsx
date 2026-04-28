import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import AdminLogin from '../components/admin/AdminLogin'
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminDatasetForm from '../components/admin/AdminDatasetForm'
import AdminArticleForm from '../components/admin/AdminArticleForm'
import AdminDatasetList from '../components/admin/AdminDatasetList'
import AdminArticleList from '../components/admin/AdminArticleList'
import {
  LayoutDashboard, Database, FileText, Plus,
  LogOut, BarChart2, ChevronRight, User
} from 'lucide-react'
import styles from './AdminPage.module.css'

export default function AdminPage() {
  const { user, isAuthenticated, loading, login, logout, resetPassword } = useAdminAuth()

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div className={styles.spinner} />
    </div>
  )

  if (!isAuthenticated) return (
    <AdminLogin onLogin={login} onResetPassword={resetPassword} />
  )

  return (
    <div className={styles.shell}>
      <AdminSidebar user={user} onLogout={logout} />
      <main className={styles.content}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="datasets" element={<AdminDatasetList />} />
          <Route path="datasets/new" element={<AdminDatasetForm />} />
          <Route path="datasets/edit/:id" element={<AdminDatasetForm />} />
          <Route path="articles" element={<AdminArticleList />} />
          <Route path="articles/new" element={<AdminArticleForm />} />
          <Route path="articles/edit/:id" element={<AdminArticleForm />} />
        </Routes>
      </main>
    </div>
  )
}

function AdminSidebar({ user, onLogout }) {
  const location = useLocation()
  const path = location.pathname

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/datasets', icon: Database, label: 'Datasets' },
    { to: '/admin/articles', icon: FileText, label: 'Articles' },
  ]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <BarChart2 size={18} />
        <div>
          <span className={styles.logoName}>StarVyk</span>
          <span className={styles.logoSub}>Admin Panel</span>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        <p className={styles.navLabel}>Navigation</p>
        {navItems.map(({ to, icon: Icon, label, exact }) => {
          const active = exact ? path === to : path.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={`${styles.navItem} ${active ? styles.navActive : ''}`}
            >
              <Icon size={15} strokeWidth={1.5} />
              <span>{label}</span>
              {active && <ChevronRight size={13} className={styles.navChevron} />}
            </Link>
          )
        })}
      </nav>

      <div className={styles.sidebarActions}>
        <p className={styles.navLabel}>Quick Actions</p>
        <Link to="/admin/datasets/new" className={styles.quickAction}>
          <Plus size={13} /> New Dataset
        </Link>
        <Link to="/admin/articles/new" className={styles.quickAction}>
          <Plus size={13} /> New Article
        </Link>
      </div>

      <div className={styles.sidebarFooter}>
        {user && (
          <div className={styles.userRow}>
            <div className={styles.userAvatar}>
              <User size={13} />
            </div>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
        )}
        <Link to="/" className={styles.viewSite} target="_blank">
          View Site ↗
        </Link>
        <button className={styles.logoutBtn} onClick={onLogout}>
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
