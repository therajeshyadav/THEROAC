import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import GlobalBanHandler from "./components/GlobalBanHandler";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toast-custom.css';

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
import UnifiedDetailsPage from './pages/UnifiedDetailsPage';
import NotificationsPage from './pages/NotificationsPage';
import Callback from "./pages/OAuth2Callback";
import NotFound from './pages/NotFound';
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

  // Pages that don't need Header/Footer
  const authPages = ["/login", "/register", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/resend-verification", "/verification-pending"];
  const dashboardPages = [
    "/dashboard",
    "/candidate-dashboard",
    "/recruiter-dashboard",
    "/admin-dashboard"
  ];
  const validPages = ["/", "/speakers", "/schedule", "/blog", "/contact", ...authPages, ...dashboardPages];

  const isAuthPage = authPages.includes(location.pathname);
  const isDashboardPage = dashboardPages.includes(location.pathname);
  const isDetailPage = location.pathname.startsWith('/event-detail/');
  const isValidPage = validPages.includes(location.pathname) || isDetailPage;
  const showHeaderFooter = !isAuthPage && !isDashboardPage && !isDetailPage && isValidPage;

  return (
    <AuthProvider>
      <NotificationProvider>
        <GlobalBanHandler>
          <ToastContainer />
          <ScrollToHashElement />

      {showHeaderFooter && <Header />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path= "/oauth2callback" element={<Callback />} />
          {/* Public routes - redirect to dashboard if already logged in */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
          <Route path="/resend-verification" element={<PublicRoute><ResendVerification /></PublicRoute>} />
          <Route path="/verification-pending" element={<PublicRoute><VerificationPending /></PublicRoute>} />
          <Route path="/event-detail/:type/:slug" element={<UnifiedDetailsPage />} />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
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
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Catch-all route for 404 - must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

          {showHeaderFooter && <Footer />}
        </GlobalBanHandler>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
