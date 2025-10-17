import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Speakers from "./pages/Speakers";
import Schedule from "./pages/Schedule";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Signup from "./pages/Signup";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";


function App() {
  const location = useLocation();

  // Auth pages and dashboard that don't need Header/Footer
  const authPages = ["/login", "/register", "/signup"];
  const dashboardPages = ["/dashboard", "/candidate-dashboard", "/recruiter-dashboard"];
  const isAuthPage = authPages.includes(location.pathname);
  const isDashboardPage = dashboardPages.includes(location.pathname);

  return (
    <AuthProvider>
      {!isAuthPage && !isDashboardPage && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <CandidateDashboard />
            </ProtectedRoute>
          } />
          <Route path="/candidate-dashboard" element={
            <ProtectedRoute requiredRole="candidate">
              <CandidateDashboard />
            </ProtectedRoute>
          } />
          <Route path="/recruiter-dashboard" element={
            <ProtectedRoute requiredRole="recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!isAuthPage && !isDashboardPage && <Footer />}
    </AuthProvider>
  );
}

export default App;
