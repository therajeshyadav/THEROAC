import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPageProtection from "./components/AuthPageProtection";
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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";
import VerificationPending from "./pages/VerificationPending";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// ✅ Helper component to handle smooth scrolling to hash IDs
function ScrollToHashElement() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      // Wait a moment for DOM to render
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100); // adjust delay if needed
    } else {
      // Optional: scroll to top when there's no hash
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return null;
}

function App() {
  const location = useLocation();

  // Auth pages and dashboard that don't need Header/Footer
  const authPages = ["/login", "/register", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/resend-verification", "/verification-pending"];
  const dashboardPages = [
    "/dashboard",
    "/candidate-dashboard",
    "/recruiter-dashboard",
    "/admin-dashboard",
  ];

  const isAuthPage = authPages.includes(location.pathname);
  const isDashboardPage = dashboardPages.includes(location.pathname);

  return (
    <AuthProvider>
      <ScrollToHashElement /> {/* ✅ enables smooth hash scrolling */}

      {!isAuthPage && !isDashboardPage && <Header />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<AuthPageProtection><Login /></AuthPageProtection>} />
          <Route path="/register" element={<AuthPageProtection><Register /></AuthPageProtection>} />
          <Route path="/signup" element={<AuthPageProtection><Signup /></AuthPageProtection>} />
          <Route path="/forgot-password" element={<AuthPageProtection><ForgotPassword /></AuthPageProtection>} />
          <Route path="/reset-password" element={<AuthPageProtection><ResetPassword /></AuthPageProtection>} />
          <Route path="/verify-email" element={<AuthPageProtection><VerifyEmail /></AuthPageProtection>} />
          <Route path="/resend-verification" element={<AuthPageProtection><ResendVerification /></AuthPageProtection>} />
          <Route path="/verification-pending" element={<AuthPageProtection><VerificationPending /></AuthPageProtection>} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate-dashboard"
            element={
              <ProtectedRoute requiredRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter-dashboard"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole={["admin", "superadmin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!isAuthPage && !isDashboardPage && <Footer />}
    </AuthProvider>
  );
}

export default App;
