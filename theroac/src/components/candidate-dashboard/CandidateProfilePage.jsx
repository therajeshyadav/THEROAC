import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import styles from "./CandidateProfilePage.module.css";

// Default empty profile (new user)
function getEmptyProfile() {
  return {
    fullName: "",
    headline: "",
    email: "",
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
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(getEmptyProfile());
  const [newSkill, setNewSkill] = useState("");

  // Jab initialProfile aaye (backend se), state update karo
  useEffect(() => {
    console.log('CandidateProfilePage - initialProfile:', initialProfile);
    if (initialProfile) {
      const updatedProfile = {
        ...getEmptyProfile(),
        fullName: initialProfile.fullName || initialProfile.name || "",
        headline: initialProfile.headline || "",
        email: initialProfile.email || "",
        location: initialProfile.location || "",
        about: initialProfile.about || initialProfile.bio || "",
        resumePath: initialProfile.resumePath || initialProfile.resumeUrl || "",
        resumeFile: null,
        skills: Array.isArray(initialProfile.skills) ? initialProfile.skills : [],
        experiences: Array.isArray(initialProfile.experiences) ? initialProfile.experiences : [],
        education: Array.isArray(initialProfile.education) ? initialProfile.education : [],
      };
      console.log('CandidateProfilePage - updatedProfile:', updatedProfile);
      setProfile(updatedProfile);
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

  // -------- SAVE PROFILE --------
  const handleSave = async () => {
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
            href={profile.resumePath}
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
