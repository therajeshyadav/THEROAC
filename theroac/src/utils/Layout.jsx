import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const { user, isAuthenticated, logout } = useAuth();
  
  const toggleSubMenu = (menu) => {
    setOpenSubMenu((prev) => (prev === menu ? null : menu));
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const getDashboardUrl = () => {
    if (!user) return "/login";
    
    switch (user.role) {
      case "admin":
        return "/admin-dashboard";
      case "recruiter":
        return "/recruiter-dashboard";
      case "candidate":
      default:
        return "/candidate-dashboard";
    }
  };

  return (
    <>
      {/* ===== Mobile Header ===== */}
      <div className="mobile-header mobile-haeder10 d-block d-lg-none">
        <div className="container-fluid">
          <div className="col-12">
            <div className="mobile-header-elements">
              <div className="mobile-logo">
                <a href="/">
                  <img src="assets/img/logo/logo5.png" alt="logo" />
                </a>
              </div>
              <div
                className="mobile-nav-icon dots-menu"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <i className="fa-solid fa-xmark"></i>
                ) : (
                  <i className="fa-solid fa-bars-staggered"></i>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Mobile Sidebar ===== */}
      {menuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}
      <div
        className={`mobile-sidebar mobile-sidebar10 ${
          menuOpen ? "mobile-menu-active" : ""
        }`}
      >
        <div className="logosicon-area">
          <div className="logos">
            <img src="assets/img/logo/logo5.png" alt="" />
          </div>
          <div className="menu-close" onClick={() => setMenuOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>

        <div className="mobile-nav mobile-nav1">
          <ul className="mobile-nav-list nav-list1">
            <li>
              <a href="/" onClick={() => setMenuOpen(false)}>
                Home
              </a>
            </li>
            <li>
              <a href="/discover" onClick={() => setMenuOpen(false)}>
                Discover
              </a>
            </li>
            <li>
              <a href="/about" onClick={() => setMenuOpen(false)}>
                About
              </a>
            </li>
            <li className={`has-sub ${openSubMenu === "events" ? "open" : ""}`}>
              <div
                className="submenu-button"
                onClick={() => toggleSubMenu("events")}
              >
                Events
              </div>
              <ul className="sub-menu">
                <li>
                  <a href="/speakers" onClick={() => setMenuOpen(false)}>
                    All Events
                  </a>
                </li>
                <li>
                  <a href="/UpcomingEvents" onClick={() => setMenuOpen(false)}>
                    Upcoming Events
                  </a>
                </li>
                <li>
                  <a href="/PastEvents" onClick={() => setMenuOpen(false)}>
                    Past Events
                  </a>
                </li>
                <li>
                  <a
                    href="/Workshops&Training"
                    onClick={() => setMenuOpen(false)}
                  >
                    Workshops & Training
                  </a>
                </li>
                <li>
                  <a
                    href="/Hackathons&Competitions"
                    onClick={() => setMenuOpen(false)}
                  >
                    Hackathons & Competitions
                  </a>
                </li>
                <li>
                  <a
                    href="/Conferences&Meetups"
                    onClick={() => setMenuOpen(false)}
                  >
                    Conferences & Meetups
                  </a>
                </li>
              </ul>
            </li>
            <li className={`has-sub ${openSubMenu === "courses" ? "open" : ""}`}>
              <div
                className="submenu-button"
                onClick={() => toggleSubMenu("courses")}
              >
                Courses
              </div>
              <ul className="sub-menu">
                <li>
                  <a href="/quiz" onClick={() => setMenuOpen(false)}>
                   Quiz
                  </a>
                </li>
                <li>
                  <a href="/blog-single" onClick={() => setMenuOpen(false)}>
                   UpComming Courses
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a href="/contact" onClick={() => setMenuOpen(false)}>
                Contact
              </a>
            </li>
          </ul>
          
          {/* Conditional Buttons Based on Authentication */}
          <div className="allmobilesection">
            {isAuthenticated ? (
              // Logged in user - Show Dashboard and Logout
              <>
                <a className="vl-btn10 dashboard-btn" href={getDashboardUrl()}>
                  <span className="demo">
                    Dashboard <i className="fa-solid fa-tachometer-alt"></i>
                  </span>
                </a>
                <div className="space16"></div>
                <button className="vl-btn10 logout-btn" onClick={handleLogout}>
                  <span className="demo">
                    Logout <i className="fa-solid fa-sign-out-alt"></i>
                  </span>
                </button>
              </>
            ) : (
              // Not logged in - Show Login and Signup
              <>
                <a className="vl-btn10 login-btn" href="/login">
                  <span className="demo">
                    Login <i className="fa-solid fa-sign-in-alt"></i>
                  </span>
                </a>
                <div className="space16"></div>
                <a className="vl-btn10 signup-btn" href="/register">
                  <span className="demo">
                    Signup as Recruiter <img src="assets/img/icons/arrow2.svg" alt="" />
                  </span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== Page Content ===== */}
      {children}
    </>
  );
};

export default Layout;
