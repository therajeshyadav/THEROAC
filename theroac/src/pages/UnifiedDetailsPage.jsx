// src/components/UnifiedDetailsPage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Briefcase, Award, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/api";
import { createSEOSlug, parseSlugForLookup } from "../utils/urlUtils";
import ModernDetailsPage from "./ModernDetailsPage";
import DetailsTopNav from "../../src/components/details/DetailsTopNav";
import DetailsHeroSection from "../../src/components/details/DetailsHeroSection";
import DetailsRightSidebar from "../../src/components/details/DetailsRightSidebar";

import "./UnifiedDetailsPage.css";

const UnifiedDetailsPage = () => {
  const { type, slug } = useParams(); // 'jobs' | 'events' | 'internships'
  const slugInfo = parseSlugForLookup(slug);
  const id = slugInfo.id; // old format me id hogi

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [activeTab, setActiveTab] = useState("");
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const headerRef = useRef(null);
  const leftContentRef = useRef(null);

  const [data, setData] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [preloaderVisible, setPreloaderVisible] = useState(true);


  // config per type
  const typeConfig = {
    jobs: {
      defaultTab: "description",
      tabs: [
        { id: "description", label: "Job Description" },
        { id: "dates", label: "Dates & Deadlines" },
        { id: "reviews", label: "Reviews" },
        { id: "faqs", label: "FAQs & Discussions" },
      ],
      headerIcon: Briefcase,
      logoGradient: "#FFD600",
      priceLabel: "Salary",
    },
    events: {
      defaultTab: "stages",
      tabs: [
        { id: "stages", label: "Stages & Timeline" },
        { id: "details", label: "Details" },
        { id: "dates", label: "Dates & Deadlines" },
        { id: "prizes", label: "Prizes" },
        { id: "media", label: "Photos & Videos" },
        { id: "reviews", label: "Reviews" },
        { id: "faqs", label: "FAQs & Discussions" },
      ],
      headerIcon: Award,
      logoGradient: "#FFD600",
      priceLabel: "Entry Fee",
    },
    internships: {
      defaultTab: "details",
      tabs: [
        { id: "details", label: "Internship Details" },
        { id: "reviews", label: "Reviews" },
        { id: "faqs", label: "FAQs & Discussions" },
      ],
      headerIcon: Clock,
      logoGradient: "#FFD600",
      priceLabel: "Stipend",
    },
  };

  // 🔹 data fetch
  useEffect(() => {
    const fetchData = async () => {
      if (!type || !slug) return;

      setPreloaderVisible(true);

      try {
        let fetchedData = null;

        switch (type) {
          case "jobs":
            fetchedData = id
              ? await apiService.getJobById(id)
              : await apiService.getJobBySlug(slug);
            break;
          case "events":
            fetchedData = id
              ? await apiService.getEventById(id)
              : await apiService.getEventBySlug(slug);
            break;
          case "internships":
            fetchedData = id
              ? await apiService.getHubContentById(id)
              : await apiService.getHubContentBySlug(slug);
            break;
          default:
            setPreloaderVisible(false);
            return;
        }

        if (fetchedData) {
          setData(fetchedData);

          // SEO slug redirect (old format -> new slug)
          const currentSlug = slug;
          const title = fetchedData.title;
          const organization =
            fetchedData.company ||
            fetchedData.companyName ||
            fetchedData.organization ||
            fetchedData.organizer;
          const correctSlug = createSEOSlug(title, organization);

          if (id && currentSlug !== correctSlug) {
            navigate(`/event-detail/${type}/${correctSlug}`, { replace: true });
            return;
          }
        } else {
          console.error(`${type} not found`);
          setData(null);
        }
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        setData(null);
      } finally {
        setTimeout(() => setPreloaderVisible(false), 500);
      }

      setActiveTab(typeConfig[type]?.defaultTab || "");
    };

    fetchData();
  }, [type, id, slug, navigate]);

  // 🔹 application status check
  const checkApplicationStatus = async () => {
    if (!data?.id || !isAuthenticated || !user) {
      setHasApplied(false);
      setCheckingStatus(false);
      return;
    }

    // recruiters / admin apply nahi kar sakte
    if (user.role === "recruiter" || user.role === "admin") {
      setHasApplied(false);
      setCheckingStatus(false);
      return;
    }

    try {
      let hasAppliedStatus = false;

      switch (type) {
        case "jobs": {
          const jobStatus = await apiService.checkJobApplicationStatus(data.id);
          hasAppliedStatus = jobStatus?.hasApplied || false;
          break;
        }
        case "events": {
          const eventStatus = await apiService.checkEventRegistrationStatus(
            data.id
          );
          hasAppliedStatus =
            eventStatus?.hasRegistered || eventStatus?.hasApplied || false;
          break;
        }
        case "internships": {
          const hubStatus = await apiService.checkHubContentApplicationStatus(
            data.id
          );
          hasAppliedStatus = hubStatus?.hasApplied || false;
          break;
        }
        default:
          hasAppliedStatus = false;
      }

      setHasApplied(hasAppliedStatus);
    } catch (error) {
      console.error("Error checking application status:", error);
      setHasApplied(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (data && isAuthenticated) {
      checkApplicationStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [data, isAuthenticated, user]);

  // 🔹 scroll handler (sticky + scroll spy) – same logic
  useEffect(() => {
    const handleScroll = () => {
      const pageWrapper = document.querySelector('.page-content-wrapper');
      if (pageWrapper && data) {
        const scrollTop = pageWrapper.scrollTop;
        const heroHeight = 350; // Hero section height

        const shouldBeSticky = scrollTop > heroHeight - 50;
        setIsHeaderSticky(shouldBeSticky);

        const sections = typeConfig[type]?.tabs.map((tab) => tab.id) || [];
        const sectionElements = sections
          .map((id) => document.getElementById(id))
          .filter(Boolean);

        let currentSection = typeConfig[type]?.defaultTab || "";
        const viewportTop = scrollTop + 150; // Offset for header

        for (let i = sectionElements.length - 1; i >= 0; i--) {
          const section = sectionElements[i];
          if (section.offsetTop <= viewportTop) {
            currentSection = section.id;
            break;
          }
        }

        setActiveTab(currentSection);
      }
    };

    const pageWrapper = document.querySelector('.page-content-wrapper');
    if (pageWrapper && data) {
      pageWrapper.addEventListener("scroll", handleScroll);

      setTimeout(() => {
        handleScroll();
      }, 100);
    }

    return () => {
      if (pageWrapper) {
        pageWrapper.removeEventListener("scroll", handleScroll);
      }
    };
  }, [type, data]);

  // 🔹 bookmark & like status
  useEffect(() => {
    const checkStatus = async () => {
      if (data?.id && isAuthenticated) {
        try {
          const [bookmarkStatus, likeStatus] = await Promise.all([
            apiService.checkBookmarkStatus(data.id, type),
            apiService.checkLikeStatus(data.id, type),
          ]);

          setIsBookmarked(!!bookmarkStatus.bookmarked || !!bookmarkStatus.isBookmarked);
          setIsLiked(!!likeStatus.liked || !!likeStatus.isLiked);
        } catch (error) {
          console.error("Error checking bookmark/like status:", error);
          setIsBookmarked(false);
          setIsLiked(false);
        }
      } else {
        setIsBookmarked(false);
        setIsLiked(false);
      }
    };

    checkStatus();
  }, [data?.id, type, isAuthenticated]);

  const scrollToSection = (sectionId) => {
    // ModernDetailsPage ka custom scroll hook
    if (window.modernDetailsScrollToSection) {
      window.modernDetailsScrollToSection(sectionId);
      return;
    }

    const section = document.getElementById(sectionId);
    const pageWrapper = document.querySelector(".page-content-wrapper");

    if (!section || !pageWrapper) return;

    setActiveTab(sectionId);

    const pageWrapperRect = pageWrapper.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const currentScroll = pageWrapper.scrollTop;

    const targetScroll =
      currentScroll + sectionRect.top - pageWrapperRect.top - 100;

    pageWrapper.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  // 🔹 helpers
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return value;

    const num = parseInt(value.toString().replace(/[^\d]/g, ""), 10);
    
    // Format with commas instead of K/L/Cr abbreviations
    return `₹${num.toLocaleString()}`;
  };

  const formatSalaryRange = (salary) => {
    if (!salary) return "Competitive";
    
    // Handle object format (new format from backend)
    if (typeof salary === 'object' && salary !== null) {
      if (salary.min && salary.max) {
        return `${formatCurrency(salary.min)} - ${formatCurrency(salary.max)}`;
      }
      if (salary.min) {
        return `${formatCurrency(salary.min)}+`;
      }
      if (salary.amount) {
        return formatCurrency(salary.amount);
      }
      // If object has no valid properties, return competitive
      return "Competitive";
    }
    
    // Handle string format (old format)
    if (typeof salary === 'string') {
      if (salary.includes("₹")) return salary;

      const rangeMatch = salary.match(/(\d+)\s*[-to]\s*(\d+)/i);
      if (rangeMatch) {
        const min = rangeMatch[1];
        const max = rangeMatch[2];
        return `${formatCurrency(min)} - ${formatCurrency(max)}`;
      }

      const singleMatch = salary.match(/(\d+)/);
      if (singleMatch) {
        return formatCurrency(singleMatch[1]);
      }

      return salary;
    }
    
    // Handle number format
    if (typeof salary === 'number') {
      return formatCurrency(salary);
    }
    
    return "Competitive";
  };

  const getPriceDisplay = () => {
    if (!data) return "N/A";

    switch (type) {
      case "jobs":
        return formatSalaryRange(data.salary) || "Competitive";
      case "events": {
        const eventPrice = data.price || data.fee || data.registrationFee;
        
        // Handle object format for registration fee
        if (eventPrice && typeof eventPrice === 'object') {
          if (eventPrice.amount) {
            if (!eventPrice.amount || eventPrice.amount === "0" || eventPrice.amount === 0) {
              return "Free";
            }
            return formatCurrency(eventPrice.amount);
          }
          return "Free";
        }
        
        // Handle string/number format
        if (!eventPrice || eventPrice === "0" || eventPrice === 0) {
          return "Free";
        }
        return formatCurrency(eventPrice);
      }
      case "internships":
        // Handle object format for stipend
        if (data.stipend && typeof data.stipend === 'object' && data.stipend !== null) {
          if (data.stipend.min && data.stipend.max) {
            return `${formatCurrency(data.stipend.min)} - ${formatCurrency(data.stipend.max)}`;
          }
          if (data.stipend.amount) {
            if (!data.stipend.amount || data.stipend.amount === "0" || data.stipend.amount === 0) {
              return "Unpaid";
            }
            return formatCurrency(data.stipend.amount);
          }
          return "Unpaid";
        }
        if (data.stipend) return formatSalaryRange(data.stipend);
        return "Unpaid";
      default:
        return "N/A";
    }
  };

  const getDeadlineDisplay = () => {
    if (!data) return 30;

    if (data.deadline && typeof data.deadline === "number") {
      return data.deadline;
    }
    const now = new Date();

    if (data.applicationDeadline) {
      const deadline = new Date(data.applicationDeadline);
      const diffTime = deadline - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    if (data.endDate) {
      const endDate = new Date(data.endDate);
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    return 30;
  };

  // 🔹 actions
  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(data?.title || "Check this out");
    const description = encodeURIComponent(
      `Check out this amazing ${data?.contentType || 'opportunity'}: ${data?.title || 'opportunity'} at ${data?.companyName || 'company'}. ${data?.description ? data.description.substring(0, 100) + '...' : 'Don\'t miss this opportunity!'}`
    );

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${description}%20${url}`,
      copy: null,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
      return;
    }

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      alert("Please login to bookmark");
      return;
    }

    try {
      const result = await apiService.toggleBookmark(data?.id, type);
      setIsBookmarked(result.bookmarked || result.isBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("Failed to update bookmark");
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert("Please login to like");
      return;
    }

    try {
      const result = await apiService.toggleLike(data?.id, type);
      setIsLiked(result.liked || result.isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to update like");
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }

    if (user?.role === "recruiter" || user?.role === "admin") {
      alert("Recruiters and admins cannot apply. Only candidates can apply.");
      return;
    }

    if (hasApplied) return;

    // Direct application without form - send existing candidate data from database
    setIsApplying(true);
    try {
      let result = null;

      switch (type) {
        case "jobs":
          result = await apiService.applyToJob(data.id, {
            resumeLink: '',
            coverLetter: ''
          });
          break;
        case "events":
          result = await apiService.registerForEvent(data.id);
          break;
        case "internships":
          result = await apiService.applyToHubContent(data.id);
          break;
        default:
          throw new Error('Unknown application type');
      }

      if (result) {
        setHasApplied(true);
        alert(`Successfully applied for ${data.title}!`);
      }
    } catch (error) {
      const errorMessage = error.message || 'Please try again later.';
      console.error('Application error:', error);
      
      if (errorMessage.includes('Already applied')) {
        alert('You have already applied to this position.');
        setHasApplied(true);
      } else if (errorMessage.includes('not found')) {
        alert('This position is no longer available.');
      } else {
        alert(`Failed to apply: ${errorMessage}`);
      }
    } finally {
      setIsApplying(false);
    }
  };



  if (!data || !typeConfig[type]) {
    return (
      <div className="preloader">
        <div className="loading-container">
          <div className="loading"></div>
          <div id="loading-icon">
            <img src="assets/img/logo/preloader.png" alt="" />
          </div>
        </div>
      </div>
    );
  }

  const config = typeConfig[type];

  return (
    <>
      {preloaderVisible && (
        <div className="preloader">
          <div className="loading-container">
            <div className="loading"></div>
            <div id="loading-icon">
              <img src="/assets/img/logo/preloader.png" alt="" />
            </div>
          </div>
        </div>
      )}

      <div className="paginacontainer">
        <div className="progress-wrap warp2">
          <svg
            className="progress-circle svg-content"
            width="100%"
            height="100%"
            viewBox="-1 -1 102 102"
          >
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
          </svg>
        </div>
      </div>

      <div className="details-page unified-details-page">


        {/* 🔹 TOP NAV AS COMPONENT */}
        <DetailsTopNav
          isHeaderSticky={isHeaderSticky}
          tabs={config.tabs}
          activeTab={activeTab}
          onTabClick={scrollToSection}
          isAuthenticated={isAuthenticated}
          user={user}
          onDashboardClick={() => {
            if (user?.role === "admin") navigate("/admin-dashboard");
            else if (user?.role === "recruiter")
              navigate("/recruiter-dashboard");
            else navigate("/candidate-dashboard");
          }}
          onLogout={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          onLogin={() => navigate("/login")}
          onSignup={() => navigate("/register")}
        />

        {/* Page Content Wrapper */}
        <div className="page-content-wrapper">
          {/* 🔹 HERO SECTION AS COMPONENT */}
          <DetailsHeroSection data={data} />

          {/* Main Content Container */}
          <div className="main-container">
            {/* Left Content – ModernDetailsPage */}
            <ModernDetailsPage />

            {/* Right Sidebar – COMPONENT */}
            <DetailsRightSidebar
              type={type}
              data={data}
              user={user}
              hasApplied={hasApplied}
              isApplying={isApplying}
              checkingStatus={checkingStatus}
              isBookmarked={isBookmarked}
              isLiked={isLiked}
              onApply={handleApply}
              onBookmark={handleBookmark}
              onLike={handleLike}
              onShare={handleShare}
              getPriceDisplay={getPriceDisplay}
              getDeadlineDisplay={getDeadlineDisplay}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default UnifiedDetailsPage;
