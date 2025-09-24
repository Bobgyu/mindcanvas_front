import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Join from './Join.jsx'
import Login from './Login.jsx'
import MyPage from './MyPage.jsx'
import MainPage from './MainPage.jsx'
import Coordinator from './Coordinator.jsx'
import Home from './draw/home.jsx'
import Analysis from './draw/analysis.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/join" element={<Join />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/coordinator" element={<Coordinator />} />
        <Route path="/draw/home" element={<Home />} />
        <Route path="/draw/analysis" element={<Analysis />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)