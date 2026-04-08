import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './pages/Home.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import Game from './pages/Game.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />}/>
        <Route path="/game/:gameId" element={<Game />}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
