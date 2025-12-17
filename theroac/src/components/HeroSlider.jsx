import React, { useRef, useEffect } from "react";
import "./HeroSlider.css";
import arrowLeft from "../img/arrow-left.svg";
const slides = [
  {
    name: "Artificial Intelligence",
    desc: "Unlock the future with AI — from automation to creativity, opportunities are limitless.",
    thumbnail:
      "https://plus.unsplash.com/premium_photo-1683121710572-7723bd2e235d?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    fullImage:
      "https://plus.unsplash.com/premium_photo-1683121710572-7723bd2e235d?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Web3 & Blockchain",
    desc: "Decentralized apps, smart contracts, crypto economies — the next frontier.",
    thumbnail:
      "https://images.unsplash.com/photo-1639468611744-b5b48641e82f?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    fullImage:
      "https://images.unsplash.com/photo-1639468611744-b5b48641e82f?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Cloud Infrastructure",
    desc: "Scale globally with cloud platforms, serverless, and distributed architecture.",
    thumbnail:
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&q=40",
    fullImage:
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1920&q=85",
  },
  // {
  //   name: "Cybersecurity",
  //   desc: "Protect systems, data, and privacy in a connected world full of threats.",
  //   thumbnail:
  //     "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=500&q=40",
  //   fullImage:
  //     "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1920&q=85",
  // },
  {
    name: "Startup Innovation",
    desc: "Empower ideas, disruption, and growth with tech entrepreneurship.",
    thumbnail:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    fullImage:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const HeroSlider = () => {
  const slideRef = useRef(null);

  const handleNext = () => {
    if (slideRef.current) {
      const items = slideRef.current.querySelectorAll(".item");
      slideRef.current.appendChild(items[0]);
    }
  };

  const handlePrev = () => {
    if (slideRef.current) {
      const items = slideRef.current.querySelectorAll(".item");
      slideRef.current.prepend(items[items.length - 1]);
    }
  };

  // Auto-slide every 4 sec
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-slider-section">
      <div className="slide" ref={slideRef}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className="item"
            style={{
              backgroundImage: `url(${
                index <= 1 ? slide.fullImage : slide.thumbnail
              })`,
            }}
          >
            <div>
              <div className="overlay"></div>
            </div>
            <div className="content">
              <div className="name">{slide.name}</div>
              <div className="des">{slide.desc}</div>
              <a
                className="seeMore"
                target="_blank"
                rel="noopener noreferrer"
                href="#"
              >
                <button>See More</button>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="button">
        <button className="prev" onClick={handlePrev}>
          <img src={arrowLeft} alt="" />
        </button>
        <button className="next" onClick={handleNext}>
          <img src={arrowLeft} alt="" style={{ transform: "rotate(180deg)" }} />
        </button>
      </div>
    </div>
  );
};

export default HeroSlider;
