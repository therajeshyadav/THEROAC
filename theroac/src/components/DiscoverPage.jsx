import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import EventSlider from "./EventSlider";
import apiService from "../services/api";
import "./DiscoverPage.css";

const DiscoverPage = () => {
  const [discoverData, setDiscoverData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get filter from URL params
  const filter = searchParams.get("filter"); // e.g., ?filter=competitions

  useEffect(() => {
    fetchDiscoverContent();
  }, [filter]);

  const fetchDiscoverContent = async () => {
    try {
      setLoading(true);
      const [jobsData, apiEventsData, hubContentData] = await Promise.all([
        apiService.getJobs({ limit: 15 }).catch(() => ({ jobs: [] })),
        apiService.getEvents().catch(() => ({ events: [] })),
        apiService.getHubContent({ limit: 15 }).catch(() => []),
      ]);

      // Transform Jobs data to EventSlider format
      const jobs = (
        Array.isArray(jobsData) ? jobsData : jobsData.jobs || []
      ).map((job) => ({
        img:
          job.companyLogo ||
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80",
        title: `${job.title} - ${job.companyName}`,
        time: `${job.jobType || "Full-time"} • ${
          job.experienceLevel || "All levels"
        }`,
        location: job.location || "Remote",
        type: "job",
        data: job,
      }));

      // Transform Events data to EventSlider format
      const events = (
        Array.isArray(apiEventsData)
          ? apiEventsData
          : apiEventsData.events || []
      ).map((event) => {
        let formattedDateTime = "Date & Time TBD";
        if (event.startDate) {
          try {
            const startDate = new Date(event.startDate);
            const dateStr = startDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            const timeStr = startDate.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
            formattedDateTime = `${dateStr} • ${timeStr}`;
          } catch (error) {
            // Keep default
          }
        }

        return {
          img:
            event.bannerImage ||
            event.image ||
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
          title: event.title || "Untitled Event",
          time: formattedDateTime,
          location: event.location || event.venue || "Online Event",
          type: "event",
          data: event,
          category: event.tags?.[0] || "workshop",
        };
      });

      // Separate content types from hub content
      const allHubContent = Array.isArray(hubContentData) ? hubContentData : [];

      const internships = allHubContent
        .filter((content) => content.contentType === "internship")
        .map((content) => ({
          img:
            content.companyLogo ||
            content.thumbnailImage ||
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
          title: `${content.title} - ${content.companyName || "Company"}`,
          time: `${content.duration || "Internship"} • ${
            content.locationType || "Remote"
          }`,
          location: content.location || "Remote",
          type: "internship",
          data: content,
        }));

      const scholarships = allHubContent
        .filter((content) => content.contentType === "scholarship")
        .map((content) => ({
          img:
            content.featuredImage ||
            content.thumbnailImage ||
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
          title: content.title,
          time: `${content.amount || "Amount varies"} • Deadline: ${
            content.deadline || "Check details"
          }`,
          location: content.eligibility || "All students",
          type: "hub-content",
          data: content,
        }));

      const competitions = allHubContent
        .filter(
          (content) =>
            content.contentType === "competition" ||
            content.contentType === "hackathon"
        )
        .map((content) => ({
          img:
            content.featuredImage ||
            content.thumbnailImage ||
            "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
          title: content.title,
          time: `${content.prize || "Exciting prizes"} • ${
            content.category || "Tech"
          }`,
          location: content.deadline || "Check details",
          type: "hub-content",
          data: content,
        }));

      // Create discover sections with filtering (EventSlider format)
      const sections = [];

      // Apply filter if specified
      if (filter) {
        if (filter === "jobs" && (jobs.length > 0 || internships.length > 0)) {
          sections.push({
            title: "Jobs & Internships",
            titleId: "jobs-internships",
            events: [...jobs, ...internships],
          });
        } else if (filter === "events" && events.length > 0) {
          sections.push({
            title: "Events & Workshops",
            titleId: "events",
            events: events,
          });
        } else if (filter === "scholarships" && scholarships.length > 0) {
          sections.push({
            title: "Scholarships",
            titleId: "scholarships",
            events: scholarships,
          });
        } else if (filter === "competitions" && competitions.length > 0) {
          sections.push({
            title: "Competitions & Hackathons",
            titleId: "competitions",
            events: competitions,
          });
        }
      } else {
        // Show all sections if no filter
        if (jobs.length > 0 || internships.length > 0) {
          sections.push({
            title: "Jobs & Internships",
            titleId: "jobs-internships",
            events: [...jobs, ...internships],
          });
        }

        if (events.length > 0) {
          sections.push({
            title: "Events & Workshops",
            titleId: "events",
            events: events,
          });
        }

        if (scholarships.length > 0) {
          sections.push({
            title: "Scholarships",
            titleId: "scholarships",
            events: scholarships,
          });
        }

        if (competitions.length > 0) {
          sections.push({
            title: "Competitions & Hackathons",
            titleId: "competitions",
            events: competitions,
          });
        }
      }

      setDiscoverData(sections);
    } catch (error) {
      console.error("Error fetching discover content:", error);
      setDiscoverData([]);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (index, direction) => {
    // This function is not needed anymore as EventSlider handles its own scrolling
  };

  const handleItemClick = (item) => {
    // This function is not needed anymore as EventSlider handles its own clicks
  };

  const handleSeeMore = (section) => {
    // Navigate to filtered listing page based on section
    if (section.titleId === "jobs-internships") {
      // Navigate to home page with jobs section
      navigate("/#Jobs");
    } else if (section.titleId === "events") {
      navigate("/speakers");
    } else if (section.titleId === "scholarships") {
      // Navigate to home page with ROAC section (scholarships are part of hub content)
      navigate("/#ROAC");
    } else if (section.titleId === "competitions") {
      // Navigate to home page with ROAC section (competitions are part of hub content)
      navigate("/#ROAC");
    }
  };

  if (loading) {
    return (
      <>
        {/* Progress Wrap - Scroll to Top */}
        {/* <div className="paginacontainer">
          <div className="progress-wrap warp2">
            <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
              <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
            </svg>
          </div>
        </div> */}

        <div className="discover-page-wrapper">
          <div className="discover-page">
            <div className="preloader">
              <div className="loading-container">
                <div className="loading"></div>
                <div id="loading-icon">
                  <img src="assets/img/logo/preloader.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Progress Wrap - Scroll to Top */}
      {/* <div className="paginacontainer">
        <div className="progress-wrap warp2">
          <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
          </svg>
        </div>
      </div> */}

      <div className="discover-page-wrapper">
        <div className="discover-page">
          {/* Hero Section */}
          <div className="discover-hero">
            <div className="discover-hero-content">
              <h1>
                {filter === "jobs" && "Jobs & Internships"}
                {filter === "events" && "Events & Workshops"}
                {filter === "scholarships" && "Scholarships"}
                {filter === "competitions" && "Competitions & Hackathons"}
                {!filter && "Discover Opportunities"}
              </h1>
              <p>
                {filter === "jobs" &&
                  "Find the perfect job or internship opportunity that matches your skills and career goals"}
                {filter === "events" &&
                  "Join workshops, conferences, and events to enhance your skills and network"}
                {filter === "scholarships" &&
                  "Access funding and financial support for your educational journey"}
                {filter === "competitions" &&
                  "Participate in competitions and hackathons to showcase your talent"}
                {!filter &&
                  "Explore jobs, internships, events, scholarships, and competitions all in one place"}
              </p>
              {filter && (
                <button
                  className="discover-view-all-btn"
                  onClick={() => navigate("/discover")}
                >
                  View All Categories
                </button>
              )}
            </div>
          </div>

          {/* Content Sections */}
          <div className="discover-content">
            {discoverData.length === 0 ? (
              <div className="discover-no-content">
                <h3>
                  {filter === "jobs" &&
                    "No jobs or internships available at the moment"}
                  {filter === "events" &&
                    "No events or workshops available at the moment"}
                  {filter === "scholarships" &&
                    "No scholarships available at the moment"}
                  {filter === "competitions" &&
                    "No competitions or hackathons available at the moment"}
                  {!filter && "No opportunities available at the moment"}
                </h3>
                <p>
                  {filter
                    ? "Check back later for new opportunities in this category!"
                    : "Check back later for new jobs, internships, events, and more!"}
                </p>
                {filter && (
                  <button
                    className="discover-view-all-btn"
                    onClick={() => navigate("/discover")}
                    style={{ marginTop: "20px" }}
                  >
                    View All Categories
                  </button>
                )}
              </div>
            ) : (
              <div className="event10-section-area sp3">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-12">
                      <EventSlider eventsData={discoverData} />
                      <div className="space30"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscoverPage;
