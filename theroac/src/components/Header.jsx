import React from 'react';

const Header = () => {
  return (
    <header>
      <div className="header-area homepage10 header header-sticky d-none d-lg-block" id="header">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="header-elements">
                {/* Logo */}
                <div className="site-logo">
                  <a href="/"><img src="assets/img/logo/logo5.png" alt="Logo" /></a>
                </div>

                {/* Main Menu */}
                <div className="main-menu">
                  <ul>
                    <li>
                      <a href="/">
                        Home
                      </a>
                    </li>
                    <li><a href="/about">About</a></li>
                    <li>
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
                    <li>
                      <a href="#">
                        Jobs
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        Blogs <i className="fa-solid fa-angle-down"></i>
                      </a>
                      <ul className="dropdown-padding">
                        <li><a href="/blog">Our Blog</a></li>
                        <li><a href="/blog-single">Blog Details</a></li>
                      </ul>
                    </li>
                    <li>
                      <a href="#">
                        Contact Us
                      </a>
                      {/* <ul className="dropdown-padding">
                        <li><a href="/memories">Our Memories</a></li>
                        <li><a href="/pricing-plan">Pricing Plan</a></li>
                        <li><a href="/faq">FAQ’s</a></li>
                        <li><a href="/contact">Contact Us</a></li>
                      </ul> */}
                    </li>
                  </ul>
                </div>

                {/* Right Icons */}
                <div className="btn-area">
                  <div className="search-icon header__search header-search-btn">
                    <a href="#"><img src="assets/img/icons/search1.svg" alt="Search" /></a>
                  </div>
                  <ul>
                    <li><a href="#"><i className="fa-brands fa-facebook-f"></i></a></li>
                    <li><a href="#"><i className="fa-brands fa-instagram"></i></a></li>
                    <li><a href="#"><i className="fa-brands fa-linkedin-in"></i></a></li>
                    {/* <li><a href="#" className="m-0"><i className="fa-brands fa-pinterest-p"></i></a></li> */}
                  </ul>
                </div>

                {/* Search Form */}
                <div className="header-search-form-wrapper">
                  <div className="tx-search-close tx-close">
                    <i className="fa-solid fa-xmark"></i>
                  </div>
                  <div className="header-search-container">
                    <form role="search" className="search-form">
                      <input
                        type="search"
                        className="search-field"
                        placeholder="Search …"
                        defaultValue=""
                        name="s"
                      />
                      <button type="submit" className="search-submit">
                        <img src="assets/img/icons/search1.svg" alt="search" />
                      </button>
                    </form>
                  </div>
                </div>
                <div className="body-overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
