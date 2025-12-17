import React, { useEffect, useState } from 'react';
import EventSlider from './EventSlider';
// import { eventsData } from '../Data/Event.js'; // COMMENTED OUT - Using backend data only
import apiService from '../services/api';

const Schedule = () => {
	// Initialize with empty array - will load from backend only
	const [dynamicEventsData, setDynamicEventsData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDynamicContent();
	}, []);

	const fetchDynamicContent = async () => {
		try {
			setLoading(true);
			const [jobsData, apiEventsData, hubContentData] = await Promise.all([
				apiService.getJobs({ limit: 10 }).catch((error) => {
					return { jobs: [] };
				}),
				apiService.getEvents().catch((error) => {
					return { events: [] };
				}),
				apiService.getHubContent({ limit: 10 }).catch((error) => {
					return [];
				})
			]);



			// Transform API data to match the existing event structure
			const jobs = (Array.isArray(jobsData) ? jobsData : (jobsData.jobs || [])).map(job => ({
				img: job.companyLogo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80",
				title: `${job.title} - ${job.companyName}`,
				time: `${job.jobType || 'Full-time'} • ${job.experienceLevel || 'All levels'}`,
				location: job.location || 'Remote',
				type: 'job',
				data: job
			}));

			const events = (Array.isArray(apiEventsData) ? apiEventsData : (apiEventsData.events || []))
				.map(event => {
					// Extract date and time from startDate
					let formattedDateTime = 'Date & Time TBD';
					if (event.startDate) {
						try {
							const startDate = new Date(event.startDate);
							const dateStr = startDate.toLocaleDateString('en-US', { 
								month: 'short', 
								day: 'numeric' 
							});
							const timeStr = startDate.toLocaleTimeString('en-US', { 
								hour: 'numeric', 
								minute: '2-digit',
								hour12: true 
							});
							formattedDateTime = `${dateStr} • ${timeStr}`;
						} catch (error) {
							// Error formatting date
						}
					}

					return {
						img: event.bannerImage || event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
						title: event.title || 'Untitled Event',
						time: formattedDateTime,
						location: event.location || event.venue || 'Online Event',
						type: 'event',
						data: event,
						category: event.tags?.[0] || 'workshop'
					};
				});

			// Separate internships from other hub content
			const allHubContent = Array.isArray(hubContentData) ? hubContentData : [];
			
			const internships = allHubContent
				.filter(content => content.contentType === 'internship')
				.map(content => ({
					img: content.companyLogo || content.thumbnailImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
					title: `${content.title} - ${content.companyName || 'Company'}`,
					time: `${content.duration || 'Internship'} • ${content.locationType || 'Remote'}`,
					location: content.location || 'Remote',
					type: 'internship',
					data: content
				}));

			const hubContent = allHubContent
				.filter(content => content.contentType !== 'internship')
				.map(content => ({
					img: content.featuredImage || content.thumbnailImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
					title: content.title,
					time: `${content.category?.replace('-', ' ') || 'Career Tips'} • ${new Date(content.createdAt || Date.now()).toLocaleDateString()}`,
					location: "ROAC Talent Hub",
					type: 'hub-content',
					data: content
				}));

			// Create events data structure using ONLY backend data (no static data)
			const enhancedEventsData = [];

			// Add Jobs section with backend data only (no internships)
			if (jobs.length > 0) {
				enhancedEventsData.push({
					title: "Jobs",
					titleId: "Jobs",
					events: jobs
				});
			}

			// Add Internships section separately
			if (internships.length > 0) {
				enhancedEventsData.push({
					title: "Internships",
					titleId: "Internships",
					events: internships
				});
			}

			// Add Events section with backend data only
			if (events.length > 0) {
				enhancedEventsData.push({
					title: "Events",
					titleId: "Events",
					events: events
				});
			}

			// Add ROAC Prime Talent Hub section with backend data only
			if (hubContent.length > 0) {
				enhancedEventsData.push({
					title: "ROAC Prime Talent Hub",
					titleId: "ROAC",
					events: hubContent
				});
			}

			setDynamicEventsData(enhancedEventsData);
		} catch (error) {
			// Set empty array on error - no static fallback
			setDynamicEventsData([]);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="event10-section-area sp3">
				<div className="container">
					<div className="row">
						<div className="col-lg-8 m-auto">
							<div className="event-heading heading13 text-center space-margin60">
								<div className="space20"></div>
								<h2 className="text-anime-style-3">
									<img src="assets/img/icons/sub-logo1.svg" alt="" width={30} />
									Loading Opportunities...
								</h2>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="event10-section-area sp3">
			<div className="container">
				<div className="row">
					<div className="col-lg-8 m-auto">
						<div className="event-heading heading13 text-center space-margin60">
							{/* <h5><img src="assets/img/icons/sub-logo1.svg" alt="" width={26} />Events</h5> */}
							<div className="space20"></div>
							<h2 className="text-anime-style-3"><img src="assets/img/icons/sub-logo1.svg" alt="" width={30} /> Opportunities</h2>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-lg-12">
						<EventSlider eventsData={dynamicEventsData} />
						<div className="space30"></div>
						{/* <div className="event6-widget-boxarea" data-aos="fade-left" data-aos-duration="1000">
							<div className="row align-items-center">
								<div className="col-lg-7">
									<div className="img1 image-anime reveal">
										<img src="assets/img/all-images/event/event-img25.png" alt="" />
									</div>
								</div>
								<div className="col-lg-5">
									<div className="content-area">
										<h3 className="text-anime-style-3">“The Future of AI in Everyday Life with Emily Chang, CEO of TechX Solutions.”</h3>
										<div className="space24"></div>
										<ul>
											<li>
												<a href="#"><img src="assets/img/icons/clock1.svg" alt="" />10:00 AM -12:00 PM</a>
											</li>
											<li className="space14"></li>
											<li>
												<a href="#"><img src="assets/img/icons/location1.svg" alt="" />26/C Asana, New York</a>
											</li>
										</ul>
										<div className="space32"></div>
										<div className="btn-area1">
											<a href="pricing-plan.html" className="vl-btn10">Buy Tickets Now <img src="assets/img/icons/arrow2.svg" alt="" /></a>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="space50"></div>
						<div className="event6-widget-boxarea" data-aos="fade-right" data-aos-duration="1100">
							<div className="row align-items-center">
								<div className="col-lg-7">
									<div className="img1 image-anime reveal">
										<img src="assets/img/all-images/event/event-img26.png" alt="" />
									</div>
								</div>
								<div className="col-lg-5">
									<div className="content-area">
										<h3 className="text-anime-style-3">“Cybersecurity Trends and Threats" by Rachel Wong, Cybersecurity Expert at SecureNet.”</h3>
										<div className="space24"></div>
										<ul>
											<li>
												<a href="#"><img src="assets/img/icons/clock1.svg" alt="" />10:00 AM -12:00 PM</a>
											</li>
											<li className="space14"></li>
											<li>
												<a href="#"><img src="assets/img/icons/location1.svg" alt="" />26/C Asana, New York</a>
											</li>
										</ul>
										<div className="space32"></div>
										<div className="btn-area1">
											<a href="pricing-plan.html" className="vl-btn10">Buy Tickets Now <img src="assets/img/icons/arrow2.svg" alt="" /></a>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="space50"></div>
						<div className="event6-widget-boxarea" data-aos="fade-left" data-aos-duration="1200">
							<div className="row align-items-center">
								<div className="col-lg-7">
									<div className="img1 image-anime reveal">
										<img src="assets/img/all-images/event/event-img14.png" alt="" />
									</div>
								</div>
								<div className="col-lg-5">
									<div className="content-area">
										<h3 className="text-anime-style-3">“Join us at the State Plaza Conference Hall, a premier location equipped with modern amenities.”</h3>
										<div className="space24"></div>
										<ul>
											<li>
												<a href="#"><img src="assets/img/icons/clock1.svg" alt="" />10:00 AM -12:00 PM</a>
											</li>
											<li className="space14"></li>
											<li>
												<a href="#"><img src="assets/img/icons/location1.svg" alt="" />26/C Asana, New York</a>
											</li>
										</ul>
										<div className="space32"></div>
										<div className="btn-area1">
											<a href="pricing-plan.html" className="vl-btn10">Buy Tickets Now <img src="assets/img/icons/arrow2.svg" alt="" /></a>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="space30"></div> */}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Schedule;
