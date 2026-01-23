// src/components/candidate-dashboard/EventsTab.jsx
import { useState, useEffect } from "react";
import apiService from "../../services/api";
import { toast } from "react-toastify";
import "./EventsTab.css";

const EventsTab = ({
  events = [],
  appliedItems = new Set(),
  onRegisterEvent,
  onViewEventDetails,
}) => {
  // Ensure events is always an array
  const safeEvents = Array.isArray(events) ? events : [];

  // Debug logging
  console.log("🎪 EventsTab - Events received:", safeEvents.length);
  console.log("🎪 EventsTab - Applied items:", Array.from(appliedItems));
  console.log(
    "🎪 EventsTab - Sample events:",
    safeEvents.slice(0, 3).map((e) => ({ id: e.id, title: e.title })),
  );

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [bookmarkedEvents, setBookmarkedEvents] = useState(new Set());

  // Load bookmarked events
  useEffect(() => {
    loadBookmarkedEvents();
  }, []);

  const loadBookmarkedEvents = async () => {
    try {
      const response = await apiService.getMyBookmarks();
      const bookmarks = response.bookmarks || response || [];
      const eventIds = new Set(
        bookmarks.filter((b) => b.itemType === "events").map((b) => b.itemId),
      );
      setBookmarkedEvents(eventIds);
    } catch (error) {
      console.error("Failed to load bookmarked events:", error);
    }
  };

  const handleBookmarkEvent = async (eventId) => {
    try {
      const wasBookmarked = bookmarkedEvents.has(eventId);

      const response = await apiService.toggleBookmark(eventId, "events");

      // Toggle the bookmark state based on previous state
      if (wasBookmarked) {
        // Was bookmarked, now removing
        setBookmarkedEvents((prev) => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        toast.info("Bookmark removed");
      } else {
        // Was not bookmarked, now adding
        setBookmarkedEvents((prev) => new Set([...prev, eventId]));
        toast.success("Event bookmarked!");
      }
    } catch (error) {
      console.error("Event bookmark error:", error);
      toast.error("Failed to bookmark event");
    }
  };

  // Filter events
  const filteredEvents = safeEvents.filter((event) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        event.title?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.organizer?.toLowerCase().includes(searchLower) ||
        (event.tags &&
          event.tags.some((tag) => tag.toLowerCase().includes(searchLower)));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== "all") {
      const eventCategory = event.category || event.type || "";
      if (
        !eventCategory.toLowerCase().includes(selectedCategory.toLowerCase())
      ) {
        return false;
      }
    }

    // Location filter
    if (selectedLocation !== "all") {
      if (selectedLocation === "online") {
        if (
          !event.location?.toLowerCase().includes("online") &&
          event.locationType !== "online"
        ) {
          return false;
        }
      } else {
        if (
          !event.location
            ?.toLowerCase()
            .includes(selectedLocation.toLowerCase())
        ) {
          return false;
        }
      }
    }

    // Type filter
    if (selectedType !== "all") {
      const eventType = event.type || event.category || "";
      if (!eventType.toLowerCase().includes(selectedType.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return (
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );
      case "oldest":
        return (
          new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date)
        );
      case "title":
        return a.title.localeCompare(b.title);
      case "date":
        return (
          new Date(a.date || a.startDate) - new Date(b.date || b.startDate)
        );
      default:
        return 0;
    }
  });

  return (
    <div className="tab-content">
      <div className="dashboard-card">
        <div className="card-header">
          <h4>
            <i
              className="fas fa-calendar-alt"
              style={{ marginRight: "8px", color: "#FFD600" }}
            ></i>
            Search Events
          </h4>
          <div className="search-stats">
            <span>
              {sortedEvents.length} of {events.length} events
            </span>
          </div>
        </div>
        <div className="job-search-section">
          <div className="search-filters">
            <div className="row">
              <div className="col-md-4 mb-3">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Event title, organizer, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="fas fa-search search-icon" />
                </div>
              </div>
              <div className="col-md-2 mb-3">
                <select
                  className="form-control"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="workshop">Workshop</option>
                  <option value="networking">Networking</option>
                  <option value="competition">Competition</option>
                  <option value="conference">Conference</option>
                  <option value="seminar">Seminar</option>
                  <option value="webinar">Webinar</option>
                  <option value="hackathon">Hackathon</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <select
                  className="form-control"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  <option value="online">Online</option>
                  <option value="delhi">Delhi</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="hyderabad">Hyderabad</option>
                  <option value="pune">Pune</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <select
                  className="form-control"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <select
                  className="form-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="date">Event Date</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="filter-chips">
                  {searchTerm && (
                    <button className="chip" onClick={() => setSearchTerm("")}>
                      {searchTerm} <i className="fas fa-times" />
                    </button>
                  )}
                  {selectedCategory !== "all" && (
                    <button
                      className="chip"
                      onClick={() => setSelectedCategory("all")}
                    >
                      {selectedCategory} <i className="fas fa-times" />
                    </button>
                  )}
                  {selectedLocation !== "all" && (
                    <button
                      className="chip"
                      onClick={() => setSelectedLocation("all")}
                    >
                      {selectedLocation} <i className="fas fa-times" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Listings */}
      <div className="dashboard-card">
        <div className="card-header">
          <h4>
            Available{" "}
            {selectedCategory === "all"
              ? "Events"
              : selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1) +
                "s"}
          </h4>
          <span className="job-count">{sortedEvents.length} found</span>
        </div>
        <div
          className="jobs-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
            width: "100%",
            minHeight: "200px",
          }}
        >
          {sortedEvents.map((event) => {
            console.log("my evebts", event);
            const displayLocation = event.location || "Online";
            const eventDate = new Date(
              event.date || event.startDate || Date.now(),
            );

            // Format registration fee properly (similar to jobs/internships)
            let displayPrice = "Free";
            let priceLabel = "Registration";

            // Helper function to format numbers with commas
            const formatNumber = (num) => {
              if (!num) return "0";
              return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };

            if (event.registrationFee) {
              if (typeof event.registrationFee === "object") {
                if (
                  event.registrationFee.type === "free" ||
                  event.registrationFee.amount === 0
                ) {
                  displayPrice = "Free";
                } else if (event.registrationFee.amount) {
                  const currency =
                    event.registrationFee.currency === "INR"
                      ? "₹"
                      : event.registrationFee.currency === "USD"
                        ? "$"
                        : event.registrationFee.currency || "₹";
                  const formattedAmount = formatNumber(
                    event.registrationFee.amount,
                  );
                  displayPrice = `${currency}${formattedAmount}`;
                }
              } else if (typeof event.registrationFee === "string") {
                if (
                  event.registrationFee.toLowerCase() === "free" ||
                  event.registrationFee === "0"
                ) {
                  displayPrice = "Free";
                } else if (
                  event.registrationFee.toLowerCase().includes("usd")
                ) {
                  // Handle "USDamount" format - extract numeric value and add $ symbol
                  const amount = event.registrationFee.replace(/[^\d.]/g, "");
                  if (amount && !isNaN(amount)) {
                    const formattedAmount = formatNumber(
                      Math.floor(parseFloat(amount)),
                    );
                    displayPrice = `$${formattedAmount}`;
                  } else {
                    displayPrice = event.registrationFee;
                  }
                } else if (
                  event.registrationFee.toLowerCase().includes("inr")
                ) {
                  // Handle "INRamount" format
                  const amount = event.registrationFee.replace(/[^\d.]/g, "");
                  if (amount && !isNaN(amount)) {
                    const formattedAmount = formatNumber(
                      Math.floor(parseFloat(amount)),
                    );
                    displayPrice = `₹${formattedAmount}`;
                  } else {
                    displayPrice = event.registrationFee;
                  }
                } else if (!isNaN(event.registrationFee)) {
                  // Pure numeric string
                  const formattedAmount = formatNumber(
                    Math.floor(parseFloat(event.registrationFee)),
                  );
                  displayPrice = `₹${formattedAmount}`;
                } else {
                  displayPrice = event.registrationFee;
                }
              } else if (typeof event.registrationFee === "number") {
                if (event.registrationFee === 0) {
                  displayPrice = "Free";
                } else {
                  const formattedAmount = formatNumber(event.registrationFee);
                  displayPrice = `₹${formattedAmount}`;
                }
              }
            } else if (event.price) {
              if (typeof event.price === "number") {
                if (event.price === 0) {
                  displayPrice = "Free";
                } else {
                  const formattedAmount = formatNumber(event.price);
                  displayPrice = `₹${formattedAmount}`;
                }
              } else if (typeof event.price === "string") {
                if (
                  event.price.toLowerCase() === "free" ||
                  event.price === "0"
                ) {
                  displayPrice = "Free";
                } else if (event.price.toLowerCase().includes("usd")) {
                  const amount = event.price.replace(/[^\d.]/g, "");
                  if (amount && !isNaN(amount)) {
                    const formattedAmount = formatNumber(
                      Math.floor(parseFloat(amount)),
                    );
                    displayPrice = `$${formattedAmount}`;
                  } else {
                    displayPrice = event.price;
                  }
                } else if (event.price.toLowerCase().includes("inr")) {
                  const amount = event.price.replace(/[^\d.]/g, "");
                  if (amount && !isNaN(amount)) {
                    const formattedAmount = formatNumber(
                      Math.floor(parseFloat(amount)),
                    );
                    displayPrice = `₹${formattedAmount}`;
                  } else {
                    displayPrice = event.price;
                  }
                } else if (!isNaN(event.price)) {
                  const formattedAmount = formatNumber(
                    Math.floor(parseFloat(event.price)),
                  );
                  displayPrice = `₹${formattedAmount}`;
                } else {
                  displayPrice = event.price;
                }
              } else {
                displayPrice = event.price;
              }
            }

            // Get event type from categories array or tags
            let displayType = "Event";
            if (
              event.categories &&
              Array.isArray(event.categories) &&
              event.categories.length > 0
            ) {
              displayType = event.categories[0]; // Use first category
            } else if (
              event.tags &&
              Array.isArray(event.tags) &&
              event.tags.length > 0
            ) {
              displayType = event.tags[0]; // Fallback to first tag
            } else if (event.type) {
              displayType = event.type;
            }

            // Capitalize first letter
            displayType =
              displayType.charAt(0).toUpperCase() + displayType.slice(1);

            return (
              <div className="event-card">
                <div className="event-left">
                  <div className="event-logo">
                    {event.thumbnailImage || event.bannerImage ? (
                      <img
                        src={event.thumbnailImage || event.bannerImage}
                        alt={event.title}
                      />
                    ) : (
                      <i className="fas fa-calendar-alt" />
                    )}
                  </div>
                  <div className="event-meta">
                    <span>
                      <i className="fas fa-map-marker-alt" /> {displayLocation}
                    </span>
                    <span>
                      <i className="fas fa-calendar" />{" "}
                      {eventDate.toLocaleDateString()}
                    </span>
                    <span>
                      <i className="fas fa-rupee-sign" /> {displayPrice}
                    </span>
                  </div>
                </div>

                <div className="event-body">
                  <div className="event-top">
                    <div>
                      <h5 className="event-title">{event.title}</h5>
                      <span className="event-type">{displayType}</span>
                      {/* <p className="event-organizer">
                        {event.organizer || "Event Organizer"}
                      </p> */}
                    </div>

                    <button
                      className={`bookmark-btn ${bookmarkedEvents.has(event.id) ? "active" : ""}`}
                      onClick={() => handleBookmarkEvent(event.id)}
                    >
                      <i
                        className={
                          bookmarkedEvents.has(event.id)
                            ? "fas fa-bookmark"
                            : "far fa-bookmark"
                        }
                      />
                    </button>
                  </div>

                  <div className="event-bottom">
                    <div className="event-actionsC">
                      <button
                        className="btn-outlineC"
                        onClick={() => onViewEventDetails(event)}
                      >
                        View Details
                      </button>

                      <button
                        className={`btn-primaryC ${appliedItems.has(event.id) ? "applied" : ""}`}
                        onClick={() => onRegisterEvent(event.id)}
                        disabled={appliedItems.has(event.id)}
                      >
                        {appliedItems.has(event.id) ? "Registered" : "Register"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {sortedEvents.length === 0 && (
            <div className="no-data">
              <i
                className="fas fa-calendar-alt"
                style={{
                  fontSize: "48px",
                  color: "#ccc",
                  marginBottom: "16px",
                }}
              />
              <p>No events match your filters</p>
              {(searchTerm ||
                selectedCategory !== "all" ||
                selectedLocation !== "all") && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedLocation("all");
                    setSelectedType("all");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsTab;
