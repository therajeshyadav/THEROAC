import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createJobURL, createEventURL, createHubContentURL } from "../utils/urlUtils";
import "./EventSlider.css";
import arrowLeft from "../img/arrow-left.svg";

const EventSlider = ({ eventsData }) => {
  const scrollRefs = useRef([]);
  const navigate = useNavigate();

  const scroll = (index, direction) => {
    const container = scrollRefs.current[index];
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleApplyNow = (event, sectionTitle) => {
    // Determine the type based on section title and event data
    let type = 'jobs'; // default
    let url = '';

    if (sectionTitle.toLowerCase().includes('event')) {
      type = 'events';
    } else if (sectionTitle.toLowerCase().includes('roac') || sectionTitle.toLowerCase().includes('talent')) {
      type = 'internships';
    } else if (sectionTitle.toLowerCase().includes('job')) {
      type = 'jobs';
    }

    // If event has a type property, use that
    if (event.type) {
      if (event.type === 'job') type = 'jobs';
      else if (event.type === 'event') type = 'events';
      else if (event.type === 'hub-content') type = 'internships';
    }

    // Generate SEO-friendly URL based on type
    try {
      if (type === 'jobs' && event.data) {
        url = createJobURL(event.data);
      } else if (type === 'events' && event.data) {
        url = createEventURL(event.data);
      } else if (type === 'internships' && event.data) {
        url = createHubContentURL(event.data);
      } else {
        // Fallback for cases where we don't have proper data structure
        const id = event.data?.id || '1';
        url = `/event-detail/${type}/${id}`;
      }
      
      navigate(url);
    } catch (error) {
      // Fallback to ID-based URL
      const id = event.data?.id || '1';
      url = `/event-detail/${type}/${id}`;
      navigate(url);
    }
  };

  // Add safety check for eventsData
  if (!eventsData || !Array.isArray(eventsData)) {
    return (
      <div className="event-sections-wrapper">
        <div className="text-center text-white">
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-sections-wrapper">
      {eventsData.map((section, sectionIndex) => (
        <div className="prime-carousel-container" key={sectionIndex} id={section.titleId}>
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
            {(section.events || []).map((event, index) => (
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
                  <button 
                    className="buy-btn"
                    onClick={() => handleApplyNow(event, section.title)}
                  >
                    Apply Now →
                  </button>
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
