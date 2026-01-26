import { useState, useEffect } from "react";
import {
  X,
  Search,
  Download,
  Mail,
  FileText,
  MapPin,
  Calendar,
  User,
  Phone,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import "./JobEvaluationOverlay.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

// Job Evaluation Overlay Component
const JobEvaluationOverlay = ({ job, internship, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all"); // For left sidebar stages
  const [selectedStatus, setSelectedStatus] = useState("all"); // For top tabs status filter
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const isInternship = !!internship;
  const item = job || internship;

  // Status filters for top tabs
  const statusFilters = ["all", "in-progress", "shortlisted", "rejected"];

  // Custom recruitment stages for left sidebar
  const customStages = item.stages || [];
  const hasCustomStages = customStages && customStages.length > 0;

  useEffect(() => {
    fetchApplications();
  }, [item.id]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const endpoint = isInternship
        ? `${API_URL}/hub-content/${item.id}/applications`
        : `${API_URL}/jobs/${item.id}/applications`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Applications received:", data.applications?.length);

        // Debug: Check stage data
        data.applications?.forEach((app) => {
          if (app.currentStage !== null && app.currentStage !== undefined) {
            console.log("  - App with stage:", {
              id: app.id,
              candidate: app.user?.fullName,
              currentStage: app.currentStage,
              stageSubmissions: app.stageSubmissions,
            });
          }
        });

        setApplications(data.applications || []);
      } else {
        toast.error("Failed to load applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const endpoint = isInternship
        ? `${API_URL}/hub-content/applications/${applicationId}/status`
        : `${API_URL}/jobs/applications/${applicationId}/status`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Status updated successfully");
        fetchApplications();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const moveToNextStage = async (applicationId, nextStageIndex) => {
    try {
      const endpoint = isInternship
        ? `${API_URL}/hub-content/applications/${applicationId}/move-stage`
        : `${API_URL}/jobs/applications/${applicationId}/move-stage`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ stageIndex: nextStageIndex }),
      });

      if (response.ok) {
        toast.success("Candidate moved to next stage");
        fetchApplications();
      } else {
        toast.error("Failed to move candidate");
      }
    } catch (error) {
      console.error("Error moving to next stage:", error);
      toast.error("Failed to move candidate");
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by stage (left sidebar)
    let matchesStage = false;
    if (selectedStage === "all") {
      matchesStage = true;
    } else if (selectedStage === "finalized") {
      matchesStage = app.status === "hired" || app.status === "offered";
    } else if (selectedStage.startsWith("stage-")) {
      const stageIndex = parseInt(selectedStage.split("-")[1]);
      // Show only candidates who:
      // 1. Are at this stage (currentStage matches)
      // 2. Have submitted their assessment (have stageSubmissions for this stage)
      const hasSubmission =
        app.stageSubmissions &&
        app.stageSubmissions.some((sub) => sub.stageIndex === stageIndex);

      // Debug logging
      if (app.currentStage === stageIndex) {
        console.log("Stage filter check:", {
          candidateName: app.user?.fullName,
          currentStage: app.currentStage,
          stageIndex,
          hasSubmissions: !!app.stageSubmissions,
          submissionsCount: app.stageSubmissions?.length || 0,
          hasSubmissionForStage: hasSubmission,
        });
      }

      matchesStage = app.currentStage === stageIndex && hasSubmission;
    }

    // Filter by status (top tabs)
    let matchesStatus = false;
    if (selectedStatus === "all") {
      matchesStatus = true;
    } else if (selectedStatus === "in-progress") {
      matchesStatus =
        app.status === "applied" ||
        app.status === "pending" ||
        app.status === "reviewing";
    } else if (selectedStatus === "shortlisted") {
      matchesStatus =
        app.status === "shortlisted" || app.status === "interview";
    } else if (selectedStatus === "rejected") {
      matchesStatus = app.status === "rejected";
    }

    return matchesSearch && matchesStage && matchesStatus;
  });

  const getStageCount = (stageKey) => {
    if (stageKey === "all") return applications.length;
    if (stageKey === "finalized")
      return applications.filter(
        (app) => app.status === "hired" || app.status === "offered",
      ).length;
    if (stageKey.startsWith("stage-")) {
      const stageIndex = parseInt(stageKey.split("-")[1]);
      // Count only candidates who have submitted for this stage
      return applications.filter(
        (app) =>
          app.currentStage === stageIndex &&
          app.stageSubmissions &&
          app.stageSubmissions.some((sub) => sub.stageIndex === stageIndex),
      ).length;
    }
    return 0;
  };

  const getStatusCount = (status) => {
    if (status === "all") return applications.length;
    if (status === "in-progress")
      return applications.filter(
        (app) =>
          app.status === "applied" ||
          app.status === "pending" ||
          app.status === "reviewing",
      ).length;
    if (status === "shortlisted")
      return applications.filter(
        (app) => app.status === "shortlisted" || app.status === "interview",
      ).length;
    if (status === "rejected")
      return applications.filter((app) => app.status === "rejected").length;
    return 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#fbbf24",
      reviewing: "#3b82f6",
      shortlisted: "#8b5cf6",
      interview: "#ec4899",
      offered: "#10b981",
      hired: "#059669",
      selected: "#059669",
      rejected: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  return (
    <div className="job-eval-overlay">
      <div className="job-eval-container">
        {/* Header */}
        <div className="job-eval-header">
          <div className="job-eval-header-content">
            <div className="job-eval-header-left">
              {item.companyLogo && (
                <img
                  src={item.companyLogo}
                  alt={item.companyName}
                  className="job-eval-company-logo"
                />
              )}
              <div>
                <h2>{item.title}</h2>
                <p className="job-eval-company-name">{item.companyName}</p>
              </div>
            </div>
            <button className="job-eval-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="job-eval-content-wrapper">
          {/* Stages - Left Sidebar */}
          <div className="job-eval-stages-section">
            <div className="job-eval-stages-header">
              <h3>Stages</h3>
              <div className="job-eval-stage-actions">
                <button
                  className="job-eval-btn-download"
                  title="Download Profiles"
                >
                  <Download size={16} />
                </button>
                <button className="job-eval-btn-email" title="Email">
                  <Mail size={16} />
                </button>
              </div>
            </div>

            <div className="job-eval-stages-list">
              {/* All Applications */}
              <button
                className={`job-eval-stage-item ${selectedStage === "all" ? "active" : ""}`}
                onClick={() => setSelectedStage("all")}
              >
                <div className="job-eval-stage-info">
                  <span className="job-eval-stage-icon">📋</span>
                  <span className="job-eval-stage-name">All Applications</span>
                </div>
                <span className="job-eval-stage-count">
                  {getStageCount("all")}
                </span>
              </button>

              {/* Custom Stages (Assessment/Interview rounds) */}
              {hasCustomStages &&
                customStages.map((stage, index) => {
                  const stageIcon =
                    stage.type === "assessment"
                      ? "📝"
                      : stage.type === "interview"
                        ? "💼"
                        : stage.type === "final"
                          ? "🎯"
                          : "📊";
                  const stageKey = `stage-${index}`;
                  const stageLabel =
                    stage.type === "assessment"
                      ? "ASSESSMENT"
                      : stage.type === "interview"
                        ? "INTERVIEW"
                        : stage.type === "final"
                          ? "FINAL"
                          : "ROUND";

                  return (
                    <button
                      key={stageKey}
                      className={`job-eval-stage-item ${selectedStage === stageKey ? "active" : ""}`}
                      onClick={() => setSelectedStage(stageKey)}
                    >
                      <div className="job-eval-stage-info">
                        <span className="job-eval-stage-icon">{stageIcon}</span>
                        <div className="job-eval-stage-details">
                          <span className="job-eval-stage-name">
                            R{index + 1} {stageLabel}
                          </span>
                          <span className="job-eval-stage-subtitle">
                            {stage.title}
                          </span>
                          {stage.deadline && (
                            <span className="job-eval-stage-deadline">
                              Due:{" "}
                              {new Date(stage.deadline).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="job-eval-stage-count">
                        {getStageCount(stageKey)}
                      </span>
                    </button>
                  );
                })}

              {/* Finalized */}
              <button
                className={`job-eval-stage-item ${selectedStage === "finalized" ? "active" : ""}`}
                onClick={() => setSelectedStage("finalized")}
              >
                <div className="job-eval-stage-info">
                  <span className="job-eval-stage-icon">✅</span>
                  <div className="job-eval-stage-details">
                    <span className="job-eval-stage-name">Finalized</span>
                    <span className="job-eval-stage-deadline">
                      Hired/Offered
                    </span>
                  </div>
                </div>
                <span className="job-eval-stage-count">
                  {getStageCount("finalized")}
                </span>
              </button>
            </div>
          </div>

          {/* Applications List */}
          <div className="job-eval-applications-section">
            {/* Status Tabs - Top */}
            <div className="job-eval-status-tabs">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  className={`job-eval-status-tab ${selectedStatus === status ? "active" : ""}`}
                  onClick={() => setSelectedStatus(status)}
                >
                  {status === "all"
                    ? "All"
                    : status === "in-progress"
                      ? "In-progress"
                      : status === "shortlisted"
                        ? "Shortlisted"
                        : "Rejected"}
                  <span className="job-eval-tab-count">
                    ({getStatusCount(status)})
                  </span>
                </button>
              ))}
            </div>

            <div className="job-eval-applications-header">
              <h3>
                {filteredApplications.length} APPLICANT
                {filteredApplications.length !== 1 ? "S" : ""}
              </h3>
              <div className="job-eval-search-filter">
                <div className="job-eval-search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search here"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="job-eval-btn-filter">Filter</button>
              </div>
            </div>

            {loading ? (
              <div className="job-eval-loading-state">
                Loading applications...
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="job-eval-empty-state">
                <p>No applications found</p>
              </div>
            ) : (
              <div className="job-eval-applications-table">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>APPLICANT</th>
                      {selectedStage.startsWith("stage-") && (
                        <th>SUBMISSIONS</th>
                      )}
                      <th>REG. STATUS</th>
                      <th>ACTION / STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app, index) => {
                      // Get submission data for current stage
                      const stageIndex = selectedStage.startsWith("stage-")
                        ? parseInt(selectedStage.split("-")[1])
                        : null;
                      const stageSubmission =
                        stageIndex !== null && app.stageSubmissions
                          ? app.stageSubmissions.find(
                              (sub) => sub.stageIndex === stageIndex,
                            )
                          : null;

                      return (
                        <tr key={app.id}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="job-eval-applicant-info">
                              <div className="job-eval-applicant-avatar">
                                {app.user?.profilePicture ? (
                                  <img
                                    src={app.user.profilePicture}
                                    alt={app.user.fullName}
                                  />
                                ) : (
                                  <div className="job-eval-avatar-placeholder">
                                    {app.user?.fullName?.charAt(0) || "U"}
                                  </div>
                                )}
                              </div>
                              <div className="job-eval-applicant-details">
                                <div className="job-eval-applicant-name">
                                  {app.user?.fullName || "Unknown"}
                                </div>
                                <div className="job-eval-applicant-email">
                                  {app.user?.email}
                                </div>
                                {/* Resume Link */}
                                {(app.resumeUrl ||
                                  app.resumeLink ||
                                  app.user?.resume) && (
                                  <a
                                    href={
                                      (
                                        app.resumeUrl ||
                                        app.resumeLink ||
                                        app.user?.resume
                                      )?.startsWith("http")
                                        ? app.resumeUrl ||
                                          app.resumeLink ||
                                          app.user?.resume
                                        : `${API_URL.replace("/api", "")}${app.resumeUrl || app.resumeLink || app.user?.resume}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="job-eval-applicant-resume"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <FileText size={12} /> Resume
                                  </a>
                                )}
                                {app.user?.city && (
                                  <div className="job-eval-applicant-location">
                                    <MapPin size={12} /> {app.user.city},{" "}
                                    {app.user.country}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Show submission data if stage is selected */}
                          {selectedStage.startsWith("stage-") && (
                            <td>
                              {stageSubmission ? (
                                // <div className="job-eval-submissions">
                                //   {Object.entries(stageSubmission.submissions || {}).map(([key, value]) => {
                                //     // Check if value looks like a URL (contains domain patterns)
                                //     const isUrl = typeof value === 'string' &&
                                //                  (value.startsWith('http://') ||
                                //                   value.startsWith('https://') ||
                                //                   value.includes('github.com') ||
                                //                   value.includes('youtube.com') ||
                                //                   value.includes('youtu.be') ||
                                //                   value.includes('drive.google.com') ||
                                //                   value.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/) // domain pattern
                                //                  );

                                //     // Add https:// if URL doesn't have protocol
                                //     let finalUrl = value;
                                //     console.log('Submission value check:', { key, value, isUrl });
                                //     if (isUrl && !value.startsWith('http://') && !value.startsWith('https://')) {
                                //       finalUrl = `https://${value}`;
                                //     }

                                //     return (
                                //       <div key={key} className="submission-item">
                                //         <strong>{key}:</strong>{' '}
                                //         {isUrl ? (
                                //           <a
                                //             href={finalUrl}
                                //             target="_blank"
                                //             rel="noopener noreferrer"
                                //             className="submission-link"
                                //             onClick={(e) => e.stopPropagation()}
                                //           >
                                //             {value} <ExternalLink size={12} />
                                //           </a>
                                //         ) : (
                                //           <span>{value}</span>
                                //         )}
                                //       </div>
                                //     );
                                //   })}
                                //   <div className="submission-date">
                                //     Submitted: {new Date(stageSubmission.submittedAt).toLocaleDateString()}
                                //   </div>
                                // </div>
                                <td>
                                  {stageSubmission &&
                                  stageSubmission.submissions ? (
                                    (() => {
                                      const entries = Object.entries(
                                        stageSubmission.submissions,
                                      );

                                      return (
                                        <table className="submission-dynamic-table">
                                          <thead>
                                            <tr>
                                              {entries.map(([key]) => (
                                                <th key={key}>{key}</th>
                                              ))}
                                            </tr>
                                          </thead>

                                          <tbody>
                                            <tr>
                                              {entries.map(([key, value]) => {
                                                const isUrl =
                                                  typeof value === "string" &&
                                                  (value.startsWith("http") ||
                                                    value.includes(
                                                      "github.com",
                                                    ) ||
                                                    value.includes("youtu") ||
                                                    value.includes(
                                                      "drive.google.com",
                                                    ) ||
                                                    value.includes(".pdf") ||
                                                    value.includes(".ppt"));

                                                const finalUrl =
                                                  isUrl &&
                                                  !value.startsWith("http")
                                                    ? `https://${value}`
                                                    : value;

                                                let label = "Open";
                                                const k = key.toLowerCase();
                                                if (k.includes("github"))
                                                  label = "GitHub";
                                                else if (
                                                  k.includes("video") ||
                                                  k.includes("youtube")
                                                )
                                                  label = "Video";
                                                else if (k.includes("ppt"))
                                                  label = "PPT";
                                                else if (k.includes("pdf"))
                                                  label = "PDF";
                                                else if (k.includes("drive"))
                                                  label = "Drive";

                                                return (
                                                  <td key={key}>
                                                    {isUrl ? (
                                                      <a
                                                        href={finalUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="submission-link"
                                                        onClick={(e) =>
                                                          e.stopPropagation()
                                                        }
                                                      >
                                                        {label}{" "}
                                                        <ExternalLink
                                                          size={12}
                                                        />
                                                      </a>
                                                    ) : (
                                                      <span>{value}</span>
                                                    )}
                                                  </td>
                                                );
                                              })}
                                            </tr>
                                          </tbody>
                                        </table>
                                      );
                                    })()
                                  ) : (
                                    <span className="text-muted">
                                      Not submitted
                                    </span>
                                  )}
                                </td>
                              ) : (
                                <span className="text-muted">
                                  Not submitted
                                </span>
                              )}
                            </td>
                          )}

                          <td>
                            <div className="job-eval-status-badge-container">
                              <span
                                className="job-eval-status-badge"
                                style={{
                                  backgroundColor: getStatusColor(app.status),
                                }}
                              >
                                {app.status === "hired" ||
                                app.status === "selected"
                                  ? "✓ Complete"
                                  : "Complete"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="job-eval-action-buttons">
                              {/* Check if already actioned */}
                              {(() => {
                                const isRejected = app.status === "rejected";
                                const isShortlisted =
                                  app.status === "shortlisted" ||
                                  app.status === "interview";
                                const isFinalized =
                                  app.status === "hired" ||
                                  app.status === "offered";
                                const isActioned =
                                  isRejected || isShortlisted || isFinalized;

                                return (
                                  <>
                                    {/* Shortlist button - moves to next stage or shortlists */}
                                    <button
                                      className="job-eval-btn-action job-eval-btn-approve"
                                      onClick={() => {
                                        if (
                                          selectedStage.startsWith("stage-")
                                        ) {
                                          // Move to next stage
                                          const currentStageIndex = parseInt(
                                            selectedStage.split("-")[1],
                                          );
                                          const nextStageIndex =
                                            currentStageIndex + 1;
                                          const hasNextStage =
                                            item.stages &&
                                            item.stages[nextStageIndex];

                                          if (hasNextStage) {
                                            // Move to next stage
                                            moveToNextStage(
                                              app.id,
                                              nextStageIndex,
                                            );
                                          } else {
                                            // No more stages, mark as hired/offered
                                            updateApplicationStatus(
                                              app.id,
                                              "offered",
                                            );
                                          }
                                        } else {
                                          // Initial shortlist
                                          updateApplicationStatus(
                                            app.id,
                                            "shortlisted",
                                          );
                                        }
                                      }}
                                      disabled={isActioned}
                                      title={
                                        isActioned
                                          ? "Already actioned"
                                          : selectedStage.startsWith("stage-")
                                            ? item.stages &&
                                              item.stages[
                                                parseInt(
                                                  selectedStage.split("-")[1],
                                                ) + 1
                                              ]
                                              ? `Shortlist for ${item.stages[parseInt(selectedStage.split("-")[1]) + 1].title}`
                                              : "Mark as Offered"
                                            : "Shortlist"
                                      }
                                    >
                                      ✓
                                    </button>
                                    <button
                                      className="job-eval-btn-action job-eval-btn-reject"
                                      onClick={() =>
                                        updateApplicationStatus(
                                          app.id,
                                          "rejected",
                                        )
                                      }
                                      disabled={isActioned}
                                      title={
                                        isActioned
                                          ? "Already actioned"
                                          : "Reject"
                                      }
                                    >
                                      ✕
                                    </button>
                                    <button
                                      className="job-eval-btn-action job-eval-btn-view"
                                      onClick={() => setSelectedCandidate(app)}
                                      title="View Details"
                                    >
                                      <FileText size={16} />
                                    </button>
                                    <div className="job-eval-status-label">
                                      {isFinalized ? (
                                        <span className="status-finalized">
                                          ✓ FINALIZED
                                        </span>
                                      ) : isShortlisted ? (
                                        <span className="status-shortlistedjob">
                                          ✓ SHORTLISTED
                                        </span>
                                      ) : isRejected ? (
                                        <span className="status-rejected">
                                          ✕ REJECTED
                                        </span>
                                      ) : selectedStage.startsWith("stage-") &&
                                        item.stages ? (
                                        item.stages[
                                          parseInt(
                                            selectedStage.split("-")[1],
                                          ) + 1
                                        ] ? (
                                          `SHORTLIST FOR ${item.stages[parseInt(selectedStage.split("-")[1]) + 1].title.toUpperCase()}`
                                        ) : (
                                          "MARK AS OFFERED"
                                        )
                                      ) : (
                                        app.status.toUpperCase()
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div
          className="job-eval-candidate-modal-overlay"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="job-eval-candidate-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="job-eval-candidate-modal-header">
              <h3>Candidate Details</h3>
              <button onClick={() => setSelectedCandidate(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="job-eval-candidate-modal-body">
              <div className="job-eval-candidate-profile">
                {selectedCandidate.user?.profilePicture ? (
                  <img
                    src={selectedCandidate.user.profilePicture}
                    alt={selectedCandidate.user.fullName}
                  />
                ) : (
                  <div className="job-eval-profile-placeholder">
                    {selectedCandidate.user?.fullName?.charAt(0) || "U"}
                  </div>
                )}
                <h4>{selectedCandidate.user?.fullName}</h4>
                <p>{selectedCandidate.user?.email}</p>
              </div>

              <div className="job-eval-candidate-info-grid">
                {selectedCandidate.user?.phone && (
                  <div className="job-eval-info-item">
                    <Phone size={16} />
                    <span>{selectedCandidate.user.phone}</span>
                  </div>
                )}
                {selectedCandidate.user?.city && (
                  <div className="job-eval-info-item">
                    <MapPin size={16} />
                    <span>
                      {selectedCandidate.user.city},{" "}
                      {selectedCandidate.user.country}
                    </span>
                  </div>
                )}
                {selectedCandidate.user?.education && (
                  <div className="job-eval-info-item">
                    <Briefcase size={16} />
                    <span>
                      {typeof selectedCandidate.user.education === "object"
                        ? `${selectedCandidate.user.education.degree || ""} ${selectedCandidate.user.education.specialization || ""} - ${selectedCandidate.user.education.institute || ""}`.trim()
                        : selectedCandidate.user.education}
                    </span>
                  </div>
                )}
                <div className="job-eval-info-item">
                  <Calendar size={16} />
                  <span>
                    Applied:{" "}
                    {new Date(selectedCandidate.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {selectedCandidate.coverLetter && (
                <div className="job-eval-cover-letter">
                  <h5>Cover Letter</h5>
                  <p>{selectedCandidate.coverLetter}</p>
                </div>
              )}

              {(selectedCandidate.resumeUrl ||
                selectedCandidate.resumeLink ||
                selectedCandidate.user?.resume) && (
                <a
                  href={
                    (
                      selectedCandidate.resumeUrl ||
                      selectedCandidate.resumeLink ||
                      selectedCandidate.user?.resume
                    )?.startsWith("http")
                      ? selectedCandidate.resumeUrl ||
                        selectedCandidate.resumeLink ||
                        selectedCandidate.user?.resume
                      : `${API_URL.replace("/api", "")}${selectedCandidate.resumeUrl || selectedCandidate.resumeLink || selectedCandidate.user?.resume}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="job-eval-btn-download-resume"
                >
                  <FileText size={18} /> Download Resume
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobEvaluationOverlay;
