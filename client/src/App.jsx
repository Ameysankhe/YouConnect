import React, { useState, createContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import GetStarted from "./components/GetStarted";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import EditorDashboard from "./components/EditorDashboard";
import YoutuberDashboard from "./components/YoutuberDashboard";
import WorkspacePage from "./components/WorkspacePage";
import ContactForm from "./components/ContactForm";
import Pricing from "./components/Pricing";
import WhatsNew from "./components/WhatsNew";
import { WebSocketProvider } from "./context/WebSocketProvider";
import "sweetalert2/dist/sweetalert2.min.css";

export const AuthContext = createContext(null);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/getstarted" element={<GetStarted />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/whatsnew" element={<WhatsNew />} />

          {/* Protected Routes */}
          <Route
            path="/editor/dashboard"
            element={
              <WebSocketProvider>
                <EditorDashboard />
              </WebSocketProvider>
            }
          />
          <Route
            path="/youtuber/dashboard"
            element={
              <WebSocketProvider>
                <YoutuberDashboard />
              </WebSocketProvider>
            }
          />
          <Route
            path="/workspace/:id"
            element={
              <WebSocketProvider>
                <WorkspacePage />
              </WebSocketProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
