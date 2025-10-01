import React from 'react';

const About = () => {
  return (
    <div className="about10-section-area sp1">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="about10-images">
              <img
                src="assets/img/all-images/others/author-img2.png"
                alt=""
                className="about-img10 aniamtion-key-1"
              />
              <div className="img1" data-aos="zoom-in" data-aos-duration="1000">
                <img src="assets/img/all-images/about/about-img7.png" alt="" />
              </div>
              <div className="img2" data-aos="zoom-in" data-aos-duration="1100">
                <img src="assets/img/all-images/about/about-img8.png" alt="" />
              </div>
              <div className="img3" data-aos="zoom-in" data-aos-duration="1200">
                <img src="assets/img/all-images/about/about-img9.png" alt="" />
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="about-header heading13">
              <h5 data-aos="fade-left" data-aos-duration="800">
                <img src="assets/img/icons/sub-logo1.svg" alt="" width={26}/> About Summit
              </h5>
              <div className="space18"></div>
              <h2 className="text-anime-style-3">
                What is the Technology Forum Conference?
              </h2>
              <div className="space18"></div>
              <p data-aos="fade-left" data-aos-duration="900">
                The Technology Forum Conference brings together thought leaders,
                innovators, and tech enthusiasts to discuss the latest developments
                in AI, cybersecurity, blockchain, cloud computing, and more. Dive
                into keynote presentations, hands-on workshops, and interactive
                panel discussions designed push the boundaries of what’s possible
                in the tech world.
              </p>
              <div className="space12"></div>
              <div
                className="counter-area"
                data-aos="fade-left"
                data-aos-duration="1000"
              >
                <div className="counter-box">
                  <h3>
                    <span className="odometer" data-count="250"></span>+
                  </h3>
                  <div className="space18"></div>
                  <p>Our Journalist</p>
                </div>

                <div className="counter-box">
                  <h3>
                    <span className="odometer" data-count="15"></span>+
                  </h3>
                  <div className="space18"></div>
                  <p>Our Speaker</p>
                </div>

                <div className="counter-box" style={{ border: "none" }}>
                  <h3>
                    <span className="odometer" data-count="7"></span>K+
                  </h3>
                  <div className="space18"></div>
                  <p>Attendees</p>
                </div>
              </div>
              <div className="space32"></div>
              <div
                className="btn-area1"
                data-aos="fade-left"
                data-aos-duration="1200"
              >
                <a href="/event-schedule" className="vl-btn10">
                  About Form <img src="assets/img/icons/arrow2.svg" alt="" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
