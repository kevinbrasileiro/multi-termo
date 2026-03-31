import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './pages/Home.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import Room from './pages/Room.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />}/>
        <Route path="/room/:roomId" element={<Room />}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
