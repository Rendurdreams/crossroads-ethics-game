import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Host from './pages/Host.jsx'
import Play from './pages/Play.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/host/:sessionId" element={<Host />} />
        <Route path="/play/:sessionId" element={<Play />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
