import React, { useRef } from "react";
import "./EventSlider.css";
import arrowLeft from "../img/arrow-left.svg";

const EventSlider = ({ eventsData }) => {
  const scrollRefs = useRef([]);

  const scroll = (index, direction) => {
    const container = scrollRefs.current[index];
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="event-sections-wrapper">
      {eventsData.map((section, sectionIndex) => (
        <div className="prime-carousel-container" key={sectionIndex}>
          {/* Section Heading */}
          <div className="heading13 h2 pb-3 text-white">{section.title}</div>

          {/* Left Scroll Button */}
          <button
            className="Event-btn left"
            onClick={() => scroll(sectionIndex, "left")}
            aria-label="Scroll Left"
          >
            <img src={arrowLeft} alt="Scroll Left" />
          </button>

          {/* Carousel */}
          <div
            className="prime-carousel"
            ref={(el) => (scrollRefs.current[sectionIndex] = el)}
          >
            {section.events.map((event, index) => (
              <div className="prime-card" key={index}>
                <div className="image-anime prime-img-wrapper">
                  <img src={event.img} alt={event.title} className="prime-img" />
                </div>
                <div className="prime-card-content">
                  <h3>{event.title}</h3>
                  <p>
                    <img
                      src="assets/img/icons/clock1.svg"
                      alt="Time"
                      className="icon"
                    />
                    {event.time}
                  </p>
                  <p>
                    <img
                      src="assets/img/icons/location1.svg"
                      alt="Location"
                      className="icon"
                    />
                    {event.location}
                  </p>
                  <a href="#" className="buy-btn">
                    Buy Tickets Now →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button
            className="Event-btn right"
            onClick={() => scroll(sectionIndex, "right")}
            aria-label="Scroll Right"
          >
            <img
              src={arrowLeft}
              alt="Scroll Right"
              style={{ transform: "rotate(180deg)" }}
            />
          </button>
        </div>
      ))}
    </div>
  );
};

export default EventSlider;
