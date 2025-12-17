// src/components/Admin-dashboards/tabs/SettingsTab.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import apiService from "../../../services/api";
import { toast } from "react-toastify";
import {
  Shield,
  Globe2,
  Mail,
  Phone,
  Lock,
  Save,
  Settings,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import "./SettingsTab.css";

const SettingsTab = () => {
  const { user: authUser } = useAuth();

  // ------- PROFILE STATE -------
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "",
    bio: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // ------- BRANDING / PLATFORM STATE -------
  const [brandingData, setBrandingData] = useState({
    platformName: "",
    tagline: "",
    primaryColor: "#FFD600",
    supportEmail: "",
    supportPhone: "",
    websiteUrl: "",
    helpCenterUrl: "",
  });
  const [autoRules, setAutoRules] = useState({
    autoApproveRecruiters: false,
    autoPublishJobs: false,
    autoApproveEvents: false,
    requireCompleteProfileToApply: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [securitySettings] = useState({
    lastLogin: authUser?.lastLogin
      ? new Date(authUser.lastLogin).toLocaleString()
      : "Not available",
  });

  const [brandingMessage, setBrandingMessage] = useState(null);
  const [rulesMessage, setRulesMessage] = useState(null);

  // ------- INIT PROFILE FROM authUser -------
  useEffect(() => {
    if (!authUser) return;
    setProfileData({
      fullName: authUser.fullName || authUser.name || "",
      email: authUser.email || "",
      phone: authUser.phone || "",
      city: authUser.city || "",
      state: authUser.state || "",
      country: authUser.country || "",
      bio: authUser.bio || "",
    });
  }, [authUser]);

  // ------- FETCH PLATFORM SETTINGS -------
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const response = await apiService.getAdminSettings();
        const { settings } = response;
        
        if (settings.branding) {
          setBrandingData(settings.branding);
        }
        if (settings.rules) {
          setAutoRules(settings.rules);
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error);
        toast.error('Failed to load platform settings');
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // ------- HANDLERS -------

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setProfileMessage(null);
    setProfileSaving(true);
    try {
      const response = await fetch("http://localhost:4000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setProfileMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setIsEditingProfile(false);
      } else {
        setProfileMessage({
          type: "error",
          text: "Failed to update profile. Please try again.",
        });
      }
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: "Something went wrong while updating profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleBrandingChange = (field, value) => {
    setBrandingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveBranding = async () => {
    try {
      setBrandingMessage(null);
      await apiService.updateAdminSettings({ branding: brandingData });
      setBrandingMessage({
        type: "success",
        text: "Branding & contact settings saved successfully!",
      });
      setTimeout(() => setBrandingMessage(null), 3000);
    } catch (error) {
      console.error('Error saving branding settings:', error);
      setBrandingMessage({
        type: "error",
        text: "Failed to save branding settings. Please try again.",
      });
      setTimeout(() => setBrandingMessage(null), 3000);
    }
  };

  const handleToggleRule = async (field) => {
    try {
      const updatedRules = { ...autoRules, [field]: !autoRules[field] };
      setAutoRules(updatedRules);
      
      await apiService.updateAdminSettings({ rules: updatedRules });
      setRulesMessage({
        type: "success",
        text: "Platform rules updated successfully!",
      });
      setTimeout(() => setRulesMessage(null), 3000);
    } catch (error) {
      console.error('Error updating platform rules:', error);
      // Revert the change on error
      setAutoRules(autoRules);
      setRulesMessage({
        type: "error",
        text: "Failed to update platform rules. Please try again.",
      });
      setTimeout(() => setRulesMessage(null), 3000);
    }
  };

  if (settingsLoading) {
    return (
      <div className="admin-settings-section">
        <div className="admin-settings-loading">
          <div className="loading-spinner"></div>
          <p>Loading platform settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-section">
      <div className="admin-settings-header">
        <div className="admin-settings-header-left">
          <h2>Admin & Platform Settings</h2>
          <p>
            Manage your admin profile, platform branding and default system
            rules.
          </p>
        </div>
        <div className="admin-settings-header-right">
          <div className="admin-settings-badge">
            <Shield className="w-4 h-4" />
            <span>Owner Access</span>
          </div>
        </div>
      </div>

      <div className="admin-settings-grid">
        {/* LEFT COLUMN - PROFILE & SECURITY */}
        <div className="admin-settings-col">
          {/* ADMIN PROFILE CARD */}
          <div className="admin-settings-card">
            <div className="admin-settings-card-header">
              <div>
                <h3>Admin Profile</h3>
                <p>Update your personal information and contact details.</p>
              </div>
              {!isEditingProfile && (
                <button
                  className="admin-settings-pill-btn"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="admin-settings-profile-header">
              <div className="admin-settings-avatar">
                {authUser?.profilePicture ? (
                  <img
                    src={authUser.profilePicture}
                    alt={profileData.fullName || "Admin"}
                  />
                ) : (
                  <span>
                    {(profileData.fullName || "A")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="admin-settings-profile-meta">
                <h4>{profileData.fullName || "Admin User"}</h4>
                <span className="admin-role-chip">Platform Admin</span>
                <p>{profileData.email || "No email found"}</p>
              </div>
            </div>

            {profileMessage && (
              <div
                className={`admin-settings-alert ${
                  profileMessage.type === "success"
                    ? "admin-settings-alert-success"
                    : "admin-settings-alert-error"
                }`}
              >
                {profileMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            {isEditingProfile ? (
              <div className="admin-settings-form">
                <div className="admin-settings-two-col">
                  <div className="admin-settings-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) =>
                        handleProfileChange("fullName", e.target.value)
                      }
                    />
                  </div>
                  <div className="admin-settings-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      readOnly
                      className="admin-settings-input-readonly"
                    />
                  </div>
                  <div className="admin-settings-field">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                    />
                  </div>
                  <div className="admin-settings-field">
                    <label>City</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) =>
                        handleProfileChange("city", e.target.value)
                      }
                    />
                  </div>
                  <div className="admin-settings-field">
                    <label>State</label>
                    <input
                      type="text"
                      value={profileData.state}
                      onChange={(e) =>
                        handleProfileChange("state", e.target.value)
                      }
                    />
                  </div>
                  <div className="admin-settings-field">
                    <label>Country</label>
                    <input
                      type="text"
                      value={profileData.country}
                      onChange={(e) =>
                        handleProfileChange("country", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="admin-settings-field">
                  <label>Bio</label>
                  <textarea
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) =>
                      handleProfileChange("bio", e.target.value)
                    }
                  />
                </div>

                <div className="admin-settings-actions">
                  <button
                    className="admin-settings-btn-outline"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileMessage(null);
                      // reset from authUser
                      if (authUser) {
                        setProfileData({
                          fullName:
                            authUser.fullName || authUser.name || "",
                          email: authUser.email || "",
                          phone: authUser.phone || "",
                          city: authUser.city || "",
                          state: authUser.state || "",
                          country: authUser.country || "",
                          bio: authUser.bio || "",
                        });
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="admin-settings-btn-primary"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                  >
                    {profileSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-settings-profile-view">
                <div className="admin-settings-two-col">
                  <div>
                    <label>Full Name</label>
                    <p>{profileData.fullName || "Not set"}</p>
                  </div>
                  <div>
                    <label>Email</label>
                    <p>{profileData.email || "Not set"}</p>
                  </div>
                  <div>
                    <label>Phone</label>
                    <p>{profileData.phone || "Not set"}</p>
                  </div>
                  <div>
                    <label>Location</label>
                    <p>
                      {[profileData.city, profileData.state, profileData.country]
                        .filter(Boolean)
                        .join(", ") || "Not set"}
                    </p>
                  </div>
                </div>
                {profileData.bio && (
                  <div className="admin-settings-bio-block">
                    <label>Bio</label>
                    <p>{profileData.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECURITY CARD */}
          <div className="admin-settings-card">
            <div className="admin-settings-card-header">
              <div>
                <h3>Security</h3>
                <p>Manage admin security and login related settings.</p>
              </div>
              <Lock className="w-5 h-5 admin-settings-icon-muted" />
            </div>

            <div className="admin-settings-security-grid">
              <div className="admin-settings-security-item">
                <span className="admin-settings-security-label">
                  Last Login
                </span>
                <span className="admin-settings-security-value">
                  {securitySettings.lastLogin}
                </span>
              </div>

              <div className="admin-settings-security-item">
                <span className="admin-settings-security-label">
                  Two-Factor Authentication
                </span>
                <span className="admin-settings-tag">Planned</span>
              </div>

              <div className="admin-settings-security-item">
                <span className="admin-settings-security-label">
                  Active Sessions
                </span>
                <span className="admin-settings-security-value">
                  This device
                </span>
              </div>
            </div>

            <div className="admin-settings-security-actions">
              <button className="admin-settings-btn-outline">
                Change Password
              </button>
              <button className="admin-settings-btn-ghost">
                Logout from all devices
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - BRANDING & RULES */}
        <div className="admin-settings-col">
          {/* BRANDING CARD */}
          <div className="admin-settings-card">
            <div className="admin-settings-card-header">
              <div>
                <h3>Platform Branding</h3>
                <p>Control how your platform looks and communicates.</p>
              </div>
              <Globe2 className="w-5 h-5 admin-settings-icon-muted" />
            </div>

            {brandingMessage && (
              <div
                className={`admin-settings-alert ${
                  brandingMessage.type === "success"
                    ? "admin-settings-alert-success"
                    : "admin-settings-alert-error"
                }`}
              >
                {brandingMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{brandingMessage.text}</span>
              </div>
            )}

            <div className="admin-settings-form">
              <div className="admin-settings-field">
                <label>Platform Name</label>
                <input
                  type="text"
                  value={brandingData.platformName}
                  onChange={(e) =>
                    handleBrandingChange("platformName", e.target.value)
                  }
                />
              </div>
              <div className="admin-settings-field">
                <label>Tagline</label>
                <input
                  type="text"
                  value={brandingData.tagline}
                  onChange={(e) =>
                    handleBrandingChange("tagline", e.target.value)
                  }
                />
              </div>

              <div className="admin-settings-two-col">
                <div className="admin-settings-field">
                  <label>Primary Brand Color</label>
                  <div className="admin-settings-color-input">
                    <input
                      type="color"
                      value={brandingData.primaryColor}
                      onChange={(e) =>
                        handleBrandingChange("primaryColor", e.target.value)
                      }
                    />
                    <span>{brandingData.primaryColor}</span>
                  </div>
                </div>
                <div className="admin-settings-field">
                  <label>Website URL</label>
                  <input
                    type="text"
                    value={brandingData.websiteUrl}
                    onChange={(e) =>
                      handleBrandingChange("websiteUrl", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="admin-settings-two-col">
                <div className="admin-settings-field">
                  <label>
                    <Mail className="w-4 h-4 admin-settings-label-icon" />
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={brandingData.supportEmail}
                    onChange={(e) =>
                      handleBrandingChange("supportEmail", e.target.value)
                    }
                  />
                </div>
                <div className="admin-settings-field">
                  <label>
                    <Phone className="w-4 h-4 admin-settings-label-icon" />
                    Support Phone
                  </label>
                  <input
                    type="text"
                    value={brandingData.supportPhone}
                    onChange={(e) =>
                      handleBrandingChange("supportPhone", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="admin-settings-field">
                <label>Help Center / FAQ URL</label>
                <input
                  type="text"
                  value={brandingData.helpCenterUrl}
                  onChange={(e) =>
                    handleBrandingChange("helpCenterUrl", e.target.value)
                  }
                  placeholder="https://theroac.com/help"
                />
              </div>

              <div className="admin-settings-actions">
                <button
                  className="admin-settings-btn-primary"
                  type="button"
                  onClick={handleSaveBranding}
                >
                  <Save className="w-4 h-4" />
                  Save Branding
                </button>
              </div>
            </div>
          </div>

          {/* RULES CARD */}
          <div className="admin-settings-card">
            <div className="admin-settings-card-header">
              <div>
                <h3>Platform Rules</h3>
                <p>Control default behavior for jobs, events & access.</p>
              </div>
              <Shield className="w-5 h-5 admin-settings-icon-muted" />
            </div>

            {rulesMessage && (
              <div
                className={`admin-settings-alert ${
                  rulesMessage.type === "success"
                    ? "admin-settings-alert-success"
                    : "admin-settings-alert-error"
                }`}
              >
                {rulesMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{rulesMessage.text}</span>
              </div>
            )}

            <div className="admin-settings-rules-list">
              <RuleToggle
                label="Auto-approve new recruiters"
                description="If enabled, new recruiters can start posting jobs without manual admin approval."
                checked={autoRules.autoApproveRecruiters}
                onChange={() => handleToggleRule("autoApproveRecruiters")}
              />
              <RuleToggle
                label="Auto-publish new jobs"
                description="If enabled, jobs posted by verified recruiters go live without review."
                checked={autoRules.autoPublishJobs}
                onChange={() => handleToggleRule("autoPublishJobs")}
              />
              <RuleToggle
                label="Auto-approve new events"
                description="If enabled, recruiter & admin created events will be visible immediately."
                checked={autoRules.autoApproveEvents}
                onChange={() => handleToggleRule("autoApproveEvents")}
              />
              <RuleToggle
                label="Require complete profile to apply"
                description="Candidates must complete minimum profile before applying to jobs & internships."
                checked={autoRules.requireCompleteProfileToApply}
                onChange={() =>
                  handleToggleRule("requireCompleteProfileToApply")
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Small sub-component for rule toggles
const RuleToggle = ({ label, description, checked, onChange }) => {
  return (
    <div className="admin-settings-rule-item">
      <div className="admin-settings-rule-text">
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
      <button
        type="button"
        className={`admin-settings-toggle ${checked ? "on" : "off"}`}
        onClick={onChange}
      >
        <div className="admin-settings-toggle-knob" />
      </button>
    </div>
  );
};

export default SettingsTab;
