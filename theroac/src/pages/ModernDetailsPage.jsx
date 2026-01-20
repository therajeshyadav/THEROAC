import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Link as LinkIcon,
  Building,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/api";
import { parseSlugForLookup, createSEOSlug } from "../utils/urlUtils";
import StageSubmissionModal from "../components/StageSubmissionModal";
import QuizInterface from "../components/QuizInterface";
import "./ModernDetailsPage.css";

const ModernDetailsPage = () => {
  const { type, slug } = useParams();
  const slugInfo = parseSlugForLookup(slug);
  const id = slugInfo.id;
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedStageIndex, setSelectedStageIndex] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizStage, setQuizStage] = useState(null);
  const [quizStageIndex, setQuizStageIndex] = useState(null);
  const [quizStatuses, setQuizStatuses] = useState({});
  const [userSubmissions, setUserSubmissions] = useState({}); // Track user submissions by stage
  const [teamStatus, setTeamStatus] = useState(null); // Track team creation status
  const [submissionStatuses, setSubmissionStatuses] = useState({}); // Track submission status for each stage
  const contentRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!type || !slug) return;

      try {
        let fetchedData = null;

        switch (type) {
          case "jobs":
            if (id) {
              fetchedData = await apiService.getJobById(id);
            } else {
              fetchedData = await apiService.getJobBySlug(slug);
            }
            break;
          case "events":
            if (id) {
              fetchedData = await apiService.getEventById(id);
            } else {
              fetchedData = await apiService.getEventBySlug(slug);
            }
            break;
          case "internships":
            if (id) {
              fetchedData = await apiService.getHubContentById(id);
            } else {
              fetchedData = await apiService.getHubContentBySlug(slug);
            }
            break;
          default:
            return;
        }

        if (fetchedData) {
          setData(fetchedData);

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
        }
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id, slug, navigate]);

  // Check application status
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!data?.id || !isAuthenticated || !user) {
        setHasApplied(false);
        return;
      }

      // Only candidates can apply
      if (user.role === "recruiter" || user.role === "admin") {
        setHasApplied(false);
        return;
      }

      try {
        let hasAppliedStatus = false;

        switch (type) {
          case "jobs":
            const jobStatus = await apiService.checkJobApplicationStatus(
              data.id,
            );
            hasAppliedStatus = jobStatus?.hasApplied || false;
            break;
          case "events":
            const eventStatus = await apiService.checkEventRegistrationStatus(
              data.id,
            );
            hasAppliedStatus =
              eventStatus?.hasRegistered || eventStatus?.hasApplied || false;
            break;
          case "internships":
            const hubStatus = await apiService.checkHubContentApplicationStatus(
              data.id,
            );
            hasAppliedStatus = hubStatus?.hasApplied || false;
            break;
          default:
            hasAppliedStatus = false;
        }

        setHasApplied(hasAppliedStatus);

        // If user has applied for an event, check quiz statuses for all stages
        if (hasAppliedStatus && type === "events" && data.stages) {
          await checkQuizStatuses();
          await checkSubmissionStatuses(); // Check submission statuses
          await checkTeamStatus(); // Check team status for hackathons
        }
      } catch (error) {
        console.error("Error checking application status:", error);
        setHasApplied(false);
      }
    };

    checkApplicationStatus();
  }, [data?.id, isAuthenticated, user, type]);

  // Check quiz statuses for all stages
  const checkQuizStatuses = async () => {
    if (!data?.id || !data.stages) return;

    try {
      const statuses = {};
      for (let i = 0; i < data.stages.length; i++) {
        const stage = data.stages[i];
        if (stage.hasQuiz) {
          try {
            console.log(
              `🧠 Checking quiz status for stage ${i}:`,
              stage.quiz?.title,
            );
            const quizStatus = await apiService.getStageQuizStatus(data.id, i);
            console.log(`✅ Quiz status for stage ${i}:`, quizStatus);
            statuses[i] = quizStatus;
          } catch (error) {
            console.error(
              `❌ Error checking quiz status for stage ${i}:`,
              error,
            );
            statuses[i] = {
              hasQuiz: false,
              available: false,
              completed: false,
            };
          }
        }
      }
      console.log("🎯 All quiz statuses:", statuses);
      setQuizStatuses(statuses);
    } catch (error) {
      console.error("Error checking quiz statuses:", error);
    }
  };

  // Check submission statuses for all stages
  const checkSubmissionStatuses = async () => {
    if (!data?.id || !data.stages) return;

    try {
      const statuses = {};
      for (let i = 0; i < data.stages.length; i++) {
        const stage = data.stages[i];
        if (stage.submissions && stage.submissions.length > 0) {
          try {
            console.log(
              `📝 Checking submission status for stage ${i}:`,
              stage.title,
            );
            const submissionStatus = await apiService.getStageSubmissionStatus(
              data.id,
              i,
            );
            console.log(
              `✅ Submission status for stage ${i}:`,
              submissionStatus,
            );
            statuses[i] = submissionStatus;
          } catch (error) {
            console.error(
              `❌ Error checking submission status for stage ${i}:`,
              error,
            );
            statuses[i] = { hasSubmitted: false, submission: null };
          }
        }
      }
      console.log("🎯 All submission statuses:", statuses);
      setSubmissionStatuses(statuses);
    } catch (error) {
      console.error("Error checking submission statuses:", error);
    }
  };

  // Check team status for team-based events
  const checkTeamStatus = async () => {
    if (!data?.id || !needsTeamManagement()) return;

    try {
      // Check if user has a team for this event
      const response = await apiService.getEventTeamStatus(data.id);
      setTeamStatus(response);
    } catch (error) {
      console.error("Error checking team status:", error);
      setTeamStatus({ hasTeam: false, teamId: null });
    }
  };

  // Helper function to check if team can participate (considering deadline)
  const canTeamParticipate = () => {
    if (!teamStatus) return false;

    // If registration deadline passed and team is incomplete, block completely
    if (
      teamStatus.isRegistrationDeadlinePassed &&
      !teamStatus.isEligibleForSubmission
    ) {
      return false;
    }

    return true;
  };

  // Helper function to render team management button
  const renderTeamButton = (stage, index) => {
    if (!teamStatus?.hasTeam) return null;

    return (
      <button
        className="stage-action-btn team-manage"
        onClick={() => handleTeamBuilding(stage, index)}
        title="View and manage your team"
      >
        👥 View Team ({teamStatus.memberCount}/{teamStatus.maxMembers})
      </button>
    );
  };

  // Helper function to check if user is qualified for current stage
  const isQualifiedForStage = (stageIndex) => {
    if (stageIndex === 0) return true; // First stage is always accessible

    // For team-based events, check team evaluation status
    if (needsTeamManagement() && teamStatus?.hasTeam) {
      const evaluations = teamStatus.evaluations || [];
      const previousStageIndex = stageIndex - 1;

      // Find evaluation for previous stage
      const previousEvaluation = evaluations.find(
        (evaluation) => evaluation.stageIndex === previousStageIndex,
      );

      // If no evaluation exists, check if previous stage deadline has passed
      if (!previousEvaluation) {
        const previousStage = data.stages[previousStageIndex];
        const prevDeadline = previousStage?.deadline
          ? new Date(previousStage.deadline)
          : null;
        return prevDeadline && new Date() > prevDeadline; // Allow if deadline passed
      }

      // Check if shortlisted in previous stage
      return previousEvaluation.status === "shortlisted";
    }

    // For non-team events, check if previous stage is completed (deadline passed)
    const previousStage = data.stages[stageIndex - 1];
    const prevDeadline = previousStage?.deadline
      ? new Date(previousStage.deadline)
      : null;
    return prevDeadline && new Date() > prevDeadline;
  };

  // Set default active tab based on type
  useEffect(() => {
    if (type === "jobs") {
      setActiveTab("description");
    } else if (type === "events") {
      setActiveTab("stages");
    } else if (type === "internships") {
      setActiveTab("description");
    }
  }, [type]);

  // Handle scroll to make header sticky and update active tab (scroll spy)
  useEffect(() => {
    const handleScroll = () => {
      // Find the page-content-wrapper element
      const pageWrapper = document.querySelector(".page-content-wrapper");
      if (!pageWrapper) return;

      const scrollTop = pageWrapper.scrollTop;
      const heroHeight = 350; // Hero section height

      // Make header sticky when hero image is scrolled past
      const shouldBeSticky = scrollTop > heroHeight - 50;
      setIsHeaderSticky(shouldBeSticky);

      // Scroll spy - find which section is currently in view
      const config = typeConfig[type];
      if (config && config.tabs) {
        const sections = config.tabs
          .map((tab) => ({
            id: tab.id,
            element: document.getElementById(tab.id),
          }))
          .filter((s) => s.element);

        // Find the section that's currently most visible
        let currentSection = activeTab;
        const viewportTop = pageWrapper.scrollTop + 150; // Offset for header

        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          if (section.element.offsetTop <= viewportTop) {
            currentSection = section.id;
            break;
          }
        }

        if (currentSection !== activeTab) {
          setActiveTab(currentSection);
        }
      }

      // Dispatch custom event to parent (UnifiedDetailsPage) to show/hide main header
      window.dispatchEvent(
        new CustomEvent("modernDetailsScroll", {
          detail: {
            isHeaderSticky: shouldBeSticky,
            activeTab: activeTab,
          },
        }),
      );
    };

    // Attach scroll listener to page-content-wrapper
    const pageWrapper = document.querySelector(".page-content-wrapper");
    if (pageWrapper) {
      pageWrapper.addEventListener("scroll", handleScroll);
      // Initial check
      handleScroll();
      return () => pageWrapper.removeEventListener("scroll", handleScroll);
    }
  }, [activeTab, type]);

  // Scroll to section
  const scrollToSection = (sectionId) => {
    // Update active tab immediately for better UX
    setActiveTab(sectionId);

    const section = document.getElementById(sectionId);
    const pageWrapper = document.querySelector(".page-content-wrapper");

    if (!section) {
      console.error("Section not found:", sectionId);
      return;
    }

    if (pageWrapper) {
      // Calculate the absolute position of the section
      const pageWrapperRect = pageWrapper.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const currentScroll = pageWrapper.scrollTop;

      // Calculate target scroll position
      const targetScroll =
        currentScroll + sectionRect.top - pageWrapperRect.top - 100;

      pageWrapper.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    } else {
      console.error("Page wrapper not found");
    }
  };

  // Make scrollToSection available globally for UnifiedDetailsPage
  useEffect(() => {
    window.modernDetailsScrollToSection = scrollToSection;
    return () => {
      delete window.modernDetailsScrollToSection;
    };
  }, []);

  // Tab configuration - SIMPLIFIED
  const typeConfig = {
    jobs: {
      tabs: [
        { id: "description", label: "Job Description" },
        { id: "reviews", label: "Reviews" },
        { id: "faqs", label: "FAQs & Discussions" },
      ],
    },
    events: {
      tabs: [
        { id: "stages", label: "Stages & Timeline" }, // Single tab for all events
        { id: "details", label: "Details" },
        { id: "prizes", label: "Prizes" },
        { id: "reviews", label: "Reviews" },
        { id: "faqs", label: "FAQs & Discussions" },
        { id: "sponsors", label: "Sponsors" },
      ],
    },
    internships: {
      tabs: [
        { id: "description", label: "Internship Details" },
        { id: "reviews", label: "Reviews" },
        { id: "faqs", label: "FAQs & Discussions" },
      ],
    },
  };

  const getOrganizationName = () => {
    const name =
      data?.company ||
      data?.companyName ||
      data?.organization ||
      data?.organizer;
    // Ensure we return a string, not an object
    if (typeof name === "string") return name;
    if (typeof name === "object" && name !== null) return JSON.stringify(name);
    return "Organization";
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

    if (hasApplied) {
      return;
    }

    try {
      let result = null;

      switch (type) {
        case "jobs":
          result = await apiService.applyToJob(data.id, {
            resumeLink: "",
            coverLetter: "",
          });
          break;
        case "events":
          result = await apiService.registerForEvent(data.id);
          break;
        case "internships":
          result = await apiService.applyToHubContent(data.id);
          break;
        default:
          throw new Error("Unknown application type");
      }

      if (result) {
        console.log("🎉 Registration successful! Setting hasApplied to true");
        console.log("📊 Event stages data:", data.stages);
        setHasApplied(true);
        alert(
          `Successfully registered for ${data.title}! You can now submit for active stages.`,
        );
      }
    } catch (error) {
      const errorMessage = error.message || "Please try again later.";
      console.error("Application error:", error);

      if (errorMessage.includes("Already applied")) {
        alert("You have already applied to this position.");
        setHasApplied(true);
      } else if (errorMessage.includes("not found")) {
        alert("This position is no longer available.");
      } else {
        alert(`Failed to apply: ${errorMessage}`);
      }
    }
  };

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!data?.id) return;

      try {
        // Map frontend types to backend enum values
        const itemTypeMapping = {
          jobs: "job",
          events: "event",
          internships: "internship",
        };

        const mappedItemType = itemTypeMapping[type] || type;
        const response = await apiService.getReviews(data.id, mappedItemType);
        setReviews(response?.reviews || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      }
    };

    fetchReviews();
  }, [data?.id, type]);

  // Submit review
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      alert("Please login to submit a review");
      return;
    }

    if (!reviewText.trim()) {
      alert("Please write a review before submitting");
      return;
    }

    setSubmittingReview(true);
    try {
      // Map frontend types to backend enum values
      const itemTypeMapping = {
        jobs: "job",
        events: "event",
        internships: "internship",
      };

      const mappedItemType = itemTypeMapping[type] || type;
      const reviewData = {
        content: reviewText.trim(),
      };

      const newReview = await apiService.createReview(
        data.id,
        mappedItemType,
        reviewData,
      );

      // Add the new review to the list
      setReviews((prev) => [newReview, ...prev]);
      setReviewText("");
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getDeadlineDisplay = () => {
    if (data?.deadline && typeof data.deadline === "number") {
      return data.deadline;
    }
    if (data?.applicationDeadline) {
      const deadline = new Date(data.applicationDeadline);
      const now = new Date();
      const diffTime = deadline - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    return 30;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to get submission icon based on type
  const getSubmissionIcon = (type) => {
    const icons = {
      ppt: "📊",
      presentation: "📊",
      github: "💻",
      "github-link": "💻",
      "demo-video": "🎥",
      video: "🎥",
      quiz: "📝",
      document: "📄",
      pdf: "📄",
      link: "🔗",
      code: "💻",
      design: "🎨",
      prototype: "🔧",
    };
    return icons[type?.toLowerCase()] || "📎";
  };

  // Helper function to check if event type needs team management
  const needsTeamManagement = () => {
    if (!data?.categories || !Array.isArray(data.categories)) return false;
    const teamBasedTypes = ["hackathon", "competition", "contest", "challenge"];
    return data.categories.some((category) =>
      teamBasedTypes.includes(category.toLowerCase()),
    );
  };

  // Helper function to check if event type needs submission functionality
  const needsSubmissionStages = () => {
    if (!data?.categories || !Array.isArray(data.categories)) return false;
    const submissionTypes = ["hackathon", "competition"];
    return data.categories.some((category) =>
      submissionTypes.includes(category.toLowerCase()),
    );
  };

  // Helper function to determine stage status with sequential logic
  const getStageStatus = (stage, index) => {
    const now = new Date();
    const startDate = stage.startDate ? new Date(stage.startDate) : null;
    const deadline = stage.deadline ? new Date(stage.deadline) : null;

    // Check if user has applied/registered for this event
    const userRegistered = hasApplied;

    if (!userRegistered) {
      return (
        <span className="stage-status-badge not-registered">
          Not Registered
        </span>
      );
    }

    // Sequential logic: Check if user is qualified for this stage
    if (index > 0) {
      if (!isQualifiedForStage(index)) {
        // Check if it's because of evaluation or deadline
        if (needsTeamManagement() && teamStatus?.hasTeam) {
          const evaluations = teamStatus.evaluations || [];
          const previousStageIndex = index - 1;
          const previousEvaluation = evaluations.find(
            (evaluation) => evaluation.stageIndex === previousStageIndex,
          );

          if (previousEvaluation && previousEvaluation.status === "rejected") {
            return (
              <span className="stage-status-badge rejected">
                Not Qualified - Rejected in Previous Stage
              </span>
            );
          } else if (
            previousEvaluation &&
            previousEvaluation.status === "pending"
          ) {
            return (
              <span className="stage-status-badge pending">
                Pending Evaluation
              </span>
            );
          } else if (!previousEvaluation) {
            const previousStage = data.stages[previousStageIndex];
            const prevDeadline = previousStage?.deadline
              ? new Date(previousStage.deadline)
              : null;
            if (prevDeadline && new Date() < prevDeadline) {
              return (
                <span className="stage-status-badge locked">
                  Locked - Complete Previous Stage
                </span>
              );
            } else {
              return (
                <span className="stage-status-badge pending">
                  Awaiting Evaluation Results
                </span>
              );
            }
          }
        } else {
          return (
            <span className="stage-status-badge locked">
              Locked - Complete Previous Stage
            </span>
          );
        }
      }
    }

    // Current stage logic
    if (startDate && now < startDate) {
      return <span className="stage-status-badge upcoming">Upcoming</span>;
    }

    if (deadline && now > deadline) {
      return <span className="stage-status-badge ended">Ended</span>;
    }

    if (startDate && deadline && now >= startDate && now <= deadline) {
      const timeLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      return (
        <div className="stage-status-live">
          <span className="stage-status-badge live">Live</span>
          <span className="time-left">{timeLeft} days left</span>
        </div>
      );
    }

    return <span className="stage-status-badge pending">Pending</span>;
  };

  // Helper function to get stage action button with proper hackathon flow
  const getStageActionButton = (stage, index) => {
    const now = new Date();
    const startDate = stage.startDate ? new Date(stage.startDate) : null;
    const deadline = stage.deadline ? new Date(stage.deadline) : null;

    // If user hasn't registered for the event, show register button
    if (!hasApplied) {
      return (
        <button className="stage-action-btn register" onClick={handleApply}>
          Register for Event
        </button>
      );
    }

    // Check if stage has submissions (only submission stages get submit button)
    const hasSubmissions = stage.submissions && stage.submissions.length > 0;
    const hasQuiz =
      stage.hasQuiz &&
      stage.quiz &&
      stage.quiz.questions &&
      stage.quiz.questions.length > 0;

    // If no submissions and no quiz, show evaluation round
    if (!hasSubmissions && !hasQuiz) {
      if (deadline && now > deadline) {
        return (
          <div className="stage-info-only">
            <span className="stage-status-text">✅ Round Completed</span>
          </div>
        );
      }

      if (startDate && now < startDate) {
        return (
          <div className="stage-info-only">
            <span className="stage-status-text">
              ⏳ Starts {formatDate(startDate)}
            </span>
          </div>
        );
      }

      return (
        <div className="stage-info-only">
          <span className="stage-status-text">
            📋 Evaluation Round - No Submission Required
          </span>
        </div>
      );
    }

    // If stage has quiz but no submissions, handle quiz-only logic
    if (hasQuiz && !hasSubmissions) {
      const quizStatus = quizStatuses[index];

      if (deadline && now > deadline) {
        return (
          <div className="stage-info-only">
            <span className="stage-status-text">✅ Quiz Round Completed</span>
          </div>
        );
      }

      if (startDate && now < startDate) {
        return (
          <div className="stage-info-only">
            <span className="stage-status-text">
              ⏳ Quiz Starts {formatDate(startDate)}
            </span>
          </div>
        );
      }

      if (startDate && deadline && now >= startDate && now <= deadline) {
        if (quizStatus?.completed) {
          return (
            <div className="stage-info-only">
              <span className="stage-status-text">
                ✅ Quiz Completed ({quizStatus.submission?.score}%)
              </span>
            </div>
          );
        } else if (quizStatus?.available !== false) {
          // Show quiz button - check team eligibility and deadline first
          if (!canTeamParticipate()) {
            return (
              <div className="team-deadline-passed">
                <span className="deadline-text">
                  ⏰{" "}
                  {teamStatus?.isRegistrationDeadlinePassed
                    ? "Registration deadline has passed. Team cannot participate."
                    : teamStatus?.eligibilityMessage ||
                      "Team not eligible for quiz"}
                </span>
              </div>
            );
          }

          if (!teamStatus?.isEligibleForSubmission) {
            return (
              <div className="stage-actions-group">
                <div className="team-incomplete-warning">
                  <span className="warning-text">
                    ⚠️{" "}
                    {teamStatus?.eligibilityMessage ||
                      "Team not eligible for quiz"}
                  </span>
                </div>
                {renderTeamButton(stage, index)}
              </div>
            );
          }

          return (
            <button
              className="stage-action-btn quiz"
              onClick={() => handleStartQuiz(stage, index)}
            >
              🧠 Start Quiz - {stage.quiz?.title || "Team Quiz"}
            </button>
          );
        } else {
          return (
            <button className="stage-action-btn disabled" disabled>
              Quiz Not Available
            </button>
          );
        }
      }

      return (
        <button className="stage-action-btn disabled" disabled>
          Quiz Not Available
        </button>
      );
    }

    // Special logic for Stage 1 (Multi-phase for Team-based Events)
    if (index === 0 && needsTeamManagement()) {
      // Multi-phase Stage 1 for team-based events (hackathons, competitions, etc.)
      if (startDate && now < startDate) {
        return (
          <button className="stage-action-btn disabled" disabled>
            Starts {formatDate(startDate)}
          </button>
        );
      }

      if (deadline && now > deadline) {
        // If user has existing team, show team management button
        if (teamStatus?.hasTeam) {
          return (
            <div className="stage-actions-group">
              <div className="stage-info-only">
                <span className="stage-status-text">⏰ Registration Ended</span>
              </div>
              {renderTeamButton(stage, index)}
            </div>
          );
        }

        return (
          <button className="stage-action-btn disabled" disabled>
            Stage 1 Ended
          </button>
        );
      }

      if (startDate && deadline && now >= startDate && now <= deadline) {
        // Phase 1: Team Creation/Management (first priority)
        if (!teamStatus || !teamStatus.hasTeam) {
          return (
            <button
              className="stage-action-btn team-build"
              onClick={() => handleTeamBuilding(stage, index)}
            >
              🏗️ Create Team
            </button>
          );
        } else {
          // User has a team - show team management button
          const teamButton = (
            <button
              className="stage-action-btn team-manage"
              onClick={() => handleTeamBuilding(stage, index)}
              title="View and manage your team"
            >
              👥 View Team ({teamStatus.memberCount}/{teamStatus.maxMembers})
            </button>
          );

          // If team is incomplete and registration deadline hasn't passed, show team button prominently
          if (
            !teamStatus.isEligibleForSubmission &&
            !teamStatus.isRegistrationDeadlinePassed
          ) {
            return teamButton;
          }
        }

        // Team exists - now check stage requirements based on recruiter's configuration
        if (teamStatus.hasTeam) {
          // Priority 1: Quiz (if configured by recruiter)
          if (
            stage.hasQuiz &&
            stage.quiz &&
            stage.quiz.questions &&
            stage.quiz.questions.length > 0
          ) {
            const quizStatus = quizStatuses[index];

            if (quizStatus?.completed) {
              // Quiz completed - check if there are submissions too
              if (hasSubmissions) {
                // Check if already submitted
                const submissionStatus = submissionStatuses[index];
                if (submissionStatus?.hasSubmitted) {
                  return (
                    <div className="stage-actions-group">
                      <div className="quiz-completed-indicator">
                        ✅ Quiz Completed ({quizStatus.submission?.score}%)
                      </div>
                      <div className="submission-completed-indicator">
                        ✅ Project Submitted
                      </div>
                      {renderTeamButton(stage, index)}
                    </div>
                  );
                }

                return (
                  <div className="stage-actions-group">
                    <div className="quiz-completed-indicator">
                      ✅ Quiz Completed ({quizStatus.submission?.score}%)
                    </div>
                    {/* FIRST_SUBMISSION_BUTTON_INSTANCE */}
                    {!canTeamParticipate() ? (
                      <div className="stage-actions-group">
                        <div className="team-deadline-passed">
                          <span className="deadline-text">
                            ⏰ Registration deadline has passed. Team cannot
                            participate.
                          </span>
                        </div>
                        {renderTeamButton(stage, index)}
                      </div>
                    ) : teamStatus?.isEligibleForSubmission ? (
                      <button
                        className="stage-action-btn submit"
                        onClick={() => handleStageSubmission(stage, index)}
                        disabled={!teamStatus?.isLeader}
                        title={
                          !teamStatus?.isLeader
                            ? "Only team leader can submit"
                            : ""
                        }
                      >
                        💡{" "}
                        {teamStatus?.isLeader
                          ? "Submit Project Idea"
                          : "Team Leader Submits"}
                      </button>
                    ) : (
                      <div className="stage-actions-group">
                        <div className="team-incomplete-warning">
                          <span className="warning-text">
                            ⚠️{" "}
                            {teamStatus?.eligibilityMessage ||
                              "Team not eligible for submissions"}
                          </span>
                        </div>
                        {renderTeamButton(stage, index)}
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div className="stage-actions-group">
                    <div className="stage-info-only">
                      <span className="stage-status-text">
                        ✅ Quiz Completed ({quizStatus.submission?.score}%)
                      </span>
                    </div>
                    {renderTeamButton(stage, index)}
                  </div>
                );
              }
            } else if (quizStatus?.available !== false) {
              // Quiz available - check team eligibility and deadline first
              if (!canTeamParticipate()) {
                return (
                  <div className="stage-actions-group">
                    <div className="team-deadline-passed">
                      <span className="deadline-text">
                        ⏰ Registration deadline has passed. Team cannot
                        participate.
                      </span>
                    </div>
                    {renderTeamButton(stage, index)}
                  </div>
                );
              }

              if (!teamStatus?.isEligibleForSubmission) {
                return (
                  <div className="stage-actions-group">
                    <div className="team-incomplete-warning">
                      <span className="warning-text">
                        ⚠️{" "}
                        {teamStatus?.eligibilityMessage ||
                          "Team not eligible for quiz"}
                      </span>
                    </div>
                    {renderTeamButton(stage, index)}
                  </div>
                );
              }

              return (
                <button
                  className="stage-action-btn quiz"
                  onClick={() => handleStartQuiz(stage, index)}
                >
                  🧠 Start Quiz - {stage.quiz?.title || "Stage Quiz"}
                </button>
              );
            } else {
              return (
                <button className="stage-action-btn disabled" disabled>
                  Quiz Not Available
                </button>
              );
            }
          }

          // No quiz, no submissions - team created but show team management
          if (teamStatus?.hasTeam) {
            return renderTeamButton(stage, index);
          }

          return null;
        }
      }

      return (
        <button className="stage-action-btn disabled" disabled>
          Not Available
        </button>
      );
    }

    // Regular Stage 1 logic for non-team events
    if (index === 0 && hasSubmissions && !needsTeamManagement()) {
      // Current submission stage logic for Stage 1
      if (startDate && now < startDate) {
        return (
          <button className="stage-action-btn disabled" disabled>
            Starts {formatDate(startDate)}
          </button>
        );
      }

      if (deadline && now > deadline) {
        return (
          <button className="stage-action-btn disabled" disabled>
            Submission Ended
          </button>
        );
      }

      if (startDate && deadline && now >= startDate && now <= deadline) {
        // Check if already submitted
        const submissionStatus = submissionStatuses[index];
        if (submissionStatus?.hasSubmitted) {
          return (
            <div className="submission-completed-indicator">✅ Submitted</div>
          );
        }

        return (
          <button
            className="stage-action-btn submit"
            onClick={() => handleStageSubmission(stage, index)}
          >
            Submit for {stage.title || `Round ${index + 1}`}
          </button>
        );
      }

      return (
        <button className="stage-action-btn disabled" disabled>
          Not Available
        </button>
      );
    }

    // For submission stages (Stage 2+) - check if user is qualified
    if (index > 0) {
      if (!isQualifiedForStage(index)) {
        // Check if it's because of evaluation or deadline
        if (needsTeamManagement() && teamStatus?.hasTeam) {
          const evaluations = teamStatus.evaluations || [];
          const previousStageIndex = index - 1;
          const previousEvaluation = evaluations.find(
            (evaluation) => evaluation.stageIndex === previousStageIndex,
          );

          if (previousEvaluation && previousEvaluation.status === "rejected") {
            return (
              <button className="stage-action-btn rejected" disabled>
                ❌ Not Qualified
              </button>
            );
          } else if (
            previousEvaluation &&
            previousEvaluation.status === "pending"
          ) {
            return (
              <button className="stage-action-btn pending" disabled>
                ⏳ Awaiting Results
              </button>
            );
          } else if (!previousEvaluation) {
            const previousStage = data.stages[previousStageIndex];
            const prevDeadline = previousStage?.deadline
              ? new Date(previousStage.deadline)
              : null;
            if (prevDeadline && new Date() < prevDeadline) {
              const daysLeft = Math.ceil(
                (prevDeadline - new Date()) / (1000 * 60 * 60 * 24),
              );
              return (
                <button className="stage-action-btn locked" disabled>
                  🔒 Unlocks in {daysLeft} days
                </button>
              );
            } else {
              return (
                <button className="stage-action-btn pending" disabled>
                  ⏳ Awaiting Evaluation
                </button>
              );
            }
          }
        } else {
          const previousStage = data.stages[index - 1];
          const prevDeadline = previousStage?.deadline
            ? new Date(previousStage.deadline)
            : null;
          if (prevDeadline && new Date() < prevDeadline) {
            const daysLeft = Math.ceil(
              (prevDeadline - new Date()) / (1000 * 60 * 60 * 24),
            );
            return (
              <button className="stage-action-btn locked" disabled>
                🔒 Unlocks in {daysLeft} days
              </button>
            );
          }
        }
      }
    }

    // Current submission stage logic
    if (startDate && now < startDate) {
      return (
        <button className="stage-action-btn disabled" disabled>
          Starts {formatDate(startDate)}
        </button>
      );
    }

    if (deadline && now > deadline) {
      return (
        <button className="stage-action-btn disabled" disabled>
          Submission Ended
        </button>
      );
    }

    if (startDate && deadline && now >= startDate && now <= deadline) {
      // Check if stage has a quiz
      const quizStatus = quizStatuses[index];
      if (stage.hasQuiz && quizStatus) {
        if (quizStatus.completed) {
          // Quiz completed, show submission button if there are submissions
          if (hasSubmissions) {
            // Check if already submitted
            const submissionStatus = submissionStatuses[index];
            if (submissionStatus?.hasSubmitted) {
              return (
                <div className="stage-actions-group">
                  <div className="quiz-completed-indicator">
                    ✅ Quiz Completed ({quizStatus.submission?.score}%)
                  </div>
                  <div className="submission-completed-indicator">
                    ✅ Submitted
                  </div>
                </div>
              );
            }

            return (
              <div className="stage-actions-group">
                <div className="quiz-completed-indicator">
                  ✅ Quiz Completed ({quizStatus.submission?.score}%)
                </div>
                <button
                  className="stage-action-btn submit"
                  onClick={() => handleStageSubmission(stage, index)}
                >
                  Submit for {stage.title || `Round ${index + 1}`}
                </button>
              </div>
            );
          } else {
            return (
              <div className="stage-info-only">
                <span className="stage-status-text">
                  ✅ Quiz Completed ({quizStatus.submission?.score}%)
                </span>
              </div>
            );
          }
        } else if (quizStatus.available) {
          // Quiz available - check team eligibility and deadline first
          if (!canTeamParticipate()) {
            return (
              <div className="stage-actions-group">
                <div className="team-deadline-passed">
                  <span className="deadline-text">
                    ⏰ Registration deadline has passed. Team cannot
                    participate.
                  </span>
                </div>
                {renderTeamButton(stage, index)}
              </div>
            );
          }

          if (!teamStatus?.isEligibleForSubmission) {
            return (
              <div className="stage-actions-group">
                <div className="team-incomplete-warning">
                  <span className="warning-text">
                    ⚠️{" "}
                    {teamStatus?.eligibilityMessage ||
                      "Team not eligible for quiz"}
                  </span>
                </div>
                {renderTeamButton(stage, index)}
              </div>
            );
          }

          return (
            <button
              className="stage-action-btn quiz"
              onClick={() => handleStartQuiz(stage, index)}
            >
              🧠 Take Quiz - {stage.quiz?.title || "Stage Quiz"}
            </button>
          );
        } else {
          // Quiz not yet available
          return (
            <button className="stage-action-btn disabled" disabled>
              Quiz Available Soon
            </button>
          );
        }
      }

      // No quiz, regular submission button
      // Check if already submitted
      const submissionStatus = submissionStatuses[index];
      if (submissionStatus?.hasSubmitted) {
        return (
          <div className="submission-completed-indicator">✅ Submitted</div>
        );
      }

      return (
        <button
          className="stage-action-btn submit"
          onClick={() => handleStageSubmission(stage, index)}
        >
          Submit for {stage.title || `Round ${index + 1}`}
        </button>
      );
    }

    return (
      <button className="stage-action-btn disabled" disabled>
        Not Available
      </button>
    );
  };

  // Handler for team building (Stage 1)
  const handleTeamBuilding = (stage, index) => {
    console.log("🏗️ Team building clicked:", { stage, index });
    // Navigate to team building page
    navigate(`/event/${data.id}/team-building`, {
      state: {
        event: data,
        stage: stage,
        stageIndex: index,
      },
    });
  };

  // Handler for stage submission
  const handleStageSubmission = (stage, index) => {
    console.log("🎯 Stage submission clicked:", { stage, index });
    console.log("📝 Stage data:", stage);
    console.log("🔢 Stage index:", index);

    setSelectedStage(stage);
    setSelectedStageIndex(index);
    setShowSubmissionModal(true);

    console.log("✅ Modal should open now");
  };

  // Handler for successful submission
  const handleSubmissionSuccess = async (stageIndex) => {
    // You can update the UI to show submission status
    console.log(`Successfully submitted for stage ${stageIndex}`);
    // Refresh submission statuses to update UI
    await checkSubmissionStatuses();
  };

  // Quiz handlers
  const handleStartQuiz = (stage, index) => {
    console.log("🧠 Quiz clicked:", { stage, index });
    console.log("🎯 Quiz data:", stage.quiz);
    console.log("📊 Quiz status:", quizStatuses[index]);
    setQuizStage(stage);
    setQuizStageIndex(index);
    setShowQuizModal(true);
  };

  const handleQuizComplete = async (results) => {
    console.log("✅ Quiz completed:", results);
    // Refresh quiz statuses
    await checkQuizStatuses();
    setShowQuizModal(false);
  };

  const handleQuizClose = () => {
    setShowQuizModal(false);
    setQuizStage(null);
    setQuizStageIndex(null);
  };

  if (loading) {
    return (
      <div className="modern-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="modern-error">Content not found</div>;
  }

  const config = typeConfig[type] || typeConfig.jobs;

  return (
    <div className="modern-details-page">
      {/* Scrollable Content Wrapper */}
      <div ref={contentRef} className="modern-scroll-wrapper">
        {/* Main Content */}
        <div className="modern-container">
          <div className="modern-content">
            {/* Top Section - Split into 2 columns */}
            <div className="top-section-grid">
              {/* Left Column - Logo, Title, Date, Location, Share */}
              <div className="top-left-column">
                {/* Company Logo */}
                <div className="company-logo">
                  <img
                    src={
                      data.thumbnailImage ||
                      data.companyLogo ||
                      data.logo ||
                      "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(getOrganizationName()) +
                        "&size=120&background=FFD600&color=1a1a1a&bold=true"
                    }
                    alt={getOrganizationName()}
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(getOrganizationName()) +
                        "&size=120&background=FFD600&color=1a1a1a&bold=true";
                    }}
                  />
                </div>

                <h1 className="event-title">{data.title}</h1>

                <div className="company-info">
                  {/* Company Name with Link */}
                  <div className="info-row">
                    <Building className="info-icon" size={20} />
                    {data.companyWebsite || data.website ? (
                      <a
                        href={data.companyWebsite || data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="info-link"
                      >
                        {getOrganizationName()}
                      </a>
                    ) : (
                      <span className="info-text">
                        {getOrganizationName() || "Organization"}
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="info-row">
                    <MapPin className="info-icon" size={20} />
                    <span className="info-text">
                      {(() => {
                        // For jobs: Try to build location from detailed fields first
                        const locationParts = [
                          data.city,
                          data.state,
                          data.country,
                        ].filter(Boolean);
                        if (locationParts.length > 0) {
                          return locationParts.join(", ");
                        }
                        // For internships and events: Use general location field
                        if (data.location && data.location.trim()) {
                          return data.location;
                        }
                        // Final fallback
                        return data.companyLocation || "Location not specified";
                      })()}
                    </span>
                  </div>

                  {/* Updated On - Today's Date */}
                  <div className="info-row">
                    <Calendar className="info-icon" size={20} />
                    <span className="info-text">
                      Updated On:{" "}
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Social Links - Show only if company has provided links */}
                {data.sociallinks &&
                  typeof data.sociallinks === "object" &&
                  Object.keys(data.sociallinks).length > 0 && (
                    <div className="share-section">
                      <span className="share-label">Follow Us</span>
                      <div className="share-buttons">
                        {data.sociallinks.facebook && (
                          <a
                            href={data.sociallinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="share-btn"
                            title="Facebook"
                          >
                            <Facebook size={18} />
                          </a>
                        )}
                        {data.sociallinks.twitter && (
                          <a
                            href={data.sociallinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="share-btn"
                            title="Twitter"
                          >
                            <Twitter size={18} />
                          </a>
                        )}
                        {data.sociallinks.linkedin && (
                          <a
                            href={data.sociallinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="share-btn"
                            title="LinkedIn"
                          >
                            <Linkedin size={18} />
                          </a>
                        )}
                        {data.sociallinks.instagram && (
                          <a
                            href={data.sociallinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="share-btn"
                            title="Instagram"
                          >
                            <Instagram size={18} />
                          </a>
                        )}
                        {data.sociallinks.website && (
                          <a
                            href={data.sociallinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="share-btn"
                            title="Website"
                          >
                            <LinkIcon size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Right Column - Subscribe Card */}
              <div className="top-right-column">
                <div className="subscribe-card">
                  <div className="qr-code-container">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}`}
                      alt="QR Code"
                      className="qr-code-image"
                    />
                  </div>
                  <p className="qr-text">Scan the QR code to invite others.</p>
                  <span className="or-text">or</span>
                  {hasApplied ? (
                    <button
                      className="subscribe-btn whatsapp"
                      onClick={() =>
                        window.open(
                          "https://whatsapp.com/channel/0029VajVGJP4hdQFX6j3Eo1I",
                          "_blank",
                        )
                      }
                    >
                      Join WhatsApp Channel
                    </button>
                  ) : (
                    <button className="subscribe-btn" onClick={handleApply}>
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs - Below top section, full width */}
            {!isHeaderSticky && (
              <div className="modern-tabs-wrapper">
                <div className="modern-tabs">
                  {config.tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`modern-tab ${activeTab === tab.id ? "active" : ""}`}
                      onClick={() => scrollToSection(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Details Section - Job/Internship */}
            {(type === "jobs" || type === "internships") && (
              <div id="description" className="details-section">
                <h2 className="section-title">
                  {type === "jobs" ? "Job Details" : "Internship Details"}
                </h2>
                <div className="details-content">
                  {/* Description */}
                  <div className="details-subsection">
                    <h3 className="subsection-title">Description:</h3>
                    {data.description &&
                    typeof data.description === "string" &&
                    data.description.trim() ? (
                      <div className="details-text">
                        {data.description
                          .split("\n")
                          .map(
                            (line, index) =>
                              line.trim() && <p key={index}>{line.trim()}</p>,
                          )}
                      </div>
                    ) : data.description &&
                      typeof data.description === "object" ? (
                      <div className="details-text">
                        <p>{JSON.stringify(data.description)}</p>
                      </div>
                    ) : (
                      <p className="no-details-message">No data</p>
                    )}
                  </div>

                  {/* Problem Statement - Moved to Event Information section */}

                  {/* Responsibilities - Array or String */}
                  <div className="details-subsection">
                    <h3 className="subsection-title">
                      Responsibilities of the{" "}
                      {type === "jobs" ? "Job" : "Intern"}:
                    </h3>
                    {data.responsibilities &&
                      (Array.isArray(data.responsibilities) &&
                      data.responsibilities.length > 0 ? (
                        <ul className="details-list">
                          {data.responsibilities.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : typeof data.responsibilities === "string" &&
                        data.responsibilities.trim() ? (
                        <ul className="details-list">
                          {data.responsibilities
                            .split("\n")
                            .map(
                              (line, index) =>
                                line.trim() && (
                                  <li key={index}>{line.trim()}</li>
                                ),
                            )}
                        </ul>
                      ) : typeof data.responsibilities === "object" &&
                        data.responsibilities !== null ? (
                        <div className="details-text">
                          <p>{JSON.stringify(data.responsibilities)}</p>
                        </div>
                      ) : (
                        <p className="no-details-message">No data</p>
                      ))}
                    {!data.responsibilities && (
                      <p className="no-details-message">No data</p>
                    )}
                  </div>

                  {/* Requirements - Array or String */}
                  <div className="details-subsection">
                    <h3 className="subsection-title">Requirements:</h3>
                    {data.requirements &&
                      (Array.isArray(data.requirements) &&
                      data.requirements.length > 0 ? (
                        <ul className="details-list">
                          {data.requirements.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : typeof data.requirements === "string" &&
                        data.requirements.trim() ? (
                        <ul className="details-list">
                          {data.requirements
                            .split("\n")
                            .map(
                              (line, index) =>
                                line.trim() && (
                                  <li key={index}>{line.trim()}</li>
                                ),
                            )}
                        </ul>
                      ) : typeof data.requirements === "object" &&
                        data.requirements !== null ? (
                        <div className="details-text">
                          <p>{JSON.stringify(data.requirements)}</p>
                        </div>
                      ) : (
                        <p className="no-details-message">No data</p>
                      ))}
                    {!data.requirements && (
                      <p className="no-details-message">No data</p>
                    )}
                  </div>

                  {/* Qualifications - Jobs only */}
                  {type === "jobs" && (
                    <div className="details-subsection">
                      <h3 className="subsection-title">Qualifications:</h3>
                      {data.qualifications &&
                        (typeof data.qualifications === "string" &&
                        data.qualifications.trim() ? (
                          <ul className="details-list">
                            {data.qualifications
                              .split("\n")
                              .map(
                                (line, index) =>
                                  line.trim() && (
                                    <li key={index}>{line.trim()}</li>
                                  ),
                              )}
                          </ul>
                        ) : Array.isArray(data.qualifications) &&
                          data.qualifications.length > 0 ? (
                          <ul className="details-list">
                            {data.qualifications.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="no-details-message">No data</p>
                        ))}
                      {!data.qualifications && (
                        <p className="no-details-message">No data</p>
                      )}
                    </div>
                  )}

                  {/* Perks & Benefits */}
                  <div className="details-subsection">
                    <h3 className="subsection-title">Perks & Benefits:</h3>
                    {data.benefits &&
                      (typeof data.benefits === "string" &&
                      data.benefits.trim() ? (
                        <ul className="details-list">
                          {data.benefits
                            .split("\n")
                            .map(
                              (line, index) =>
                                line.trim() && (
                                  <li key={index}>{line.trim()}</li>
                                ),
                            )}
                        </ul>
                      ) : Array.isArray(data.benefits) &&
                        data.benefits.length > 0 ? (
                        <ul className="details-list">
                          {data.benefits.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-details-message">No data</p>
                      ))}
                    {!data.benefits && (
                      <p className="no-details-message">No data</p>
                    )}
                  </div>

                  {/* Perks - Jobs only */}
                  {type === "jobs" &&
                    data.perks &&
                    Array.isArray(data.perks) &&
                    data.perks.length > 0 && (
                      <div className="details-subsection">
                        <h3 className="subsection-title">Perks:</h3>
                        <div className="tags-display">
                          {data.perks.map((perk, index) => (
                            <span key={index} className="tag-item">
                              {perk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Skills */}
                  {data.skills &&
                    Array.isArray(data.skills) &&
                    data.skills.length > 0 && (
                      <div className="details-subsection">
                        <h3 className="subsection-title">Required Skills:</h3>
                        <div className="tags-display">
                          {data.skills.map((skill, index) => (
                            <span key={index} className="tag-item skill-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Job Details - Additional Info */}
                  <div className="details-subsection">
                    <h3 className="subsection-title">Job Information:</h3>
                    <div className="job-info-grid">
                      {data.jobType && (
                        <div className="info-item">
                          <strong>Job Type:</strong>
                          <span>{data.jobType}</span>
                        </div>
                      )}
                      {data.department && (
                        <div className="info-item">
                          <strong>Department:</strong>
                          <span>{data.department}</span>
                        </div>
                      )}
                      {data.numberOfPositions && (
                        <div className="info-item">
                          <strong>Positions Available:</strong>
                          <span>{data.numberOfPositions}</span>
                        </div>
                      )}
                      {data.locationType && (
                        <div className="info-item">
                          <strong>Work Type:</strong>
                          <span>{data.locationType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event Stages Section */}
            {type === "events" && (
              <div id="stages" className="details-section">
                <h2 className="section-title">Stages and Timeline</h2>
                <div className="details-content">
                  {data.stages &&
                  Array.isArray(data.stages) &&
                  data.stages.length > 0 ? (
                    <div className="timeline-container">
                      {data.stages.map((stage, index) => {
                        const now = new Date();
                        const startDate = stage.startDate
                          ? new Date(stage.startDate)
                          : null;
                        const deadline = stage.deadline
                          ? new Date(stage.deadline)
                          : null;

                        // Determine if stage is locked (previous stage not ended)
                        let isLocked = false;
                        if (index > 0) {
                          const previousStage = data.stages[index - 1];
                          const prevDeadline = previousStage.deadline
                            ? new Date(previousStage.deadline)
                            : null;
                          isLocked = prevDeadline && now < prevDeadline;
                        }

                        // Determine stage status
                        let stageStatus = "upcoming";
                        if (!hasApplied) {
                          stageStatus = "not-registered";
                        } else if (isLocked) {
                          stageStatus = "locked";
                        } else if (startDate && now < startDate) {
                          stageStatus = "upcoming";
                        } else if (deadline && now > deadline) {
                          stageStatus = "ended";
                        } else if (
                          startDate &&
                          deadline &&
                          now >= startDate &&
                          now <= deadline
                        ) {
                          stageStatus = "live";
                        } else {
                          stageStatus = "pending";
                        }

                        return (
                          <div
                            key={index}
                            className={`timeline-stage ${stageStatus}`}
                          >
                            {/* Stage Number Circle */}
                            <div className="stage-number-circle">
                              <span className="stage-number">{index + 1}</span>
                            </div>

                            {/* Connecting Line */}
                            {index < data.stages.length - 1 && (
                              <div className="stage-connecting-line"></div>
                            )}

                            {/* Stage Content Card */}
                            <div className="stage-content-card">
                              {/* Date Range Header */}
                              <div className="stage-date-header">
                                <span className="stage-dates">
                                  {startDate && formatDate(startDate)}
                                  {startDate && formatTime(startDate)} IST
                                  {deadline && (
                                    <>
                                      {" "}
                                      → {formatDate(deadline)}{" "}
                                      {formatTime(deadline)} IST
                                    </>
                                  )}
                                </span>
                              </div>

                              {/* Stage Title and Status */}
                              <div className="stage-header-row">
                                <h3 className="stage-title-text">
                                  {stage.title || `Round ${index + 1}`}
                                </h3>
                                <div className="stage-status-indicator">
                                  {stageStatus === "live" && (
                                    <span className="status-badge live">
                                      <span className="live-dot"></span>
                                      Live
                                    </span>
                                  )}
                                  {stageStatus === "ended" && (
                                    <span className="status-badge ended">
                                      Ended
                                    </span>
                                  )}
                                  {stageStatus === "locked" && (
                                    <span className="status-badge locked">
                                      🔒 Locked
                                    </span>
                                  )}
                                  {stageStatus === "upcoming" && (
                                    <span className="status-badge upcoming">
                                      Upcoming
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Stage Description */}
                              <div className="stage-description-text">
                                <p>{stage.description}</p>
                              </div>

                              {/* Quiz Requirements */}
                              {stage.hasQuiz && stage.quiz && (
                                <div className="stage-requirements">
                                  <h4 className="requirements-title">
                                    Stage Quiz:
                                  </h4>
                                  <div className="requirements-list">
                                    <div className="quiz-requirement-item">
                                      <div className="quiz-requirement-icon">
                                        🧠
                                      </div>
                                      <div className="quiz-requirement-details">
                                        <span className="quiz-requirement-label">
                                          {stage.quiz.title ||
                                            "Stage Assessment Quiz"}
                                        </span>
                                        {stage.quiz.description && (
                                          <span className="quiz-requirement-desc">
                                            {stage.quiz.description}
                                          </span>
                                        )}
                                        <span className="quiz-requirement-time">
                                          Time Limit:{" "}
                                          {stage.quiz.timeLimit || 30} minutes •
                                          Questions:{" "}
                                          {stage.quiz.questions?.length || 0} •
                                          Passing Score: 70%
                                        </span>
                                        {quizStatuses[index]?.completed && (
                                          <span
                                            className="quiz-requirement-desc"
                                            style={{
                                              color: "#4CAF50",
                                              fontWeight: "500",
                                            }}
                                          >
                                            ✅ Completed with{" "}
                                            {
                                              quizStatuses[index].submission
                                                ?.score
                                            }
                                            % score
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Action Button */}
                              <div className="stage-action-area">
                                {getStageActionButton(stage, index)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : data.agenda &&
                    Array.isArray(data.agenda) &&
                    data.agenda.length > 0 ? (
                    // Fallback to old agenda format
                    <div className="details-subsection">
                      {data.agenda.map((item, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-date">
                            {item.time || "TBD"}
                          </div>
                          <div className="timeline-content">
                            <h4>{item.title || "Event Stage"}</h4>
                            <p>
                              {item.description || "No description available"}
                            </p>
                            {item.speaker && (
                              <span className="speaker-info">
                                Speaker: {item.speaker}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data">
                      <p>Event stages will be updated soon.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Event Details Section - Only for Events */}
            {type === "events" && (
              <div id="details" className="details-section">
                <h2 className="section-title">Event Details</h2>

                <div className="details-content">
                  <div>
                    {/* Description */}
                    <div className="details-subsection">
                      <h3 className="subsection-title">Description:</h3>
                      <div className="details-text">
                        {data.description &&
                        typeof data.description === "string" &&
                        data.description.trim() ? (
                          data.description
                            .split("\n")
                            .map(
                              (line, index) =>
                                line.trim() && <p key={index}>{line.trim()}</p>,
                            )
                        ) : data.description &&
                          typeof data.description === "object" ? (
                          <p>{JSON.stringify(data.description)}</p>
                        ) : (
                          <p className="no-details-message">No data</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Event Information */}
                  <div className="details-subsection">
                    <h3 className="subsection-title">Event Information</h3>
                    <div className="event-info-grid">
                      <div className="info-item">
                        <strong>Event Type:</strong>
                        <span>
                          {data.categories && data.categories[0]
                            ? data.categories[0]
                            : "Workshop"}
                        </span>
                      </div>
                      <div className="info-item">
                        <strong>Location Type:</strong>
                        <span>{data.locationType || "Online"}</span>
                      </div>
                      {data.maxParticipants && (
                        <div className="info-item">
                          <strong>Max Participants:</strong>
                          <span>{data.maxParticipants}</span>
                        </div>
                      )}
                      {data.registrationFee && (
                        <div className="info-item">
                          <strong>Registration Fee:</strong>
                          <span>
                            {data.registrationFee.type === "free"
                              ? "Free"
                              : `${data.registrationFee.currency || "₹"}${data.registrationFee.amount}`}
                          </span>
                        </div>
                      )}
                      {/* Problem Statement */}
                      {data.problemStatements &&
                        data.problemStatements.type && (
                          <div className="info-item">
                            <strong>Problem Statement:</strong>
                            <span>
                              {data.problemStatements.type === "link" && (
                                <a
                                  href={data.problemStatements.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="problem-statement-link"
                                  style={{
                                    color: "#007bff",
                                    textDecoration: "none",
                                  }}
                                >
                                  🔗 View Problem Statement
                                </a>
                              )}
                              {data.problemStatements.type === "pdf" && (
                                <a
                                  href={data.problemStatements.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="problem-statement-link"
                                  style={{
                                    color: "#007bff",
                                    textDecoration: "none",
                                  }}
                                >
                                  📄 Download PDF
                                </a>
                              )}
                              {data.problemStatements.type === "ppt" && (
                                <a
                                  href={data.problemStatements.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="problem-statement-link"
                                  style={{
                                    color: "#007bff",
                                    textDecoration: "none",
                                  }}
                                >
                                  📊 Download Presentation
                                </a>
                              )}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Speakers */}
                  {data.speakers &&
                    Array.isArray(data.speakers) &&
                    data.speakers.length > 0 && (
                      <div className="details-subsection">
                        <h3 className="subsection-title">Speakers</h3>
                        <div className="speakers-grid">
                          {data.speakers.map((speaker, index) => (
                            <div key={index} className="speaker-card">
                              {speaker.image && (
                                <img
                                  src={speaker.image}
                                  alt={speaker.name}
                                  className="speaker-image"
                                />
                              )}
                              <div className="speaker-info">
                                <h4>{speaker.name}</h4>
                                <p className="speaker-title">{speaker.title}</p>
                                {speaker.bio && (
                                  <p className="speaker-bio">{speaker.bio}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Prizes Section (Events only) */}
            {type === "events" &&
              data.prizes &&
              Array.isArray(data.prizes) &&
              data.prizes.length > 0 && (
                <div id="prizes" className="details-section">
                  <h2 className="section-title">Rewards and Prizes</h2>
                  <div className="details-content">
                    <div className="prizes-list">
                      {data.prizes.map((prize, index) => (
                        <div key={index} className="prize-item">
                          <div className="prize-header">
                            <h3 className="prize-position">{prize.position}</h3>
                            <span className="prize-amount">{prize.prize}</span>
                          </div>
                          {prize.description && (
                            <p className="prize-description">
                              {prize.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* Photos and Videos Section - Only for Events */}
            {type === "events" && (
              <div id="media" className="media-section">
                <h2 className="section-title">Event Photos And Videos</h2>
                {data.media &&
                Array.isArray(data.media) &&
                data.media.length > 0 ? (
                  <div className="media-grid">
                    {data.media.map((item, index) => (
                      <div
                        key={index}
                        className="media-item"
                        onClick={() => setSelectedMedia(item)}
                        style={{ cursor: "pointer" }}
                      >
                        {item.type === "video" ? (
                          <div className="video-wrapper">
                            <img src={item.thumbnail} alt="Video thumbnail" />
                            <div className="play-button">▶</div>
                          </div>
                        ) : (
                          <img src={item.url} alt="Media" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-details-message">No data</p>
                )}
              </div>
            )}

            {/* Reviews Section */}
            <div id="reviews" className="details-section">
              <h2 className="section-title">Reviews</h2>
              <div className="details-content">
                <div className="reviews-container">
                  {/* Display existing reviews */}
                  <div className="reviews-list">
                    {reviews.length > 0 ? (
                      reviews.map((review, index) => (
                        <div key={index} className="review-item">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <span className="reviewer-name">
                                {review.author?.fullName ||
                                  review.author?.email ||
                                  "Anonymous"}
                              </span>
                              <span className="review-date">
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="review-content">
                            <p>{review.comment || review.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-details-message">
                        No reviews yet. Be the first to review!
                      </p>
                    )}
                  </div>

                  {/* Add Review Form - Only show if user is authenticated */}
                  {isAuthenticated && (
                    <div className="feedback-form">
                      <h3 className="subsection-title">Write a Review</h3>
                      <textarea
                        className="feedback-textarea"
                        placeholder="Share your experience..."
                        rows="4"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      ></textarea>
                      <div className="feedback-actions">
                        <button
                          className="feedback-submit-btn"
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FAQs Section */}
            <div id="faqs" className="details-section">
              <h2 className="section-title">FAQs & Discussions</h2>
              <div className="details-content">
                {data?.faqs && data.faqs.length > 0 ? (
                  <div className="faqs-list">
                    {data.faqs.map((faq, index) => (
                      <div key={index} className="faq-item">
                        <div className="faq-question">
                          <h4>Q: {faq.question}</h4>
                        </div>
                        <div className="faq-answer">
                          <p>A: {faq.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-details-message">No FAQs available</p>
                )}
              </div>
            </div>

            {/* Sponsors Section - Only for Events */}
            {type === "events" && (
              <div id="sponsors" className="details-section">
                <h2 className="section-title">Event Sponsors</h2>
                <div className="details-content">
                  {data?.sponsors && data.sponsors.length > 0 ? (
                    <div className="sponsors-grid">
                      {data.sponsors.map((sponsor, index) => (
                        <div key={index} className="sponsor-card">
                          <div className="sponsor-logo">
                            {sponsor.logo ? (
                              <img
                                src={sponsor.logo}
                                alt={sponsor.name}
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sponsor.name)}&size=120&background=FFD600&color=1a1a1a&bold=true`;
                                }}
                              />
                            ) : (
                              <div className="sponsor-placeholder">
                                <span>{sponsor.name?.charAt(0) || "S"}</span>
                              </div>
                            )}
                            <div
                              className={`sponsor-tier ${sponsor.tier?.toLowerCase() || "bronze"}`}
                            >
                              {sponsor.tier || "Bronze"}
                            </div>
                          </div>
                          <div className="sponsor-info">
                            <h3 className="sponsor-name">{sponsor.name}</h3>
                            {sponsor.website && (
                              <a
                                href={sponsor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sponsor-website"
                              >
                                Visit Website
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-details-message">
                      No sponsors information available
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Media Modal */}
            {selectedMedia && (
              <div
                className="media-modal"
                onClick={() => setSelectedMedia(null)}
              >
                <div
                  className="media-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="media-modal-close"
                    onClick={() => setSelectedMedia(null)}
                  >
                    ✕
                  </button>
                  {selectedMedia.type === "video" ? (
                    <div className="video-container">
                      {selectedMedia.url &&
                      (selectedMedia.url.includes("youtube.com") ||
                        selectedMedia.url.includes("youtu.be")) ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={selectedMedia.url
                            .replace("watch?v=", "embed/")
                            .replace("youtu.be/", "youtube.com/embed/")}
                          title="Video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : selectedMedia.videoUrl ? (
                        // Use videoUrl if available (separate from thumbnail)
                        <video
                          width="100%"
                          height="100%"
                          controls
                          preload="metadata"
                          style={{ maxHeight: "70vh", backgroundColor: "#000" }}
                          onError={(e) => {
                            console.error("Video load error:", e);
                            e.target.style.display = "none";
                            // Show fallback message
                            const fallback = e.target.nextElementSibling;
                            if (fallback) fallback.style.display = "block";
                          }}
                          // onLoadStart={() => console.log('Video loading started:', selectedMedia.videoUrl)}
                        >
                          <source
                            src={selectedMedia.videoUrl}
                            type="video/mp4"
                          />
                          <source
                            src={selectedMedia.videoUrl}
                            type="video/webm"
                          />
                          <source
                            src={selectedMedia.videoUrl}
                            type="video/ogg"
                          />
                          Your browser does not support the video tag.
                        </video>
                      ) : selectedMedia.url ? (
                        // Fallback to url property
                        <video
                          width="100%"
                          height="100%"
                          controls
                          preload="metadata"
                          style={{ maxHeight: "70vh", backgroundColor: "#000" }}
                          onError={(e) => {
                            console.error("Video load error:", e);
                            //  console.log('Video URL:', selectedMedia.url);
                            e.target.style.display = "none";
                            // Show fallback message
                            const fallback = e.target.nextElementSibling;
                            if (fallback) fallback.style.display = "block";
                          }}
                          //  onLoadStart={() => console.log('Video loading started:', selectedMedia.url)}
                        >
                          <source src={selectedMedia.url} type="video/mp4" />
                          <source src={selectedMedia.url} type="video/webm" />
                          <source src={selectedMedia.url} type="video/ogg" />
                          Your browser does not support the video tag.
                        </video>
                      ) : null}

                      {/* Fallback message for failed videos */}
                      <div
                        style={{
                          display: "none",
                          color: "white",
                          textAlign: "center",
                          padding: "2rem",
                          backgroundColor: "#000",
                          borderRadius: "8px",
                        }}
                      >
                        <p>Unable to load video</p>
                        <p style={{ fontSize: "14px", opacity: 0.7 }}>
                          The video format may not be supported or the file may
                          be unavailable.
                        </p>
                        {(selectedMedia.videoUrl || selectedMedia.url) && (
                          <a
                            href={selectedMedia.videoUrl || selectedMedia.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#FFD600",
                              textDecoration: "underline",
                            }}
                          >
                            Try opening video in new tab
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <img
                      src={selectedMedia.url}
                      alt="Full size"
                      className="modal-image"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* End Scrollable Wrapper */}

      {/* Stage Submission Modal */}
      <StageSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        stage={selectedStage}
        stageIndex={selectedStageIndex}
        eventId={data?.id}
        eventTitle={data?.title}
        onSubmissionSuccess={handleSubmissionSuccess}
      />

      {/* Quiz Modal */}
      {showQuizModal && quizStage && (
        <div className="modal-overlay quiz-modal-overlay">
          <div className="modal-container quiz-modal-container">
            <QuizInterface
              eventId={data?.id}
              stageIndex={quizStageIndex}
              stage={quizStage}
              onQuizComplete={handleQuizComplete}
              onClose={handleQuizClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDetailsPage;
