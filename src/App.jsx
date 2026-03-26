import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing.jsx'
import HostSetup from './pages/HostSetup.jsx'
import Host from './pages/Host.jsx'
import Play from './pages/Play.jsx'

function AppRoutes() {
  const location = useLocation()
  return (
    <>
      <div aria-hidden="true" className="ambientLayer" />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/host-setup/:sessionId" element={<HostSetup />} />
          <Route path="/host/:sessionId" element={<Host />} />
          <Route path="/play/:sessionId" element={<Play />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
