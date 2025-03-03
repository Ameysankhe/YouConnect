import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from './components/Home';
import GetStarted from './components/GetStarted';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import EditorDashboard from './components/EditorDashboard';
import YoutuberDashboard from './components/YoutuberDashboard';
import WorkspacePage from './components/WorkspacePage'; 
import ContactForm from './components/ContactForm'

const App = () => {
  return (
    <div>
       <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/getstarted' element={<GetStarted />} />
                        <Route path='/forgot-password' element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path='/editor/dashboard' element={<EditorDashboard />} />
                        <Route path='/youtuber/dashboard' element={<YoutuberDashboard />} />
                        <Route path="/workspace/:id" element={<WorkspacePage />} />
                        <Route path="/contact" element={<ContactForm />} />
                    </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App;
