import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DatasetsPage from './pages/DatasetsPage'
import ArticlesPage from './pages/ArticlesPage'
import DatasetPage from './pages/DatasetPage'
import ArticlePage from './pages/ArticlePage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="datasets" element={<DatasetsPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="dataset/:slug" element={<DatasetPage />} />
        <Route path="article/:slug" element={<ArticlePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/admin/*" element={<AdminPage />} />
    </Routes>
  )
}
