import React, { useRef, useEffect } from "react";
import "./HeroSlider.css";
import arrowLeft from "../img/arrow-left.svg";

const slides = [
  {
    name: "Artificial Intelligence",
    desc: "Unlock the future with AI — from automation to creativity, opportunities are limitless.",
    thumbnail: "https://plus.unsplash.com/premium_photo-1683121710572-7723bd2e235d?q=80&w=800",
    fullImage: "https://plus.unsplash.com/premium_photo-1683121710572-7723bd2e235d?q=80&w=1920",
  },
  {
    name: "Web3 & Blockchain",
    desc: "Decentralized apps, smart contracts, crypto economies — the next frontier.",
    thumbnail: "https://images.unsplash.com/photo-1639468611744-b5b48641e82f?q=80&w=800",
    fullImage: "https://images.unsplash.com/photo-1639468611744-b5b48641e82f?q=80&w=1920",
  },
  {
    name: "Cloud Infrastructure",
    desc: "Scale globally with cloud platforms, serverless, and distributed architecture.",
    thumbnail: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&q=40",
    fullImage: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1920&q=85",
  },
  {
    name: "Startup Innovation",
    desc: "Empower ideas, disruption, and growth with tech entrepreneurship.",
    thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800",
    fullImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1920",
  },
];

const HeroSlider = () => {
  const slideRef = useRef(null);

  const next = () => {
    const items = slideRef.current.querySelectorAll(".item");
    slideRef.current.appendChild(items[0]);
  };

  const prev = () => {
    const items = slideRef.current.querySelectorAll(".item");
    slideRef.current.prepend(items[items.length - 1]);
  };

  useEffect(() => {
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-slider-section">
      <div className="slide" ref={slideRef}>
        {slides.map((s, i) => (
          <div
            key={i}
            className="item container-fluid"
            style={{
              backgroundImage: `url(${i <= 1 ? s.fullImage : s.thumbnail})`,
            }}
          >
            <div className="overlay" />
            <div className="hero-content">
              <div className="content">
                <h2 className="name">{s.name}</h2>
                <p className="des">{s.desc}</p>
                <button>See More</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="button">
        <button onClick={prev}>
          <img src={arrowLeft} alt="Prev" />
        </button>
        <button onClick={next}>
          <img
            src={arrowLeft}
            alt="Next"
            style={{ transform: "rotate(180deg)" }}
          />
        </button>
      </div>
    </section>
  );
};

export default HeroSlider;
