import { useState } from "react";
import { X, ChevronRight, Trophy, Briefcase, ClipboardCheck, Target, Code, Building, Globe, GraduationCap, Lock } from "lucide-react";
import "./HostModal.css";

const HostModal = ({ isOpen, onClose, onTabChange, onOpenModal, authUser }) => {
  const [currentView, setCurrentView] = useState("main"); // main, opportunity, jobs

  if (!isOpen) return null;

  const handleBackToMain = () => {
    setCurrentView("main");
  };

  const handleOpportunityClick = () => {
    setCurrentView("opportunity");
  };

  const handleJobsClick = () => {
    setCurrentView("jobs");
  };

  const handleJobSelect = () => {
    onClose();
    if (onTabChange) onTabChange("jobs", "job");
  };

  const handleInternshipSelect = () => {
    onClose();
    if (onTabChange) onTabChange("jobs", "internship");
  };

  const handleOpportunityTypeSelect = (type) => {
    onClose();
    if (onTabChange) onTabChange("events", "event");
  };

  const handleOrganizerDashboard = () => {
    onClose();
    // Navigate to organizer dashboard or show message
  };

  return (
    <div className="host-modal-overlay" onClick={onClose}>
      <div className="host-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="host-modal-header">
          <h2>{currentView === "main" ? "Host" : currentView === "opportunity" ? "Select Opportunity" : "Select Jobs & Internships"}</h2>
          <button className="host-modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="host-modal-content">
          {currentView === "main" && (
            <>
              {/* Opportunity */}
              <button className="host-menu-item" onClick={handleOpportunityClick}>
                <div className="host-menu-icon">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>Opportunity</h3>
                  <p>Engage your target audience</p>
                </div>
                <ChevronRight className="host-menu-arrow w-5 h-5" />
              </button>

              {/* Jobs & Internships */}
              <button className="host-menu-item" onClick={handleJobsClick}>
                <div className="host-menu-icon">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>Jobs & Internships</h3>
                  <p>Hire the Right Talent</p>
                </div>
                <ChevronRight className="host-menu-arrow w-5 h-5" />
              </button>

              {/* Assessments */}
              <button className="host-menu-item host-menu-item-locked">
                <div className="host-menu-icon">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>Assessments</h3>
                  <p>Evaluate candidates</p>
                </div>
                <div className="host-upgrade-badge">
                  <Lock className="w-3 h-3" />
                  <span>Upgrade</span>
                </div>
              </button>

              {/* Divider */}
              <div className="host-menu-divider"></div>

              {/* Go to organizer dashboard */}
              <button className="host-menu-item" onClick={handleOrganizerDashboard}>
                <div className="host-menu-icon">
                  <Target className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>Go to organizer dashboard</h3>
                  <p>Manage listing, Festivals, Assessments</p>
                </div>
                <ChevronRight className="host-menu-arrow w-5 h-5" />
              </button>
            </>
          )}

          {currentView === "opportunity" && (
            <>
              {/* Back button */}
              <button className="host-back-button" onClick={handleBackToMain}>
                <ChevronRight className="w-5 h-5" style={{ transform: "rotate(180deg)" }} />
                <span>Back</span>
              </button>

              {/* General & Case Competitions */}
              <button className="host-menu-item" onClick={() => handleOpportunityTypeSelect("competition")}>
                <div className="host-menu-icon">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>General & Case Competitions</h3>
                  <p>Identify analytical talent and problem-solvers</p>
                </div>
                <div className="host-add-icon">+</div>
              </button>

              {/* Quizzes */}
              <button className="host-menu-item" onClick={() => handleOpportunityTypeSelect("quiz")}>
                <div className="host-menu-icon">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>Quizzes</h3>
                  <p>Assess domain knowledge efficiently</p>
                </div>
                <div className="host-add-icon">+</div>
              </button>

              {/* Hackathons & Coding Challenges */}
              <button className="host-menu-item" onClick={() => handleOpportunityTypeSelect("hackathon")}>
                <div className="host-menu-icon">
                  <Code className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>Hackathons & Coding Challenges</h3>
                  <p>Evaluate technical skills and abilities in action</p>
                </div>
                <div className="host-add-icon">+</div>
              </button>

              {/* Webinars, Conferences & Workshops */}
              <button className="host-menu-item" onClick={() => handleOpportunityTypeSelect("webinar")}>
                <div className="host-menu-icon">
                  <Building className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>Webinars, Conferences & Workshops</h3>
                  <p>Engage with potential candidates through hosting</p>
                </div>
                <div className="host-add-icon">+</div>
              </button>

              {/* Cultural Events */}
              <button className="host-menu-item" onClick={() => handleOpportunityTypeSelect("cultural")}>
                <div className="host-menu-icon">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>Cultural Events</h3>
                  <p>Invite candidates to your college festivals</p>
                </div>
                <div className="host-add-icon">+</div>
              </button>

              {/* Scholarships */}
              <button className="host-menu-item" onClick={() => handleOpportunityTypeSelect("scholarship")}>
                <div className="host-menu-icon">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>Scholarships</h3>
                  <p>Support promising talent early in their careers</p>
                </div>
                <div className="host-add-icon">+</div>
              </button>
            </>
          )}

          {currentView === "jobs" && (
            <>
              {/* Back button */}
              <button className="host-back-button" onClick={handleBackToMain}>
                <ChevronRight className="w-5 h-5" style={{ transform: "rotate(180deg)" }} />
                <span>Back</span>
              </button>

              {/* Jobs */}
              <button className="host-menu-item" onClick={handleJobSelect}>
                <div className="host-menu-icon">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>Jobs</h3>
                  <p>Fill permanent positions with qualified professionals</p>
                </div>
                <div className="host-add-icon">+</div>
              </button>

              {/* Internships */}
              <button className="host-menu-item" onClick={handleInternshipSelect}>
                <div className="host-menu-icon">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="host-menu-text">
                  <h3>Internships</h3>
                  <p>Build your talent pipeline with emerging prospects</p>
                </div>
                <div className="host-add-icon">+</div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostModal;
