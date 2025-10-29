
const Header = () => {
  return (
    <header>
      <div className="header-area homepage10 header header-sticky d-none d-lg-block" id="header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12">
              <div className="header-elements d-flex justify-content-between align-items-center">

                {/* Logo */}
                <div className="site-logo">
                  <a href="/">
                    <img src="assets/img/logo/logo5.png" alt="Logo" />
                  </a>
                </div>

                {/* Main Menu */}
                <div className="main-menu">
                  <ul className="d-flex align-items-center m-0 p-0" style={{ listStyle: "none" }}>
                    <li><a href="/">Home</a></li>
                    <li>
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a href="#">
                        Events <i className="fa-solid fa-angle-down"></i>
                      </a>
                      <ul className="dropdown-padding">
                        <li><a href="/UpcomingEvents">Upcoming Events</a></li>
                        <li><a href="/PastEvents">Past Events</a></li>
                        <li><a href="/Workshops&Training">Workshops & Training</a></li>
                        <li><a href="/Hackathons&Competitions">Hackathons & Competitions</a></li>
                        <li><a href="/Conferences&Meetups">Conferences & Meetups</a></li>
                      </ul>
                    </li>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <li><a href="#Jobs">Jobs</a></li>
                    <li>
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a href="#">
                        Blogs <i className="fa-solid fa-angle-down"></i>
                      </a>
                      <ul className="dropdown-padding">
                        <li><a href="/blog">Our Blog</a></li>
                        <li><a href="/blog-single">Blog Details</a></li>
                      </ul>
                    </li>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <li><a href="#">Contact Us</a></li>
                  </ul>
                </div>

                {/* Right Login Buttons */}
                <div className="d-flex justify-content-end align-items-center">
                  <div className="btn-area1">
                    <a
                      href="/login"
                      style={{
                        color: "var(--ztc-text-text-2)",
                        fontFamily: "var(--ztc-family-font1)",
                        fontSize: "var(--ztc-font-size-font-s16)",
                        fontStyle: "normal",
                        fontWeight: "var(--ztc-weight-bold)",
                        lineHeight: "20px",
                        textTransform: "uppercase",
                        transition: "all 0.4s",
                        position: "relative",
                        zIndex: 1,
                        display: "inline-block",
                        borderRadius: "60px",
                        padding: "10px 15px",
                        background: "var(--ztc-bg-bg-14)",
                        overflow: "hidden",
                      }}
                    >
                      Login
                    </a>
                  </div>

                  <div className="ms-3 d-none d-xl-block">
                    <a
                      href="/signup?type=recruiter"
                      style={{
                        color: "var(--ztc-text-text-2)",
                        fontFamily: "var(--ztc-family-font1)",
                        fontSize: "var(--ztc-font-size-font-s16)",
                        fontStyle: "normal",
                        fontWeight: "var(--ztc-weight-bold)",
                        lineHeight: "20px",
                        textTransform: "uppercase",
                        transition: "all 0.4s",
                        position: "relative",
                        zIndex: 1,
                        display: "inline-block",
                        borderRadius: "60px",
                        padding: "10px 15px",
                        background: "var(--ztc-bg-bg-14)",
                        overflow: "hidden",
                      }}
                    >
                      Join as Recruiter
                    </a>
                  </div>
                </div>
              </div>

              <div className="body-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
