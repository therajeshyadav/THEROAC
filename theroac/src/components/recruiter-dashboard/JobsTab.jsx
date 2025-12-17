import { Plus, Briefcase, Eye, Users } from "lucide-react";
import LoadingSpinner from './LoadingSpinner';

const JobsTab = ({ myJobs, jobsLoading, onAddJob, onEditJob }) => {
  return (
    <div className="jobs-internships-section">
      <div className="section-header" style={{ marginBottom: "2rem" }}>
        <div className="header-left">
          <h2
            style={{
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: "600",
              margin: 0,
            }}
          >
            My Jobs & Internships
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              margin: "0.5rem 0 0 0",
            }}
          >
            Manage your job postings and internship opportunities
          </p>
        </div>
        <button
          className="btn-host"
          onClick={onAddJob}
          style={{ marginLeft: "auto" }}
        >
          <Plus className="w-4 h-4" /> Add New Job
        </button>
      </div>

      {jobsLoading ? (
        <LoadingSpinner />
      ) : (
      <div className="jobs-grid">
        {myJobs.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {myJobs.map((job) => (
              <div
                key={job.id}
                className="event-card"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,214,0,0.2)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                }}
              >
                <div className="event-header" style={{ marginBottom: "1rem" }}>
                  <div className="event-info">
                    <h3
                      style={{
                        color: "#fff",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {job.title}
                    </h3>
                    <p
                      style={{
                        color: "#FFD600",
                        fontSize: "0.9rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {job.companyName}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {job.location || "Remote"} • {job.jobType || "Full-time"}
                    </p>
                  </div>
                </div>
                <div
                  className="event-meta"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.85rem",
                    }}
                  >
                    <Eye className="w-4 h-4" style={{ color: "#FFD600" }} />
                    <span>{job.views || 0} views</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.85rem",
                    }}
                  >
                    <Users className="w-4 h-4" style={{ color: "#FFD600" }} />
                    <span>{job.applications || 0} applications</span>
                  </div>
                </div>
                {/* Approval Status Section */}
                {job.approvalStatus && (
                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
                        Approval Status:
                      </span>
                      <span
                        className="approval-status-badge"
                        style={{
                          padding: "0.25rem 0.6rem",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          background:
                            job.approvalStatus === "approved"
                              ? "rgba(16,185,129,0.2)"
                              : job.approvalStatus === "rejected"
                              ? "rgba(255,68,68,0.2)"
                              : "rgba(255,193,7,0.2)",
                          color:
                            job.approvalStatus === "approved"
                              ? "#10B981"
                              : job.approvalStatus === "rejected"
                              ? "#FF4444"
                              : "#FFC107",
                        }}
                      >
                        {job.approvalStatus}
                      </span>
                    </div>
                    
                    {/* Rejection Reason Display */}
                    {job.approvalStatus === "rejected" && job.rejectionReason && (
                      <div
                        style={{
                          background: "rgba(255,193,7,0.1)",
                          border: "1px solid rgba(255,193,7,0.3)",
                          borderRadius: "8px",
                          padding: "0.75rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.5rem",
                          }}
                        >
                          <span style={{ color: "#FFC107", fontSize: "0.8rem", fontWeight: "600" }}>
                            Rejection Reason:
                          </span>
                        </div>
                        <p
                          style={{
                            color: "rgba(255,255,255,0.9)",
                            fontSize: "0.8rem",
                            margin: "0.25rem 0 0 0",
                            lineHeight: "1.4",
                          }}
                        >
                          {job.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className="event-footer"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "1rem",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span
                    className="status-badge"
                    style={{
                      padding: "0.3rem 0.8rem",
                      borderRadius: "15px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      background:
                        job.status === "open"
                          ? "rgba(16,185,129,0.2)"
                          : "rgba(255,68,68,0.2)",
                      color: job.status === "open" ? "#10B981" : "#FF4444",
                      textTransform: "uppercase",
                    }}
                  >
                    {job.status || "open"}
                  </span>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {job.approvalStatus === "rejected" && (
                      <button
                        className="edit-resubmit-btn"
                        onClick={() => onEditJob && onEditJob(job)}
                        style={{
                          background: "rgba(34,197,94,0.2)",
                          color: "#22C55E",
                          border: "1px solid rgba(34,197,94,0.3)",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = "rgba(34,197,94,0.3)";
                          e.target.style.color = "#fff";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = "rgba(34,197,94,0.2)";
                          e.target.style.color = "#22C55E";
                        }}
                      >
                        Edit & Resubmit
                      </button>
                    )}
                    
                    {job.approvalStatus === "approved" && (
                      <button
                        className="view-job-btn"
                        onClick={() => window.open(`/event-detail/jobs/${job.slug}`, '_blank')}
                        style={{
                          background: "rgba(59,130,246,0.2)",
                          color: "#3B82F6",
                          border: "1px solid rgba(59,130,246,0.3)",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = "rgba(59,130,246,0.3)";
                          e.target.style.color = "#fff";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = "rgba(59,130,246,0.2)";
                          e.target.style.color = "#3B82F6";
                        }}
                      >
                        View Live
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="coming-soon-container">
            <div className="coming-soon-content">
              <Briefcase className="coming-soon-icon" size={64} />
              <h2>No Jobs Yet</h2>
              <p>Jobs and internships you create will appear here</p>
              <button
                className="btn-host"
                onClick={onAddJob}
                style={{ marginTop: "1rem" }}
              >
                <Plus className="w-4 h-4" /> Create Your First Job
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default JobsTab;
