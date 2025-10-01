import React from "react";

// const CircleText = ({ text, radius = 50 }) => {
//   const chars = text.split("");
//   const angleStep = 360 / chars.length;

//   return (
//     <h6 className="circle rotateme">
//       {chars.map((char, i) => (
//         <span
//           key={i}
//           style={{
//             position: "absolute",
//             left: "50%",
//             top: "50%",
//             transformOrigin: `0 ${radius}px`,
//             // rotate into position, push outward, then counter-rotate so letters stay upright
//             transform: `rotate(${i * angleStep}deg) translateY(-${radius}px) rotate(${-i * angleStep}deg)`,
//           }}
//         >
//           {char}
//         </span>
//       ))}
//     </h6>
//   );
// };

const Hero = () => {
  return (
    <div
      className="hero10-section-area"
      style={{
        backgroundImage: "url('assets/img/bg/header-bg23.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      <div className="container">
        <div className="row align-items-center">
          {/* Left content */}
          <div className="col-lg-7">
            <div className="hero6-header">
              <h5>
                <img
                  src="assets/img/icons/sub-logo1.svg"
                  alt=""
                  width={26}
                />{" "}
                12th Technology Forum Conference
              </h5>
              <div className="space24"></div>
              <h1 className="text-anime-style-3">Technology</h1>
              <h1 className="text-anime-style-3">
                <span>Forum “2025”</span>
              </h1>
              <div className="space32"></div>
              <p>
                Explore cutting-edge innovations, network{" "}
                <br className="d-lg-block d-none" />
                with industry leaders and gain insight.
              </p>
              <div className="space16"></div>
              <ul>
                <li>
                  <a href="#">
                    <img
                      src="assets/img/icons/calender1.svg"
                      alt=""
                    />{" "}
                    15th, 16th, & 17th January “2025”
                  </a>
                </li>
              </ul>
              <div className="space32"></div>
              <div className="btn-area1">
                <a href="/contact" className="vl-btn10">
                  Register now{" "}
                  <img
                    src="assets/img/icons/arrow2.svg"
                    alt=""
                  />
                </a>
              </div>
              {/* <div className="arrow-btn">
                <div className="content">
                  <CircleText text="Build Success Brand ." />
                </div>
                <div className="arrow">
                  <img
                    src="assets/img/icons/arrow2.svg"
                    alt=""
                  />
                </div>
              </div> */}
            </div>
          </div>

          {/* Right images */}
          <div className="col-lg-5">
            <div className="hero10-images">
              <div className="img1">
                <img
                  src="assets/img/all-images/hero/hero-img12.png"
                  alt=""
                />
              </div>
              <div className="img2">
                <img
                  src="assets/img/all-images/hero/hero-img13.png"
                  alt=""
                />
              </div>
              <div className="img3">
                <img
                  src="assets/img/all-images/hero/hero-img14.png"
                  alt=""
                />
              </div>
              <div className="img4">
                <img
                  src="assets/img/all-images/hero/hero-img15.png"
                  alt=""
                />
              </div>
              <img
                src="assets/img/elements/elements38.png"
                alt=""
                className="elements38 keyframe5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
