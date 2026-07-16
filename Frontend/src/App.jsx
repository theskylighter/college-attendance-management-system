import Login from './features/auth/pages/login'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {


  return (
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
