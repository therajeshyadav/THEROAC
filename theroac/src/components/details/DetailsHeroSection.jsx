// src/components/DetailsHeroSection.jsx
import React from "react";

const DetailsHeroSection = ({ data }) => {
  if (!data) return null;

  return (
    <div className="hero-section-wrapper">
      <div
        className="hero-section"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <img
          src={
            data.image ||
            data.coverImage ||
            data.bannerImage ||
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop"
          }
          alt={data.title}
          className="hero-section-image"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <div className="hero-section-overlay"></div>
      </div>
    </div>
  );
};

export default DetailsHeroSection;
