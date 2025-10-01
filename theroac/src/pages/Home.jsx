import React from 'react';
import Header from '../components/Header';
import Brands from '../components/Brands';
import Hero from '../components/Hero';
import About from '../components/About';
import WhyAttend from '../components/WhyAttend';
import Schedule from '../components/Schedule';
import Countdown from '../components/Countdown';
import ContactSection from '../components/ContactSection';

const Home = () => {
  return (
    <>
      {/* ===== Popup Section ===== */}
      <div id="popup" className="popup-overlay d-none">
        <div className="popup-content">
          <span className="close-btn" id="close-popup">&times;</span>
          <div className="popup-icon">
            <img src="assets/img/logo/popup-logo.png" alt="" />
          </div>
          <div className="space32"></div>
          <div className="heading2">
            <h2>Grow your business with our agency</h2>
            <div className="space8"></div>
            <ul>
              <li><img src="assets/img/icons/check3.svg" alt="" /> Elevate User Experience Expertise</li>
              <li><img src="assets/img/icons/check3.svg" alt="" /> Elevate Your UI/UX Skills Designer</li>
              <li><img src="assets/img/icons/check3.svg" alt="" /> Join Leading UI/UX Event the Year</li>
            </ul>
          </div>
          <div className="space50"></div>
          <a className="vl-btn2" href="/contact">
            <span className="demo">Buy Ticket Now</span>
            <span className="arrow"><i className="fa-solid fa-arrow-right"></i></span>
          </a>
          <p className="no-thanks">No thanks</p>
        </div>
      </div>

      {/* ===== Preloader ===== */}
      <div className="preloader">
        <div className="loading-container">
          <div className="loading"></div>
          <div id="loading-icon">
            <img src="assets/img/logo/preloader.png" alt="" />
          </div>
        </div>
      </div>

      {/* ===== Page Progress ===== */}
      <div className="paginacontainer">
        <div className="progress-wrap warp2">
          <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
          </svg>
        </div>
      </div>

      {/* ===== Header ===== */}
      <Header />

      {/* ===== Mobile Header ===== */}
      <div className="mobile-header mobile-haeder10 d-block d-lg-none">
        <div className="container-fluid">
          <div className="col-12">
            <div className="mobile-header-elements">
              <div className="mobile-logo">
                <a href="/"><img src="assets/img/logo/logo5.png" alt="" /></a>
              </div>
              <div className="mobile-nav-icon dots-menu">
                <i className="fa-solid fa-bars-staggered"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Mobile Sidebar ===== */}
      <div className="mobile-sidebar mobile-sidebar10">
        <div className="logosicon-area">
          <div className="logos">
            <img src="assets/img/logo/logo5.png" alt="" />
          </div>
          <div className="menu-close">
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>
        <div className="mobile-nav mobile-nav1">
          <ul className="mobile-nav-list nav-list1">
            <li>
              <a href="#">Home</a>
              {/* <ul className="sub-menu">
                <li><a href="/">Home One</a></li>
                <li><a href="/index2">Home Two</a></li>
                <li><a href="/index3">Home Three</a></li>
              </ul> */}
            </li>
            <li><a href="/about">About</a></li>
            <li>
              <a href="/speakers">Events</a>
              <ul className="sub-menu">
                <li><a href="/UpcomingEvents">Upcoming Events</a></li>
                <li><a href="/PastEvents">Past Events</a></li>
                <li><a href="/Workshops&Training">Workshops & Training</a></li>
                <li><a href="/Hackathons&Competitions">Hackathons & Competitions</a></li>
                <li><a href="/Conferences&Meetups">Conferences & Meetups</a></li>
              </ul>
            </li>
            <li>
              <a href="/Jobs">Jobs</a>
              {/* <ul className="sub-menu">
                <li><a href="/event">Our Event</a></li>
                <li><a href="/event-schedule">Event Schedule</a></li>
                <li><a href="/event-single">Event Details</a></li>
              </ul> */}
            </li>
            <li>
              <a href="/blog">Blogs</a>
              <ul className="sub-menu">
                <li><a href="/blog">Our Blog</a></li>
                <li><a href="/blog-single">Blog Details</a></li>
              </ul>
            </li>
            {/* <li>
              <a href="#">Pages</a>
              <ul className="sub-menu">
                <li><a href="/memories">Our Memories</a></li>
                <li><a href="/pricing-plan">Pricing Plan</a></li>
                <li><a href="/faq">FAQ’s</a></li>
                <li><a href="/contact">Contact Us</a></li>
              </ul>
            </li> */}
            <li><a href="/contact">Contact Us</a></li>
          </ul>

          {/* ===== Contact Info in Sidebar ===== */}
          <div className="allmobilesection">
            <a className="vl-btn10" href="/contact">
              <span className="demo">
                Contact Us <img src="assets/img/icons/arrow2.svg" alt="" />
              </span>
            </a>
            <div className="single-footer">
              <h3>Contact Info</h3>
              <div className="footer1-contact-info">
                <div className="contact-info-single">
                  <div className="contact-info-icon">
                    <span><i className="fa-solid fa-phone-volume"></i></span>
                  </div>
                  <div className="contact-info-text">
                    <a href="tel:+917973977956">+91 7973977956</a>
                  </div>
                </div>
                <div className="contact-info-single">
                  <div className="contact-info-icon">
                    <span><i className="fa-solid fa-envelope"></i></span>
                  </div>
                  <div className="contact-info-text">
                    <a href="mailto:partnership@theroac.com">partnership@theroac.com</a>
                  </div>
                </div>
                <div className="single-footer">
                  <h3>Our Location</h3>
                  <div className="contact-info-single">
                    <div className="contact-info-icon">
                      <span><i className="fa-solid fa-location-dot"></i></span>
                    </div>
                    <div className="contact-info-text">
                      <a href="#">Chandigarh</a>Chandigarh
                    </div>
                  </div>
                </div>
                <div className="single-footer">
                  <h3>Social Links</h3>
                  <div className="social-links-mobile-menu">
                    <ul>
                      <li><a href="#"><i className="fa-brands fa-facebook-f"></i></a></li>
                      <li><a href="#"><i className="fa-brands fa-instagram"></i></a></li>
                      <li><a href="#"><i className="fa-brands fa-linkedin-in"></i></a></li>
                      <li><a href="#"><i className="fa-brands fa-youtube"></i></a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Hero />
      <About />
      <WhyAttend />
      <Schedule />
      <Countdown />
      <ContactSection />
      <Brands />
    </>
  );
};

export default Home;
