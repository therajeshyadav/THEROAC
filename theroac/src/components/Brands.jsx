import React from 'react';

const Brands = () => {
  return (
    <div className="brands10-section-area sp8">
      <div className="container">
        <div className="row">
          <div className="col-lg-5 m-auto">
            <div className="brand-header heading4 space-margin60 text-center">
              <h3>Join 4,000+ companies already growing</h3>
            </div>
          </div>
        </div>
        <div className="row">
          <div
            className="col-lg-12"
            data-aos="zoom-in"
            data-aos-duration="800"
          >
            <div className="brand-slider-area owl-carousel">
              {Array.from({ length: 8 }, (_, i) => (
                <div className="brand-box" key={i}>
                  <img
                    src={`assets/img/elements/brand-img${i + 1}.png`}
                    alt={`Brand ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space60"></div>

      {/* ===== Contact Info Section ===== */}
      <div className="contact10-bg-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="space48"></div>
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <div
                    className="contact-boxarea"
                    data-aos="zoom-in"
                    data-aos-duration="900"
                  >
                    <div className="icons">
                      <img src="assets/img/icons/mail1.svg" alt="mail" />
                    </div>
                    <div className="text">
                      <h5>Our Email</h5>
                      <div className="space14"></div>
                      <a href="mailto:partnership@theroac.com">partnership@theroac.com</a>
                    </div>
                  </div>
                  <div className="space18"></div>
                  <div
                    className="contact-boxarea"
                    data-aos="zoom-in"
                    data-aos-duration="1000"
                  >
                    <div className="icons">
                      <img src="assets/img/icons/location1.svg" alt="location" />
                    </div>
                    <div className="text">
                      <h5>Our Location</h5>
                      <div className="space14"></div>
                      <a href="#">1800 Abbot Kinney</a>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6">
                  <div className="space20 d-md-none d-block"></div>
                  <div
                    className="contact-boxarea"
                    data-aos="zoom-in"
                    data-aos-duration="1000"
                  >
                    <div className="icons">
                      <img src="assets/img/icons/phn1.svg" alt="phone" />
                    </div>
                    <div className="text">
                      <h5>Call/Message</h5>
                      <div className="space14"></div>
                      <a href="tel:+917973977956">+91 7973977956</a>
                    </div>
                  </div>
                  <div className="space18"></div>
                  <div
                    className="contact-boxarea"
                    data-aos="zoom-in"
                    data-aos-duration="1200"
                  >
                    <div className="icons">
                      <img src="assets/img/icons/instagram.svg" alt="instagram" />
                    </div>
                    <div className="text">
                      <h5>Instagram</h5>
                      <div className="space14"></div>
                      <a href="#">eneventify.eve</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space48"></div>
            </div>
          </div>
        </div>

        {/* ===== Google Map Embed ===== */}
        <div className="mapouter">
          <div className="gmap_canvas">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d4506257.120552435!2d88.67021924228865!3d21.954385721237916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1704088968016!5m2!1sen!2sbd"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Eventify Map"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brands;
