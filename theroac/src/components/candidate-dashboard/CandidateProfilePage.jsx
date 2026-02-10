import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Award } from "lucide-react";
import styles from "./CandidateProfilePage.module.css";
import ProfileQuiz from "../ProfileQuiz";

// Default empty profile (new user)
function getEmptyProfile() {
  return {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    about: "",
    // backend se aane wala stored resume path/url
    resumePath: "",
    // frontend par abhi select ki hui file
    resumeFile: null,
    skills: [],
    experiences: [],
    education: [],
    badges: [], // Add badges field
  };
}

/**
 * Props:
 *  - initialProfile: backend se logged-in user ka profile object
 *  - onSaveProfile: async (profile) => {...}  // yaha API call karoge
 */
const CandidateProfilePage = ({ initialProfile, onSaveProfile }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(getEmptyProfile());
  const [newSkill, setNewSkill] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [tempPhone, setTempPhone] = useState("");
  const [isPhoneMandatory, setIsPhoneMandatory] = useState(false);
  const [showProfileQuiz, setShowProfileQuiz] = useState(false);

  // Jab initialProfile aaye (backend se), state update karo
  useEffect(() => {
    console.log("initialProfile received:", initialProfile); // Debug log
    console.log("FULL initialProfile =", initialProfile);
    console.log("initialProfile.badges =", initialProfile?.badges);
    
    // Check if user has completed Profile Quiz
    const hasProfileQuizBadge = initialProfile?.badges && 
      Array.isArray(initialProfile.badges) && 
      initialProfile.badges.some(badge => 
        badge.category === 'Profile Quiz' || 
        badge.name === 'RET' || 
        badge.name === 'RTE'  // Old badge name
      );
    console.log("Has Profile Quiz Badge:", hasProfileQuizBadge);
    
    if (initialProfile) {
      const updatedProfile = {
        ...getEmptyProfile(),
        fullName: initialProfile.fullName || initialProfile.name || "",
        headline: initialProfile.headline || "",
        email: initialProfile.email || "",
        phone: initialProfile.phone || "",
        location: initialProfile.location || "",
        about: initialProfile.about || initialProfile.bio || "",
        resumePath: initialProfile.resumePath || initialProfile.resumeUrl || "",
        resumeFile: null,
        skills: Array.isArray(initialProfile.skills)
          ? initialProfile.skills
          : [],
        experiences: Array.isArray(initialProfile.experiences)
          ? initialProfile.experiences
          : [],
        education: Array.isArray(initialProfile.education)
          ? initialProfile.education
          : [],
        badges: Array.isArray(initialProfile.badges)
          ? initialProfile.badges
          : [], // Add badges
      };
      console.log("Updated profile with badges:", updatedProfile.badges); // Debug log
      setProfile(updatedProfile);

      // Check if phone number is missing and show modal
      if (!initialProfile.phone || initialProfile.phone.trim() === "") {
        setShowPhoneModal(true);
        setIsPhoneMandatory(true);
      }
    }
  }, [initialProfile]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // -------- SKILLS --------
  const handleSkillAdd = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    setProfile((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), skill],
    }));
    setNewSkill("");
  };

  const handleSkillRemove = (index) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // -------- EXPERIENCE --------
  const handleExperienceChange = (index, field, value) => {
    const list = [...(profile.experiences || [])];
    list[index] = { ...list[index], [field]: value };
    setProfile((prev) => ({ ...prev, experiences: list }));
  };

  const addExperience = () => {
    setProfile((prev) => ({
      ...prev,
      experiences: [
        ...(prev.experiences || []),
        { title: "", company: "", duration: "" },
      ],
    }));
  };

  const removeExperience = (index) => {
    setProfile((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
  };

  // -------- EDUCATION --------
  const handleEducationChange = (index, field, value) => {
    const list = [...(profile.education || [])];
    list[index] = { ...list[index], [field]: value };
    setProfile((prev) => ({ ...prev, education: list }));
  };

  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        { degree: "", institute: "", duration: "" },
      ],
    }));
  };

  const removeEducation = (index) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // -------- RESUME FILE UPLOAD --------
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // sirf PDF allow
    if (file.type !== "application/pdf") {
      alert("Please upload PDF resume only");
      return;
    }

    setProfile((prev) => ({
      ...prev,
      resumeFile: file, // actual File object
    }));
  };

  // -------- PHONE VALIDATION HELPER --------
  const validatePhoneNumber = (phone) => {
    if (!phone || phone.trim() === "") {
      return { isValid: false, message: "Phone number is mandatory." };
    }

    // Remove all spaces and special characters except +
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    // Check for Indian phone number patterns
    const patterns = [
      /^\+91[6-9]\d{9}$/, // +91XXXXXXXXXX
      /^91[6-9]\d{9}$/, // 91XXXXXXXXXX
      /^[6-9]\d{9}$/, // XXXXXXXXXX
    ];

    const isValid = patterns.some((pattern) => pattern.test(cleanPhone));

    if (!isValid) {
      return {
        isValid: false,
        message:
          "Please enter a valid Indian phone number (10 digits starting with 6-9)",
      };
    }

    return { isValid: true, message: "" };
  };

  // -------- SAVE PHONE FROM MODAL --------
  const handleSavePhoneFromModal = async () => {
    const validation = validatePhoneNumber(tempPhone);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    try {
      setSaving(true);
      const updatedProfile = { ...profile, phone: tempPhone };
      setProfile(updatedProfile);

      if (onSaveProfile) {
        await onSaveProfile(updatedProfile);
      }

      setShowPhoneModal(false);
      setTempPhone("");
      setIsPhoneMandatory(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save phone number");
    } finally {
      setSaving(false);
    }
  };

  // -------- SAVE PROFILE --------
  const handleSave = async () => {
    const validation = validatePhoneNumber(profile.phone);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    try {
      setSaving(true);
      if (onSaveProfile) {
        await onSaveProfile(profile); // parent me API call
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // -------- PROFILE QUIZ HANDLERS --------
  const handleStartProfileQuiz = () => {
    if (!profile.skills || profile.skills.length === 0) {
      alert(
        "Please add skills to your profile first to take the assessment quiz.",
      );
      return;
    }
    setShowProfileQuiz(true);
  };

  const handleQuizComplete = async (results) => {
    console.log("Quiz completed:", results);

    // Update profile with new badges immediately for UI
    if (results.badges && results.badges.length > 0) {
      setProfile((prev) => ({
        ...prev,
        badges: results.badges,
      }));
    }

    setShowProfileQuiz(false);

    // Clear localStorage and fetch fresh user data
    try {
      console.log("Fetching fresh user data...");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:4000/api"}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);
        const updatedUser = data.user || data;
        console.log("Updated user badges:", updatedUser.badges);

        // Update localStorage with fresh data including badges
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("Updated localStorage with badges:", updatedUser.badges);

        // Force page refresh to reload with new data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error("API response not ok:", response.status);
      }
    } catch (error) {
      console.error("Error fetching updated user data:", error);
      // Fallback: just refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const handleCloseQuiz = () => {
    setShowProfileQuiz(false);
  };

  // 🔥 ADD THIS
  const getBadgeTier = (score) => {
    if (score >= 80) return "gold";
    if (score >= 60) return "silver";
    return "bronze";
  };

  return (
    <div className={styles.page}>
      {/* ================== HEADER / COVER ================== */}
      <div className={styles.cover}>
        <div className={styles.coverLeft}>
          <div className={styles.avatar}>
            <User size={60} />
          </div>

          <div className={styles.userInfo}>
            {isEditing ? (
              <>
                <input
                  className={styles.inputBig}
                  placeholder="Full Name"
                  value={profile.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Phone Number"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Headline (e.g. Full Stack Developer)"
                  value={profile.headline}
                  onChange={(e) => handleChange("headline", e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Location"
                  value={profile.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </>
            ) : (
              <>
                <h2>{profile.fullName || "Your Name"}</h2>
                <p style={{ color: profile.phone ? "#ffffff" : "#ff6b6b" }}>
                  {profile.phone || "⚠️ Phone number required"}
                </p>
                <p>{profile.headline || "Add your headline"}</p>
                <p className={styles.muted}>
                  {profile.location || "Add your location"}
                </p>
              </>
            )}
          </div>
        </div>

        <div className={styles.coverRight}>
          <p className={styles.muted}>{profile.email}</p>

          {isEditing ? (
            <div className={styles.actionRow}>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              className={styles.primaryBtn}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ================== ABOUT ================== */}
      <Section title="About">
        {isEditing ? (
          <textarea
            className={styles.textarea}
            rows={4}
            placeholder="Write about yourself..."
            value={profile.about}
            onChange={(e) => handleChange("about", e.target.value)}
          />
        ) : (
          <p className={styles.text}>
            {profile.about || "Add your professional summary."}
          </p>
        )}
      </Section>

      {/* ================== RESUME ================== */}
      <Section title="Resume">
        {isEditing ? (
          <div className={styles.resumeRow}>
            <label className={styles.mutedSmall}>
              Upload your resume (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleResumeChange}
            />

            {profile.resumeFile && (
              <span className={styles.mutedSmall}>
                Selected file: {profile.resumeFile.name}
              </span>
            )}

            {!profile.resumeFile && !profile.resumePath && (
              <span className={styles.mutedSmall}>No file selected</span>
            )}
          </div>
        ) : profile.resumePath ? (
          <a
            href={`${(process.env.REACT_APP_API_URL || "http://localhost:4000/api").replace("/api", "")}${profile.resumePath}`}
            className={styles.primaryBtn}
            target="_blank"
            rel="noreferrer"
          >
            View / Download Resume
          </a>
        ) : (
          <p className={styles.text}>No resume uploaded yet.</p>
        )}
      </Section>

      {/* ================== SKILLS ================== */}
      <Section title="Skills">
        {isEditing ? (
          <>
            <div className={styles.skillInputRow}>
              <input
                className={styles.input}
                placeholder="Add a skill (e.g. React.js)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSkillAdd()}
              />
              <button
                className={styles.primaryBtn}
                type="button"
                onClick={handleSkillAdd}
              >
                Add
              </button>
            </div>
            <div className={styles.skillWrap}>
              {(profile.skills || []).map((skill, i) => (
                <span
                  key={i}
                  className={styles.skill}
                  onClick={() => handleSkillRemove(i)}
                  title="Click to remove"
                >
                  {skill} ✕
                </span>
              ))}
            </div>
          </>
        ) : (profile.skills || []).length ? (
          <div className={styles.skillWrap}>
            {profile.skills.map((skill, i) => (
              <span key={i} className={styles.skill}>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className={styles.text}>No skills added yet.</p>
        )}
      </Section>

      {/* ================== EXPERIENCE ================== */}
      <Section
        title="Work Experience"
        action={
          isEditing && (
            <button
              type="button"
              className={styles.linkBtn}
              onClick={addExperience}
            >
              + Add Experience
            </button>
          )
        }
      >
        {isEditing ? (
          (profile.experiences || []).length ? (
            profile.experiences.map((exp, idx) => (
              <div key={idx} className={styles.cardRow}>
                <input
                  className={styles.input}
                  placeholder="Title (e.g. Full Stack Developer)"
                  value={exp.title}
                  onChange={(e) =>
                    handleExperienceChange(idx, "title", e.target.value)
                  }
                />
                <input
                  className={styles.input}
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) =>
                    handleExperienceChange(idx, "company", e.target.value)
                  }
                />
                <input
                  className={styles.input}
                  placeholder="Duration (e.g. Sep 2025 - Present)"
                  value={exp.duration}
                  onChange={(e) =>
                    handleExperienceChange(idx, "duration", e.target.value)
                  }
                />
                <button
                  type="button"
                  className={styles.smallRemove}
                  onClick={() => removeExperience(idx)}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className={styles.text}>No experience added yet.</p>
          )
        ) : (profile.experiences || []).length ? (
          profile.experiences.map((exp, idx) => (
            <div key={idx} className={styles.cardRow}>
              <h4>{exp.title}</h4>
              <p className={styles.textSmall}>{exp.company}</p>
              <span className={styles.mutedSmall}>{exp.duration}</span>
            </div>
          ))
        ) : (
          <p className={styles.text}>No experience added yet.</p>
        )}
      </Section>

      {/* ================== EDUCATION ================== */}
      <Section
        title="Education"
        action={
          isEditing && (
            <button
              type="button"
              className={styles.linkBtn}
              onClick={addEducation}
            >
              + Add Education
            </button>
          )
        }
      >
        {isEditing ? (
          (profile.education || []).length ? (
            profile.education.map((ed, idx) => (
              <div key={idx} className={styles.cardRow}>
                <input
                  className={styles.input}
                  placeholder="Degree (e.g. B.Tech CSE)"
                  value={ed.degree}
                  onChange={(e) =>
                    handleEducationChange(idx, "degree", e.target.value)
                  }
                />
                <input
                  className={styles.input}
                  placeholder="Institute"
                  value={ed.institute}
                  onChange={(e) =>
                    handleEducationChange(idx, "institute", e.target.value)
                  }
                />
                <input
                  className={styles.input}
                  placeholder="Duration (e.g. 2022 - Present)"
                  value={ed.duration}
                  onChange={(e) =>
                    handleEducationChange(idx, "duration", e.target.value)
                  }
                />
                <button
                  type="button"
                  className={styles.smallRemove}
                  onClick={() => removeEducation(idx)}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className={styles.text}>No education added yet.</p>
          )
        ) : (profile.education || []).length ? (
          profile.education.map((ed, idx) => (
            <div key={idx} className={styles.cardRow}>
              <h4>{ed.degree}</h4>
              <p className={styles.textSmall}>{ed.institute}</p>
              <span className={styles.mutedSmall}>{ed.duration}</span>
            </div>
          ))
        ) : (
          <p className={styles.text}>No education added yet.</p>
        )}
      </Section>

      {/* ================== RTE BADGE ================== */}
      <Section
        title="RTE Badge"
        action={<Award size={20} style={{ color: "#ffd600" }} />}
      >
        <div className={styles.rteBadgeSection}>
          {/* Debug: Show badges data */}
          {console.log("Profile badges:", profile.badges)}
          {profile.badges && profile.badges.length > 0 ? (
            <div className={styles.badgeDisplay}>
              <div className={styles.realBadgeWrap}>
                {profile.badges.map((badge, index) => {
                  const tier = getBadgeTier(badge.score);

                  return (
                    <div
                      key={index}
                      className={`${styles.realBadge} ${styles[tier]}`}
                    >
                      <div className={styles.badgeCircle}>
                        <Award size={36} />
                      </div>

                      <h4 className={styles.badgeName}>{badge.name}</h4>
                      <p className={styles.badgeLevel}>{badge.level}</p>

                      <div className={styles.badgeScore}>{badge.score}%</div>

                      <span className={styles.verified}>✔ Verified Skill</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <p className={styles.text}>
                Complete the RTE assessment to earn your skill badge.
              </p>
              {/* Debug info */}
              <p className={styles.mutedSmall} style={{ marginTop: "10px" }}>
                Debug: Badges length ={" "}
                {profile.badges ? profile.badges.length : "undefined"}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* ================== SKILL ASSESSMENT ================== */}
      <Section
        title="Skill Assessment"
        action={<Award size={20} style={{ color: "#ffd700" }} />}
      >
        <div className={styles.quizSection}>
          <p className={styles.text}>
            Take a one-time skill assessment quiz to earn badges and showcase
            your expertise to recruiters. The quiz will be generated based on
            your profile skills.
          </p>
          <div className={styles.quizInfo}>
            <p className={styles.mutedSmall}>
              • Questions based on your skills:{" "}
              {profile.skills?.length > 0
                ? profile.skills.join(", ")
                : "Add skills first"}
            </p>
            <p className={styles.mutedSmall}>
              • Earn Gold, Silver, or Bronze badges
            </p>
            <p className={styles.mutedSmall}>
              • One-time opportunity per profile
            </p>
          </div>
          <button
            className={styles.primaryBtn}
            onClick={handleStartProfileQuiz}
            disabled={
              !profile.skills || 
              profile.skills.length === 0 || 
              (initialProfile?.badges && Array.isArray(initialProfile.badges) && 
               initialProfile.badges.some(badge => 
                 badge.category === 'Profile Quiz' || 
                 badge.name === 'RET' || 
                 badge.name === 'RTE'  // Old badge name
               ))
            }
          >
            {(initialProfile?.badges && Array.isArray(initialProfile.badges) && 
              initialProfile.badges.some(badge => 
                badge.category === 'Profile Quiz' || 
                badge.name === 'RET' || 
                badge.name === 'RTE'  // Old badge name
              ))
              ? "Quiz Already Completed ✓"
              : !profile.skills || profile.skills.length === 0
              ? "Add Skills First"
              : "Take Skill Assessment"}
          </button>
        </div>
      </Section>

      {/* ================== MANDATORY PHONE MODAL ================== */}
      {showPhoneModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Phone Number Required</h3>
              <p>
                {isPhoneMandatory
                  ? "Please add your phone number to complete your profile. This is mandatory for all users and cannot be skipped."
                  : "Please add your phone number to complete your profile. This is mandatory for all users."}
              </p>
            </div>
            <div className={styles.modalBody}>
              <input
                className={styles.input}
                type="tel"
                placeholder="Enter your phone number"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                maxLength="13"
              />
              <p className={styles.modalNote}>
                Format: +91XXXXXXXXXX or 10-digit number starting with 6-9
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.primaryBtn}
                onClick={handleSavePhoneFromModal}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Phone Number"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== PROFILE QUIZ MODAL ================== */}
      {showProfileQuiz && (
        <ProfileQuiz
          userSkills={profile.skills}
          onQuizComplete={handleQuizComplete}
          onClose={handleCloseQuiz}
        />
      )}
    </div>
  );
};

const Section = ({ title, children, action }) => (
  <section className={styles.section}>
    <div className={styles.sectionHeader}>
      <h3>{title}</h3>
      {action}
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </section>
);

export default CandidateProfilePage;
