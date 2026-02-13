// src/components/recruiter-dashboard/SettingsTab.jsx
import React from "react";
import "./SettingsTab.css";

const SettingsTab = ({
  authUser,
  profileData,
  setProfileData,
  isEditingProfile,
  setIsEditingProfile,
  getUserInitials,
}) => {
  // Display ke liye: authUser + profileData merge
  // Always merge authUser with profileData to show latest data
  const displayProfile = {
    ...(authUser || {}),
    ...(profileData || {}),
  };

  // Debug: Check what data we have


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPG, PNG)');
        return;
      }
      
      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        alert('Logo size should be less than 1MB');
        return;
      }
      
      setProfileData((prev) => ({
        ...prev,
        companyLogoFile: file,
        companyLogo: URL.createObjectURL(file)
      }));
    }
  };

  const handleCommaSeparatedChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
      // backend ko array chahiye to split use kar sakte ho:
      // [name]: value.split(",").map(v => v.trim()).filter(Boolean)
    }));
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      
      // First upload company logo if there's a new file
      let companyLogoUrl = profileData.company?.logo || profileData.companyLogo;
      if (profileData.companyLogoFile) {
        const logoFormData = new FormData();
        logoFormData.append('image', profileData.companyLogoFile);
        
        console.log('Uploading company logo to GCS...');
        
        const uploadResponse = await fetch(`${API_URL}/jobs/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: logoFormData
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          // Backend returns imageUrl field
          companyLogoUrl = uploadData.imageUrl || uploadData.url;
          console.log('Logo uploaded successfully to GCS:', companyLogoUrl);
        } else {
          const errorData = await uploadResponse.json();
          console.error('Logo upload failed:', errorData);
          throw new Error(errorData.message || 'Logo upload failed');
        }
      }
      
      // Include all fields - personal + company + preferences
      const userFields = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        bio: profileData.bio,
        city: profileData.city,
        state: profileData.state,
        country: profileData.country,
        role: profileData.role,
        // Company info stored in user profile
        company: {
          name: profileData.companyName,
          logo: companyLogoUrl,
          industryType: profileData.industryType,
          companySize: profileData.companySize,
          foundedYear: profileData.foundedYear,
          headOffice: profileData.headOffice,
          website: profileData.website,
          aboutCompany: profileData.aboutCompany
        },
        // Preferences and metrics
        preferences: {
          workLocations: profileData.workLocations ? profileData.workLocations.split(',').map(s => s.trim()).filter(Boolean) : [],
          hiringFor: profileData.hiringFor ? profileData.hiringFor.split(',').map(s => s.trim()).filter(Boolean) : [],
          metrics: {
            totalJobsPosted: profileData.totalJobsPosted || 0,
            activeJobs: profileData.activeJobs || 0,
            totalCandidatesHired: profileData.totalCandidatesHired || 0,
            responseRate: profileData.responseRate || '',
            averageResponseTimeHours: profileData.averageResponseTimeHours || 0
          },
          communication: {
            allowDirectMessage: profileData.allowDirectMessage ?? true,
            preferredContact: profileData.preferredContact || 'platform_chat',
            supportEmail: profileData.supportEmail || ''
          }
        }
      };

      console.log('Updating profile with company logo:', companyLogoUrl);
      console.log('Full update payload:', userFields);

      // Update user profile
      const userResponse = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userFields)
      });

      if (!userResponse.ok) {
        throw new Error('Failed to update user profile');
      }

      const response = await userResponse.json();
      
      // Fetch fresh user data from server to get company field
      const freshUserResponse = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (freshUserResponse.ok) {
        const freshData = await freshUserResponse.json();
        const freshUser = freshData.user || freshData;
        
        // Update local storage with fresh data
        localStorage.setItem('user', JSON.stringify(freshUser));
        
        // Update profileData state with fresh data
        setProfileData({
          fullName: freshUser.fullName || '',
          email: freshUser.email || '',
          phone: freshUser.phone || '',
          city: freshUser.city || '',
          state: freshUser.state || '',
          country: freshUser.country || '',
          bio: freshUser.bio || '',
          role: freshUser.role || '',
          companyName: freshUser.company?.name || '',
          companyLogo: freshUser.company?.logo || '',
          industryType: freshUser.company?.industryType || '',
          companySize: freshUser.company?.companySize || '',
          foundedYear: freshUser.company?.foundedYear || '',
          headOffice: freshUser.company?.headOffice || '',
          website: freshUser.company?.website || '',
          aboutCompany: freshUser.company?.aboutCompany || '',
          workLocations: freshUser.preferences?.workLocations?.join(', ') || '',
          hiringFor: freshUser.preferences?.hiringFor?.join(', ') || '',
          totalJobsPosted: freshUser.preferences?.metrics?.totalJobsPosted || '',
          activeJobs: freshUser.preferences?.metrics?.activeJobs || '',
          totalCandidatesHired: freshUser.preferences?.metrics?.totalCandidatesHired || '',
          responseRate: freshUser.preferences?.metrics?.responseRate || '',
          averageResponseTimeHours: freshUser.preferences?.metrics?.averageResponseTimeHours || '',
          allowDirectMessage: freshUser.preferences?.communication?.allowDirectMessage ?? true,
          preferredContact: freshUser.preferences?.communication?.preferredContact || 'platform_chat',
          supportEmail: freshUser.preferences?.communication?.supportEmail || ''
        });
        
        setIsEditingProfile(false);
        
        // Show success message
        alert('Profile updated successfully!');
      } else {
        throw new Error('Failed to fetch updated profile');
      }
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="settings-tab-container">
      {/* Header */}
      <div className="settings-section-header">
        <h2>Profile Settings</h2>
        <p>Manage your recruiter profile, company details and hiring preferences</p>
      </div>

      {/* Profile Header Card */}
      <div className="settings-profile-card">
        <div className="settings-profile-header">
          <div className="user-avatar">
            {displayProfile?.profilePicture ? (
              <img
                src={displayProfile.profilePicture}
                alt={displayProfile.fullName}
                className="profile-image"
              />
            ) : (
              <span className="profile-initials">
                {getUserInitials(
                  displayProfile?.fullName || displayProfile?.name
                )}
              </span>
            )}
          </div>

          <div className="settings-profile-info">
            <h3>
              {displayProfile?.fullName ||
                displayProfile?.name ||
                "Recruiter"}
            </h3>
            <p className="profile-email">
              {displayProfile?.email}
            </p>
            <div className="settings-profile-badges">
              <span className="settings-badge">
                {displayProfile?.role || "Recruiter"}
              </span>

              {displayProfile?.isVerifiedRecruiter && (
                <span className="settings-badge verified">
                  ✅ Verified Recruiter
                </span>
              )}
            </div>
          </div>

          {!isEditingProfile && (
            <button
              className="settings-btn settings-btn-primary"
              onClick={() => {
                setProfileData({
                  // Personal
                  fullName:
                    authUser?.fullName || authUser?.name || "",
                  email: authUser?.email || "",
                  phone: authUser?.phone || "",
                  city: authUser?.city || "",
                  state: authUser?.state || "",
                  country: authUser?.country || "",
                  bio: authUser?.bio || "",

                  // Company
                  companyName: authUser?.company?.name || "",
                  companyLogo: authUser?.company?.logo || "",
                  industryType:
                    authUser?.company?.industryType || "",
                  companySize:
                    authUser?.company?.companySize || "",
                  foundedYear:
                    authUser?.company?.foundedYear || "",
                  headOffice:
                    authUser?.company?.headOffice || "",
                  website: authUser?.company?.website || "",
                  aboutCompany:
                    authUser?.company?.aboutCompany || "",

                  // Hiring & metrics
                  totalJobsPosted:
                    authUser?.metrics?.totalJobsPosted || "",
                  activeJobs: authUser?.metrics?.activeJobs || "",
                  totalCandidatesHired:
                    authUser?.metrics?.totalCandidatesHired ||
                    "",
                  responseRate:
                    authUser?.metrics?.responseRate || "",
                  averageResponseTimeHours:
                    authUser?.metrics
                      ?.averageResponseTimeHours || "",

                  // Preferences
                  workLocations:
                    authUser?.preferences?.workLocations?.join(
                      ", "
                    ) || "",
                  hiringFor:
                    authUser?.preferences?.hiringFor?.join(
                      ", "
                    ) || "",

                  // Communication
                  allowDirectMessage:
                    authUser?.communication?.allowDirectMessage ??
                    true,
                  preferredContact:
                    authUser?.communication?.preferredContact ||
                    "platform_chat",
                  supportEmail:
                    authUser?.communication?.supportEmail || "",

                  // Security & verification
                  isVerifiedRecruiter:
                    authUser?.isVerifiedRecruiter || false,
                  kycStatus: authUser?.kycStatus || "pending",
                  twoFactorAuthEnabled:
                    authUser?.twoFactorAuthEnabled || false,
                });
                setIsEditingProfile(true);
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Content Card */}
      <div className="settings-content-card">
        {isEditingProfile ? (
          <form className="settings-form" onSubmit={handleSaveProfile}>
            {/* PERSONAL INFO */}
            <section className="settings-section">
              <h4 className="settings-section-title">
                Personal Information
              </h4>
              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label className="settings-input-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="settings-input-field"
                    value={profileData?.fullName || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="settings-input-field"
                    value={profileData?.email || ""}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="settings-input-field"
                    value={profileData?.phone || ""}
                    onChange={handleInputChange}
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">Role / Designation</label>
                  <input
                    type="text"
                    name="role"
                    className="settings-input-field"
                    value={profileData?.role || ""}
                    onChange={handleInputChange}
                    placeholder="Talent Acquisition Manager"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="settings-input-field"
                    value={profileData?.city || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">State</label>
                  <input
                    type="text"
                    name="state"
                    className="settings-input-field"
                    value={profileData?.state || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">Country</label>
                  <input
                    type="text"
                    name="country"
                    className="settings-input-field"
                    value={profileData?.country || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="settings-form-grid single-column" style={{ marginTop: "1rem" }}>
                <div className="settings-form-group">
                  <label className="settings-input-label">Short Bio</label>
                  <textarea
                    name="bio"
                    className="settings-input-field"
                    rows={3}
                    value={profileData?.bio || ""}
                    onChange={handleInputChange}
                    placeholder="Describe your hiring experience, domains you hire for, etc."
                  />
                </div>
              </div>
            </section>

            {/* COMPANY INFO */}
            <section className="settings-section">
              <h4 className="settings-section-title">
                Company Information
              </h4>
              
              {/* Company Logo Upload */}
              <div className="settings-form-grid single-column" style={{ marginBottom: "1.5rem" }}>
                <div className="settings-form-group">
                  <label className="settings-input-label">Company Logo</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <label 
                      htmlFor="company-logo-upload" 
                      style={{ 
                        width: "100px", 
                        height: "100px", 
                        borderRadius: "12px", 
                        overflow: "hidden",
                        border: "2px dashed rgba(255, 214, 0, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        background: "rgba(255, 255, 255, 0.05)",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255, 214, 0, 0.6)"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255, 214, 0, 0.3)"}
                    >
                      {profileData?.companyLogo ? (
                        <img 
                          src={profileData.companyLogo} 
                          alt="Company Logo" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 214, 0, 0.5)" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      )}
                    </label>
                    <input
                      type="file"
                      id="company-logo-upload"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleLogoUpload}
                      style={{ display: "none" }}
                    />
                    <div style={{ flex: 1 }}>
                      <label 
                        htmlFor="company-logo-upload" 
                        style={{ 
                          color: "#FFD600", 
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          fontWeight: "600",
                          display: "block",
                          marginBottom: "0.5rem"
                        }}
                      >
                        {profileData?.companyLogo ? "Change Logo" : "Upload Logo"}
                      </label>
                      <small style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem", display: "block" }}>
                        Supported: JPG, JPEG, PNG. Max 1 MB
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label className="settings-input-label">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    className="settings-input-field"
                    value={profileData?.companyName || ""}
                    onChange={handleInputChange}
                    placeholder="ABC Technologies Pvt Ltd"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">Industry Type</label>
                  <input
                    type="text"
                    name="industryType"
                    className="settings-input-field"
                    value={profileData?.industryType || ""}
                    onChange={handleInputChange}
                    placeholder="IT Services, FinTech, etc."
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">Company Size</label>
                  <input
                    type="text"
                    name="companySize"
                    className="settings-input-field"
                    value={profileData?.companySize || ""}
                    onChange={handleInputChange}
                    placeholder="51–200 employees"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">Founded Year</label>
                  <input
                    type="number"
                    name="foundedYear"
                    className="settings-input-field"
                    value={profileData?.foundedYear || ""}
                    onChange={handleInputChange}
                    placeholder="2016"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">Head Office</label>
                  <input
                    type="text"
                    name="headOffice"
                    className="settings-input-field"
                    value={profileData?.headOffice || ""}
                    onChange={handleInputChange}
                    placeholder="Bengaluru, India"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">Website</label>
                  <input
                    type="url"
                    name="website"
                    className="settings-input-field"
                    value={profileData?.website || ""}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="settings-form-grid single-column" style={{ marginTop: "1rem" }}>
                <div className="settings-form-group">
                  <label className="settings-input-label">About Company</label>
                  <textarea
                    name="aboutCompany"
                    className="settings-input-field"
                  rows={3}
                  value={profileData?.aboutCompany || ""}
                  onChange={handleInputChange}
                    placeholder="What does your company do? Mission, products, culture, etc."
                  />
                </div>
              </div>
            </section>

            {/* HIRING PREFERENCES */}
            <section className="settings-section">
              <h4 className="settings-section-title">
                Hiring Preferences
              </h4>
              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label className="settings-input-label">
                    Work Locations (comma separated)
                  </label>
                  <input
                    type="text"
                    name="workLocations"
                    className="settings-input-field"
                    value={profileData?.workLocations || ""}
                    onChange={handleCommaSeparatedChange}
                    placeholder="Bengaluru, Hyderabad, Remote"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">
                    Hiring For (comma separated)
                  </label>
                  <input
                    type="text"
                    name="hiringFor"
                    className="settings-input-field"
                    value={profileData?.hiringFor || ""}
                    onChange={handleCommaSeparatedChange}
                    placeholder="Full-time, Internship, Contract"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">
                    Total Jobs Posted (optional)
                  </label>
                  <input
                    type="number"
                    name="totalJobsPosted"
                    className="settings-input-field"
                    value={profileData?.totalJobsPosted || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">
                    Total Candidates Hired (optional)
                  </label>
                  <input
                    type="number"
                    name="totalCandidatesHired"
                    className="settings-input-field"
                    value={profileData?.totalCandidatesHired || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">
                    Response Rate (in %)
                  </label>
                  <input
                    type="text"
                    name="responseRate"
                    className="settings-input-field"
                    value={profileData?.responseRate || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., 85%"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">
                    Avg. Response Time (hours)
                  </label>
                  <input
                    type="number"
                    name="averageResponseTimeHours"
                    className="settings-input-field"
                    value={
                      profileData?.averageResponseTimeHours || ""
                    }
                    onChange={handleInputChange}
                    placeholder="e.g., 18"
                  />
                </div>
              </div>
            </section>

            {/* COMMUNICATION & SECURITY */}
            <section className="settings-section">
              <h4 className="settings-section-title">
                Communication & Security
              </h4>
              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label className="settings-input-label">
                    Support / HR Email (for candidates)
                  </label>
                  <input
                    type="email"
                    name="supportEmail"
                    className="settings-input-field"
                    value={profileData?.supportEmail || ""}
                    onChange={handleInputChange}
                    placeholder="hr@company.com"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-input-label">
                    Preferred Contact Channel
                  </label>
                  <select
                    name="preferredContact"
                    className="settings-input-field"
                    value={profileData?.preferredContact || "platform_chat"}
                    onChange={handleInputChange}
                  >
                    <option value="platform_chat">Platform Chat</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div className="settings-checkbox-group">
                  <input
                    type="checkbox"
                    id="allowDirectMessage"
                    name="allowDirectMessage"
                    checked={!!profileData?.allowDirectMessage}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="allowDirectMessage">
                    Allow candidates to send direct messages
                  </label>
                </div>
                <div className="settings-checkbox-group">
                  <input
                    type="checkbox"
                    id="twoFactorAuthEnabled"
                    name="twoFactorAuthEnabled"
                    checked={!!profileData?.twoFactorAuthEnabled}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="twoFactorAuthEnabled">
                    Enable Two-Factor Authentication
                  </label>
                </div>
              </div>
            </section>

            {/* ACTION BUTTONS */}
            <div className="settings-actions">
              <button
                type="button"
                className="settings-btn settings-btn-outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button type="submit" className="settings-btn settings-btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* READ-ONLY VIEW */
          <div className="settings-form">
            {/* PERSONAL */}
            <section className="settings-section">
              <h4 className="settings-section-title">
                Personal Information
              </h4>
              <div className="settings-form-grid">
                <InfoItem label="Phone" value={displayProfile?.phone} />
                <InfoItem
                  label="Location"
                  value={
                    [
                      displayProfile?.city,
                      displayProfile?.state,
                      displayProfile?.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || ""
                  }
                />
                <InfoItem
                  label="Role / Designation"
                  value={displayProfile?.role}
                />
                <InfoItem
                  label="Email"
                  value={displayProfile?.email}
                />
              </div>
              <div className="settings-form-grid single-column" style={{ marginTop: "1rem" }}>
                <div>
                  <label className="settings-view-label">Bio</label>
                  <p className="settings-view-value">
                    {displayProfile?.bio || "No bio added yet"}
                  </p>
                </div>
              </div>
            </section>

            {/* COMPANY */}
            <section className="settings-section">
              <h4 className="settings-section-title">
                Company Information
              </h4>
              
              {/* Company Logo Display */}
              {(displayProfile?.companyLogo || displayProfile?.company?.logo) && (
                <div className="settings-form-grid single-column" style={{ marginBottom: "1.5rem" }}>
                  <div>
                    <label className="settings-view-label">Company Logo</label>
                    <div style={{ 
                      marginTop: "0.5rem",
                      width: "120px",
                      height: "120px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "2px solid rgba(255, 214, 0, 0.3)",
                      background: "rgba(255, 255, 255, 0.05)"
                    }}>
                      <img 
                        src={displayProfile?.companyLogo || displayProfile?.company?.logo} 
                        alt="Company Logo" 
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "cover" 
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.5)">Logo not available</div>';
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="settings-form-grid">
                <InfoItem
                  label="Company Name"
                  value={
                    displayProfile?.companyName ||
                    displayProfile?.company?.name
                  }
                />
                <InfoItem
                  label="Industry Type"
                  value={
                    displayProfile?.industryType ||
                    displayProfile?.company?.industryType
                  }
                />
                <InfoItem
                  label="Company Size"
                  value={
                    displayProfile?.companySize ||
                    displayProfile?.company?.companySize
                  }
                />
                <InfoItem
                  label="Founded Year"
                  value={
                    displayProfile?.foundedYear ||
                    displayProfile?.company?.foundedYear
                  }
                />
                <InfoItem
                  label="Head Office"
                  value={
                    displayProfile?.headOffice ||
                    displayProfile?.company?.headOffice
                  }
                />
                <InfoItem
                  label="Website"
                  value={
                    displayProfile?.website ||
                    displayProfile?.company?.website
                  }
                />
              </div>
              <div className="settings-form-grid single-column" style={{ marginTop: "1rem" }}>
                <div>
                  <label className="settings-view-label">About Company</label>
                  <p className="settings-view-value">
                    {displayProfile?.aboutCompany ||
                      displayProfile?.company?.aboutCompany ||
                      "No company description added yet"}
                  </p>
                </div>
              </div>
            </section>

            {/* HIRING PREFERENCES & METRICS */}
            <section className="settings-section">
              <h4 className="settings-section-title">
                Hiring Preferences
              </h4>
              <div className="settings-form-grid">
                <InfoItem
                  label="Work Locations"
                  value={
                    displayProfile?.workLocations ||
                    displayProfile?.preferences?.workLocations?.join(", ")
                  }
                />
                <InfoItem
                  label="Hiring For"
                  value={
                    displayProfile?.hiringFor ||
                    displayProfile?.preferences?.hiringFor?.join(", ")
                  }
                />
                <InfoItem
                  label="Total Jobs Posted"
                  value={
                    displayProfile?.totalJobsPosted ||
                    displayProfile?.metrics?.totalJobsPosted
                  }
                />
                <InfoItem
                  label="Total Candidates Hired"
                  value={
                    displayProfile?.totalCandidatesHired ||
                    displayProfile?.metrics?.totalCandidatesHired
                  }
                />
                <InfoItem
                  label="Response Rate"
                  value={
                    displayProfile?.responseRate ||
                    displayProfile?.metrics?.responseRate
                  }
                />
                <InfoItem
                  label="Avg. Response Time (hours)"
                  value={
                    displayProfile?.averageResponseTimeHours ||
                    displayProfile?.metrics?.averageResponseTimeHours
                  }
                />
              </div>
            </section>

            {/* COMMUNICATION & SECURITY */}
            <section className="settings-section">
              <h4 className="settings-section-title">
                Communication & Security
              </h4>
              <div className="settings-form-grid">
                <InfoItem
                  label="Support Email"
                  value={
                    displayProfile?.supportEmail ||
                    displayProfile?.communication?.supportEmail
                  }
                />
                <InfoItem
                  label="Preferred Contact"
                  value={
                    displayProfile?.preferredContact ||
                    displayProfile?.communication?.preferredContact ||
                    "Platform Chat"
                  }
                />
              </div>
              <div className="settings-form-grid" style={{ marginTop: "1rem", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                <InfoItem
                  label="Direct Messages"
                  value={
                    (displayProfile?.allowDirectMessage ??
                      displayProfile?.communication
                        ?.allowDirectMessage)
                      ? "Allowed"
                      : "Disabled"
                  }
                />
                <InfoItem
                  label="Two-Factor Authentication"
                  value={
                    displayProfile?.twoFactorAuthEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
                <InfoItem
                  label="KYC Status"
                  value={displayProfile?.kycStatus || "Not verified"}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

/** SMALL REUSABLE VIEW COMPONENTS **/
const InfoItem = ({ label, value }) => (
  <div>
    <label className="settings-view-label">{label}</label>
    <p className="settings-view-value">{value || "Not provided"}</p>
  </div>
);

const MetricCard = ({ label, value }) => (
  <div className="settings-metric-card">
    <p className="settings-metric-label">{label}</p>
    <p className="settings-metric-value">{value || "—"}</p>
  </div>
);

export default SettingsTab;
