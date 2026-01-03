import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import styles from "./CandidateProfilePage.module.css";

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

  // Jab initialProfile aaye (backend se), state update karo
  useEffect(() => {
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
        skills: Array.isArray(initialProfile.skills) ? initialProfile.skills : [],
        experiences: Array.isArray(initialProfile.experiences) ? initialProfile.experiences : [],
        education: Array.isArray(initialProfile.education) ? initialProfile.education : [],
      };
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
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check for Indian phone number patterns
    const patterns = [
      /^\+91[6-9]\d{9}$/, // +91XXXXXXXXXX
      /^91[6-9]\d{9}$/,   // 91XXXXXXXXXX
      /^[6-9]\d{9}$/      // XXXXXXXXXX
    ];

    const isValid = patterns.some(pattern => pattern.test(cleanPhone));
    
    if (!isValid) {
      return { 
        isValid: false, 
        message: "Please enter a valid Indian phone number (10 digits starting with 6-9)" 
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
                <p style={{ color: profile.phone ? '#ffffff' : '#ff6b6b' }}>
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
            href={`${(process.env.REACT_APP_API_URL || 'http://localhost:4000/api').replace('/api', '')}${profile.resumePath}`}
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

      {/* ================== QUIZ FOR BADGE ================== */}
      <Section title="Quiz for Badge">
        <div className={styles.quizSection}>
          <p className={styles.text}>
            Take skill-based quizzes to earn badges and showcase your expertise to recruiters.
          </p>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate('/quiz')}
          >
            Take Quiz
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
                  : "Please add your phone number to complete your profile. This is mandatory for all users."
                }
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
