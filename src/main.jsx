import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Profile from './pages/Profile.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/lead" element={<App flowSrc="/lead_magnet_flow.json" />} />
          <Route path="/healingcompass" element={<App flowSrc="/flow.json" />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/" element={<App flowSrc="/lead_magnet_flow.json" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
