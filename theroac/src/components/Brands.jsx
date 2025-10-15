import React from 'react';

const Brands = () => {
  return (
    <div className="brands10-section-area sp3">
      <div className="container">
        <div className="row">
          <div className="col-lg-5 m-auto">
            <div className="brand-header heading4 space-margin60 text-center">
              <h3>Our Vision Ecosystem</h3>
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
    </div>
  );
};

export default Brands;
