import React from 'react';

const Footer = () => {
  return (
    <div className="footer10-sertion-area">
			<div className="container">
				<div className="row">
					<div className="col-lg-6 col-md-6">
						<div className="footer-logo-area">
							<img src="assets/img/logo/logo5.png" alt="" />
							<div className="space16"></div>
							<p>We are committed to creating a platform where business leaders, innovators, and professionals can come together to exchange ideas</p>
							<div className="space24"></div>
							<ul>
								<li>
									<a href="#"><i className="fa-brands fa-facebook-f"></i></a>
								</li>
								<li>
									<a href="#"><i className="fa-brands fa-instagram"></i></a>
								</li>
								<li>
									<a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
								</li>
								<li>
									<a href="#" className="m-0"><i className="fa-brands fa-pinterest-p"></i></a>
								</li>
							</ul>
						</div>
					</div>
					<div className="col-lg-6 col-md-6">
						<div className="link-content2">
							<h3>Contact Us</h3>
							<ul>
								<li>
									<a href="tel:+917973977956"><img src="assets/img/icons/phn1.svg" alt="" />++91 62396 49779</a>
								</li>
								<li>
									<a href="#"><img src="assets/img/icons/location1.svg" alt="" />Chandigarh</a>
								</li>
								<li>
									<a href="mailto:partnership@theroac.com"><img src="assets/img/icons/mail1.svg" alt="" />partnership@theroac.com</a>
								</li>
								{/* <li>
									<a href="#"> <img src="assets/img/icons/world1.svg" alt="" />eventifyevent.com</a>
								</li> */}
							</ul>
						</div>
					</div>
				</div>
				<div className="space60"></div>
				<div className="row">
					<div className="col-lg-12">
						<div className="copyright">
							<p>&copy; Copyright 2025 - Dev Innovations Labs. All Right Reserved</p>
						</div>
					</div>
				</div>
			</div>
		</div>
  );
}

export default Footer;
