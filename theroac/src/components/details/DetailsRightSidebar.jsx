// src/components/DetailsRightSidebar.jsx
import React, { useState } from "react";
import { Heart, Bookmark, Share2, Award, Briefcase, Clock } from "lucide-react";

const DetailsRightSidebar = ({
  type,
  data,
  user,
  hasApplied,
  isApplying,
  checkingStatus,
  isBookmarked,
  isLiked,
  onApply,
  onBookmark,
  onLike,
  onShare,
  getPriceDisplay,
  getDeadlineDisplay,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShareClick = (platform) => {
    onShare(platform);
    setShowShareMenu(false);
  };

  return (
    <div className="right-sidebar">
      {/* Action Card */}
      <div className="action-card">
        <div className="action-header">
          <Heart
            size={20}
            fill={isLiked ? "#ff4444" : "none"}
            color={isLiked ? "#ff4444" : "currentColor"}
            style={{ cursor: "pointer" }}
            onClick={onLike}
            title={isLiked ? "Unlike" : "Like"}
          />
          <Bookmark
            size={20}
            fill={isBookmarked ? "#FFD600" : "none"}
            color={isBookmarked ? "#FFD600" : "currentColor"}
            style={{ cursor: "pointer" }}
            onClick={onBookmark}
            title={isBookmarked ? "Remove bookmark" : "Bookmark"}
          />
          <Share2
            size={20}
            style={{ cursor: "pointer" }}
            onClick={() => setShowShareMenu(!showShareMenu)}
            title="Share"
          />
          {showShareMenu && (
            <div className="share-dropdown">
              <button onClick={() => handleShareClick("facebook")}>
                Facebook
              </button>
              <button onClick={() => handleShareClick("twitter")}>
                Twitter
              </button>
              <button onClick={() => handleShareClick("linkedin")}>
                LinkedIn
              </button>
              <button onClick={() => handleShareClick("copy")}>
                Copy Link
              </button>
            </div>
          )}
        </div>

        {/* <div className="price-section">
          <span className="price">{getPriceDisplay()}</span>
        </div> */}

        {/* Apply Button – only candidate or not logged in */}
        {(!user || user.role === "candidate") && (
          <button
            className={`apply-button ${hasApplied ? "applied" : ""}`}
            onClick={onApply}
            disabled={isApplying || hasApplied || checkingStatus}
            style={{
              opacity:
                isApplying || checkingStatus ? 0.8 : hasApplied ? 0.7 : 1,
              cursor:
                isApplying || hasApplied || checkingStatus
                  ? "not-allowed"
                  : "pointer",
              backgroundColor: hasApplied ? "#28a745" : "",
              borderColor: hasApplied ? "#28a745" : "",
            }}
          >
            {checkingStatus ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #1A1719",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></span>
                Checking...
              </span>
            ) : isApplying ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #1A1719",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></span>
                Applying...
              </span>
            ) : hasApplied ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span style={{ color: "white" }}>✓</span>
                Applied
              </span>
            ) : (
              "Quick Apply"
            )}
          </button>
        )}

        {/* Stats */}
        <div className="stats-section individual">
          {type === "events" && (
            <>
              <div className="stat-item-individual">
                <div className="stat-icon">
                  <Heart size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Registered</span>
                  <span className="stat-number">
                    {data.registrations || data.registered || 0}
                  </span>
                </div>
              </div>

              <div className="stat-item-individual">
                <div className="stat-icon">
                  <Award size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Team Size</span>
                  <span className="stat-number">
                    {/* Check participationType first, then team size fields */}
                    {data.participationType === 'individual' || 
                     (data.minTeamSize === 1 && data.maxTeamSize === 1) ? (
                      'Individual'
                    ) : data.participationType === 'team' || 
                       (data.minTeamSize && data.maxTeamSize) ? (
                      /* Team-based event - show team size requirements */
                      data.minTeamSize === data.maxTeamSize 
                        ? `${data.maxTeamSize} members`
                        : `${data.minTeamSize}-${data.maxTeamSize} members`
                    ) : data.maxTeamSize ? (
                      data.maxTeamSize === 1 ? 'Individual' : `Up to ${data.maxTeamSize} members`
                    ) : (
                      /* Fallback: check categories for team-based events */
                      data.categories && Array.isArray(data.categories) && 
                      data.categories.some(cat => ['hackathon', 'competition', 'contest', 'challenge'].includes(cat.toLowerCase())) 
                        ? 'Up to 4 members' 
                        : 'Individual'
                    )}
                  </span>
                </div>
              </div>

              <div className="stat-item-individual">
                <div className="stat-icon">
                  <Clock size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Registration Deadline</span>
                  <span className={`stat-number ${getDeadlineDisplay() === 0 ? 'deadline-passed' : ''}`}>
                    {getDeadlineDisplay() === 0 ? 'Deadline Passed' : `${getDeadlineDisplay()} days left`}
                  </span>
                </div>
              </div>
            </>
          )}

          {type === "jobs" && (
            <>
              <div className="stat-item-individual">
                <div className="stat-icon">
                  <Heart size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Applied</span>
                  <span className="stat-number">{data.applications || 0}</span>
                </div>
              </div>

              <div className="stat-item-individual">
                <div className="stat-icon">
                  <Briefcase size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Experience</span>
                  <span className="stat-number">{data.experience || data.experienceLevel || 'N/A'}</span>
                </div>
              </div>

              <div className="stat-item-individual">
                <div className="stat-icon">
                  <Award size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Salary</span>
                  <span className="stat-number">{getPriceDisplay()}</span>
                </div>
              </div>

              <div className="stat-item-individual">
                <div className="stat-icon">
                  <Clock size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Application Deadline</span>
                  <span className={`stat-number ${getDeadlineDisplay() === 0 ? 'deadline-passed' : ''}`}>
                    {getDeadlineDisplay() === 0 ? 'Deadline Passed' : `${getDeadlineDisplay()} days left`}
                  </span>
                </div>
              </div>
            </>
          )}

          {type === "internships" && (
            <>
              <div className="stat-item-individual">
                <div className="stat-icon">
                  <Heart size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Applied</span>
                  <span className="stat-number">{data.applications || 0}</span>
                </div>
              </div>

              <div className="stat-item-individual">
                <div className="stat-icon">
                  <Clock size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Duration</span>
                  <span className="stat-number">{data.duration || 'N/A'}</span>
                </div>
              </div>

              <div className="stat-item-individual">
                <div className="stat-icon">
                  <Award size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Stipend</span>
                  <span className="stat-number">{getPriceDisplay()}</span>
                </div>
              </div>

              <div className="stat-item-individual">
                <div className="stat-icon">
                  <Clock size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Application Deadline</span>
                  <span className="stat-number">
                    {getDeadlineDisplay()} days left
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Team Information Card - Show for team-based events */}
      {/* Removed duplicate - team size already shown in stats above */}

      {/* Eligibility Card */}
      <div className="info-card compact">
        <h3 className="card-title">
          <Award size={16} />
          Eligibility
        </h3>
        <div className="eligibility-list compact">
          {Array.isArray(data.eligibility) && data.eligibility.length > 0 ? (
            // Array format - display each item
            data.eligibility.map((item, index) => (
              <span key={index} className="eligibility-item">
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </span>
            ))
          ) : data.eligibility && typeof data.eligibility === 'object' && !Array.isArray(data.eligibility) ? (
            // Object format - check for new format (whoCanApply) or old format (education)
            <>
              {/* New format: whoCanApply, collegeRestriction, genderRestriction */}
              {data.eligibility.whoCanApply && (
                <div className="eligibility-section">
                  <strong>Who Can Apply:</strong>
                  <span className="eligibility-value">
                    {data.eligibility.whoCanApply === 'Everyone can apply' ? 'Open to all' : data.eligibility.whoCanApply}
                  </span>
                </div>
              )}
              
              {data.eligibility.collegeRestriction && data.eligibility.collegeRestriction !== 'Everyone can apply' && (
                <div className="eligibility-section">
                  <strong>College/Organization:</strong>
                  <span className="eligibility-value">
                    {data.eligibility.collegeRestriction}
                    {data.eligibility.collegeRestrictionDetail && ` - ${data.eligibility.collegeRestrictionDetail}`}
                  </span>
                </div>
              )}
              
              {data.eligibility.genderRestriction && data.eligibility.genderRestriction !== 'Everyone can apply' && (
                <div className="eligibility-section">
                  <strong>Gender:</strong>
                  <span className="eligibility-value">
                    {data.eligibility.genderRestriction}
                    {data.eligibility.genderRestrictionDetail && ` - ${data.eligibility.genderRestrictionDetail}`}
                  </span>
                </div>
              )}
              
              {/* Old format: education, location, additional */}
              {data.eligibility.education && Array.isArray(data.eligibility.education) && data.eligibility.education.length > 0 && (
                <div className="eligibility-section">
                  <strong>Education:</strong>
                  <div className="eligibility-tags">
                    {data.eligibility.education.map((edu, index) => (
                      <span key={index} className="eligibility-tag">
                        {edu === 'undergraduate' ? 'Undergraduate' :
                         edu === 'postgraduate' ? 'Postgraduate' :
                         edu === 'engineering' ? 'Engineering Students' :
                         edu === 'management' ? 'Management' :
                         edu === 'arts-commerce-sciences' ? 'Arts, Commerce, Sciences & Others' :
                         edu === 'law' ? 'Law' :
                         edu === 'medical' ? 'Medical' : edu}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Geographic Restrictions */}
              {data.eligibility.location && (
                <div className="eligibility-section">
                  <strong>Location:</strong>
                  <span className="eligibility-value">{data.eligibility.location}</span>
                </div>
              )}
              
              {/* Additional Requirements */}
              {data.eligibility.additional && (
                <div className="eligibility-section">
                  <strong>Additional Requirements:</strong>
                  <span className="eligibility-value">{data.eligibility.additional}</span>
                </div>
              )}
              
              {/* If no eligibility criteria set in either format */}
              {(!data.eligibility.whoCanApply || data.eligibility.whoCanApply === 'Everyone can apply') &&
               (!data.eligibility.collegeRestriction || data.eligibility.collegeRestriction === 'Everyone can apply') &&
               (!data.eligibility.genderRestriction || data.eligibility.genderRestriction === 'Everyone can apply') &&
               (!data.eligibility.education || data.eligibility.education.length === 0) && 
               !data.eligibility.location && 
               !data.eligibility.additional && (
                <span className="eligibility-item">Open to all</span>
              )}
            </>
          ) : (
            // No eligibility data or invalid format
            <span className="eligibility-item">Open to all</span>
          )}
        </div>
      </div>

      {/* Gender Card (for internships) */}
      {type === "internships" && data.gender && (
        <div className="info-card compact">
          <h3 className="card-title">
            <Heart size={16} />
            Gender
          </h3>
          <div className="eligibility-list compact">
            {Array.isArray(data.gender) ? (
              data.gender.map((item, index) => (
                <span key={index} className="eligibility-item">
                  {typeof item === 'string' ? item : JSON.stringify(item)}
                </span>
              ))
            ) : data.gender && typeof data.gender === 'object' ? (
              <span className="eligibility-item">
                {JSON.stringify(data.gender)}
              </span>
            ) : (
              <span className="eligibility-item">
                {data.gender || "Not specified"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Refer & Win Card */}
      <div className="info-card compact">
        <h3 className="card-title">
          <Share2 size={16} />
          Refer & Win
        </h3>
        <p className="card-description">
          MacBook, iPhone, Apple Watch, Cash and more!
        </p>
        <div className="refer-buttons">
          <button className="refer-btn">Refer now</button>
          <button className="refer-btn">Know more</button>
        </div>
      </div>
    </div>
  );
};

export default DetailsRightSidebar;
