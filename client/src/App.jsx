import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from './components/Home';
import EditorDashboard from './components/EditorDashboard';
import YoutuberDashboard from './components/YoutuberDashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

const App = () => {
  return (
    <div>
       <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/editor/dashboard' element={<EditorDashboard />} />
                        <Route path='/youtuber/dashboard' element={<YoutuberDashboard />} />
                        <Route path='/forgot-password' element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                    </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App
