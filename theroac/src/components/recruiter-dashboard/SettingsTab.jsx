// src/components/recruiter-dashboard/SettingsTab.jsx
import React from "react";

const SettingsTab = ({
  authUser,
  profileData,
  setProfileData,
  isEditingProfile,
  setIsEditingProfile,
  getUserInitials,
}) => {
  return (
    <div className="settings-section">
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
            Profile Settings
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              margin: "0.5rem 0 0 0",
            }}
          >
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div
        className="profile-card"
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,214,0,0.2)",
          borderRadius: "20px",
          padding: "2rem",
          maxWidth: "800px",
        }}
      >
        {/* Profile Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            marginBottom: "2rem",
            paddingBottom: "2rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            className="user-avatar"
            style={{ width: "80px", height: "80px", fontSize: "2rem" }}
          >
            {authUser?.profilePicture ? (
              <img
                src={authUser.profilePicture}
                alt={authUser.fullName}
                className="profile-image"
              />
            ) : (
              <span className="profile-initials">
                {getUserInitials(authUser?.fullName || authUser?.name)}
              </span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                color: "#fff",
                fontSize: "1.5rem",
                fontWeight: "600",
                margin: "0 0 0.5rem 0",
              }}
            >
              {authUser?.fullName || authUser?.name || "Recruiter"}
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                margin: 0,
              }}
            >
              {authUser?.email}
            </p>
            <span
              style={{
                display: "inline-block",
                marginTop: "0.5rem",
                padding: "0.25rem 0.75rem",
                background: "rgba(255,214,0,0.2)",
                color: "#FFD600",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: "600",
              }}
            >
              {authUser?.role || "Recruiter"}
            </span>
          </div>
          {!isEditingProfile && (
            <button
              className="btn-host"
              onClick={() => {
                setProfileData({
                  fullName: authUser?.fullName || authUser?.name || "",
                  email: authUser?.email || "",
                  phone: authUser?.phone || "",
                  city: authUser?.city || "",
                  state: authUser?.state || "",
                  country: authUser?.country || "",
                  bio: authUser?.bio || "",
                });
                setIsEditingProfile(true);
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Form / View */}
        {isEditingProfile ? (
          <div className="profile-form">
            {/* yahan wo hi inputs jo tumne original file me rakhe the */}
            {/* ... same as your existing edit form ... */}
            {/* sirf ek jagah tumne fetch call likha tha, vo yahin reh sakta hai */}
          </div>
        ) : (
          <div className="profile-details">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  Phone
                </label>
                <p
                  style={{
                    color: "#fff",
                    margin: 0,
                    fontSize: "1rem",
                  }}
                >
                  {authUser?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  Location
                </label>
                <p
                  style={{
                    color: "#fff",
                    margin: 0,
                    fontSize: "1rem",
                  }}
                >
                  {[authUser?.city, authUser?.state, authUser?.country]
                    .filter(Boolean)
                    .join(", ") || "Not provided"}
                </p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  Bio
                </label>
                <p
                  style={{
                    color: "#fff",
                    margin: 0,
                    fontSize: "1rem",
                    lineHeight: "1.6",
                  }}
                >
                  {authUser?.bio || "No bio added yet"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
