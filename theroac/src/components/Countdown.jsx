import React from 'react';

const Countdown = () => {
  return (
    <div className="others10-section-area">
			<div className="container">
				<div className="row">
					<div className="col-lg-6 m-auto">
						<div className="heading11 text-center space-margin80">
							<h5>countdown</h5>
							<div className="space28"></div>
							<h2 className="text-anime-style-3">Event Countdown</h2>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-lg-3 col-md-6">
						<div className="cta-counter-box">
							<img src="assets/img/elements/elements23.png" alt="" className="elements23 keyframe5" />
							<h2><span id="days" className="time-value">49</span></h2>
						</div>
						<div className="space50 d-lg-none d-block"></div>
					</div>
					<div className="col-lg-3 col-md-6">
						<div className="cta-counter-box">
							<img src="assets/img/elements/elements23.png" alt="" className="elements23 keyframe5" />
							<h2><span id="hours" className="time-value">49</span></h2>
						</div>
						<div className="space50 d-lg-none d-block"></div>
					</div>
					<div className="col-lg-3 col-md-6">
						<div className="cta-counter-box">
							<img src="assets/img/elements/elements23.png" alt="" className="elements23 keyframe5" />
							<h2><span id="minutes" className="time-value">49</span></h2>
						</div>
					</div>
					<div className="col-lg-3 col-md-6">
						<div className="cta-counter-box">
							<img src="assets/img/elements/elements23.png" alt="" className="elements23 keyframe5" />
							<h2><span id="seconds" className="time-value">49</span></h2>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-lg-12">
						<div className="space60"></div>
						<div className="btn-area1 text-center" data-aos="fade-left" data-aos-duration="1200">
							<a href="pricing-plan.html" className="vl-btn10">purchase Ticket Now <img src="assets/img/icons/arrow2.svg" alt="" /></a>
						</div>
					</div>
				</div>
			</div>
		</div>
  );
}

export default Countdown;
