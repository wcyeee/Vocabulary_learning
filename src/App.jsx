import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import NotebookDetail from './pages/NotebookDetail'
import AllCards from './pages/AllCards'
import Quiz from './pages/Quiz'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/notebook/:id" element={<Layout><NotebookDetail /></Layout>} />
        <Route path="/all-cards" element={<Layout><AllCards /></Layout>} />
        <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
      </Routes>
    </Router>
  )
}

export default App
