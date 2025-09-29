import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AuthGate from './AuthGate.jsx'
import Profile from './pages/Profile.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthGate>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/me" element={<Profile />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  </StrictMode>,
)
