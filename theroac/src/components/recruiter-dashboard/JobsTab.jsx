import { Plus, Briefcase, Eye, Users } from "lucide-react";

const JobsTab = ({ myJobs, jobsLoading, onAddJob }) => {
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

      <div className="jobs-grid">
        {jobsLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <div className="loading"></div>
            <p>Loading your jobs...</p>
          </div>
        ) : myJobs.length > 0 ? (
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
    </div>
  );
};

export default JobsTab;
