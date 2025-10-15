import React, { useEffect, useRef } from "react";
import "./AboutSlider.css";
import arrowLeft from "../img/arrow-left.svg";

const AboutSlider = () => {
  const trackRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  // const dotsBoxRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const wrap = track.parentElement;
    const cards = Array.from(track.children);
    const prev = prevRef.current;
    const next = nextRef.current;
    // const dotsBox = dotsBoxRef.current;

    const isMobile = () => matchMedia("(max-width:767px)").matches;

    // Create dots
    // dotsBox.innerHTML = "";
    cards.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.onclick = () => activate(i, true);
      // dotsBox.appendChild(dot);
    });
    // const dots = Array.from(dotsBox.children);

    let current = 0;

    function center(i) {
      const card = cards[i];
      const axis = isMobile() ? "top" : "left";
      const size = isMobile() ? "clientHeight" : "clientWidth";
      const start = isMobile() ? card.offsetTop : card.offsetLeft;
      wrap.scrollTo({
        [axis]: start - (wrap[size] / 2 - card[size] / 2),
        behavior: "smooth",
      });
    }

    function toggleUI(i) {
      cards.forEach((c, k) => {
        if (k === i) {
          c.setAttribute("active", "");
        } else {
          c.removeAttribute("active");
        }
      });
      // dots.forEach((d, k) => {
      //   d.classList.toggle("active", k === i);
      // });
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === cards.length - 1;
    }

    function activate(i, scroll) {
      if (i === current) return;
      current = i;
      toggleUI(i);
      if (scroll) center(i);
    }

    function go(step) {
      const target = Math.min(Math.max(current + step, 0), cards.length - 1);
      activate(target, true);
    }

    if (prev) prev.onclick = () => go(-1);
    if (next) next.onclick = () => go(1);

    window.addEventListener("keydown", handleKeydown, { passive: true });
    function handleKeydown(e) {
      if (["ArrowRight", "ArrowDown"].includes(e.key)) go(1);
      if (["ArrowLeft", "ArrowUp"].includes(e.key)) go(-1);
    }

    cards.forEach((card, i) => {
      card.addEventListener("mouseenter", () => {
        if (matchMedia("(hover:hover)").matches) activate(i, true);
      });
      card.addEventListener("click", () => activate(i, true));
    });

    let sx = 0,
      sy = 0;
    track.addEventListener(
      "touchstart",
      (e) => {
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
      },
      { passive: true }
    );
    track.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        if (isMobile() ? Math.abs(dy) > 60 : Math.abs(dx) > 60) {
          go((isMobile() ? dy : dx) > 0 ? -1 : 1);
        }
      },
      { passive: true }
    );

    // if (window.matchMedia("(max-width:767px)").matches) {
    //   dotsBox.hidden = true;
    // }

    window.addEventListener("resize", () => center(current));

    // initialize
    toggleUI(0);
    center(0);

    // cleanup
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("resize", () => center(current));
      // (You might also remove other listeners if needed)
    };
  }, []);

  return (
    <section className="container">
      <div className="head">
        <h2>Discover the Opportunities</h2>
        <div className="controls">
          <button ref={prevRef} className="nav-btn" aria-label="Prev">
            <img src={arrowLeft} alt="" />
          </button>
          <button ref={nextRef} className="nav-btn" aria-label="Next">
            <img src={arrowLeft} alt="" style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </div>
      <div className="slider">
        <div className="track" ref={trackRef} id="track">
          {/* Competitions */}
          <article className="project-card">
            <img
              className="project-card__bg"
              src="https://img.freepik.com/free-photo/young-people-office-competitions-concept_23-2149367244.jpg?w=1380"
              alt="Competitions"
            />
            <div className="project-card__content">
              <div>
                <h3 className="project-card__title">Competitions</h3>
                <p className="project-card__desc">
                  Participate. Compete. Showcase your talent on the grand stage.
                </p>
                <button className="project-card__btn">Explore</button>
              </div>
            </div>
          </article>

          {/* Jobs */}
          <article className="project-card">
            <img
              className="project-card__bg"
              src="https://img.freepik.com/free-photo/modern-office-with-people-working_23-2149270910.jpg?w=1380"
              alt="Jobs"
            />
            <div className="project-card__content">
              <div>
                <h3 className="project-card__title">Jobs</h3>
                <p className="project-card__desc">
                  Find career opportunities that match your skills and passion.
                </p>
                <button className="project-card__btn">View Jobs</button>
              </div>
            </div>
          </article>

          {/* Workshops */}
          <article className="project-card">
            <img
              className="project-card__bg"
              src="https://img.freepik.com/free-photo/group-people-working-together_53876-13811.jpg?w=1380"
              alt="Workshops"
            />
            <div className="project-card__content">
              <div>
                <h3 className="project-card__title">Workshops</h3>
                <p className="project-card__desc">
                  Learn from industry experts through live sessions and hands-on activities.
                </p>
                <button className="project-card__btn">Join Now</button>
              </div>
            </div>
          </article>

          {/* Scholarships */}
          <article className="project-card">
            <img
              className="project-card__bg"
              src="https://img.freepik.com/free-photo/education-graduation-concept_53876-123111.jpg?w=1380"
              alt="Scholarships"
            />
            <div className="project-card__content">
              <div>
                <h3 className="project-card__title">Scholarships</h3>
                <p className="project-card__desc">
                  Access funding and support to take your academic journey further.
                </p>
                <button className="project-card__btn">Apply</button>
              </div>
            </div>
          </article>

          {/* ROAC Talent Prime Hub */}
          <article className="project-card">
            <img
              className="project-card__bg"
              src="https://img.freepik.com/free-photo/team-analyzing-data_53876-13819.jpg?w=1380"
              alt="ROAC Talent Prime Hub"
            />
            <div className="project-card__content">
              <div>
                <h3 className="project-card__title">ROAC Talent Prime Hub</h3>
                <p className="project-card__desc">
                  Your central platform to connect, grow, and unlock exclusive Roac experiences.
                </p>
                <button className="project-card__btn">Discover</button>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* <div className="dots" id="dots" ref={dotsBoxRef}></div> */}
    </section>
  );
};

export default AboutSlider;
