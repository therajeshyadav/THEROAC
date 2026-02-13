import { useState, useEffect } from "react";
import { X, Upload, Plus, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../../services/api";
import "./QuickListingForm.css";

const QuickListingForm = ({ isOpen, onClose, contentType, opportunityType, authUser }) => {
  const getInitialFormData = () => {
    const defaultOpportunityDescription = `This field helps you to mention the details of the opportunity you are listing. It is better to include Rules, Eligibility, Process, Format, etc., in order to get the opportunity approved. The more details, the better!

Guidelines:

• Mention all the guidelines like eligibility, format, etc.
• Inter-college team members allowed or not.
• Inter-specialization team members allowed or not.
• The number of questions/ problem statements.
• Duration of the rounds.

Rules:

• Mention the rules of the competition.`;

    const defaultJobInternshipDescription = `Roles

• 
• 

Responsibility

• 
• 

Requirements

• `;

    return {
      // Common fields
      logo: null,
      logoPreview: authUser?.company?.logo || null,
      title: "",
      organizationName: authUser?.company?.name || authUser?.organizationName || "",
      
      // Opportunity fields
      opportunityType: opportunityType || "",
      opportunitySubType: "",
      
      // Job/Internship fields
      workArrangements: "full-time",
      duration: "3",
      durationUnit: "months",
      
      // Common fields
      numberOfOpenings: 1,
      hideOpenings: false,
      festivalCampaign: "",
      companyWebsite: "",
      
      // Work Location
      workSetup: "in-office",
      workLocation: "",
      
      // Application Criteria
      whoCanApply: "everyone",
      collegeOrganization: "everyone",
      gender: "everyone",
      
      // Skills & Description
      skills: "",
      description: contentType === "opportunity" ? defaultOpportunityDescription : defaultJobInternshipDescription,
      
      // Participation (for opportunities)
      participationType: "individual",
      teamSizeMin: 1,
      teamSizeMax: 1,
      mode: "online",
      
      // Salary/Stipend
      payStructure: "range",
      salaryPeriod: "monthly",
      salaryCurrency: "INR",
      salaryMin: "",
      salaryMax: "",
      hideSalary: false,
      benefits: [],
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Criteria modal states
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [sameOrgTeam, setSameOrgTeam] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
      setSelectedColleges([]);
      setSelectedGenders([]);
      setSameOrgTeam(false);
      
      // Auto-expand description textarea after content loads
      setTimeout(() => {
        const textarea = document.getElementById('description');
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        }
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contentType, opportunityType]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Auto-expand textarea
    if (e.target.tagName === 'TEXTAREA') {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleDescriptionKeyDown = (e) => {
    // Auto-add bullet point on Enter key
    if (e.key === 'Enter' && e.target.name === 'description') {
      const cursorPosition = e.target.selectionStart;
      const textBeforeCursor = e.target.value.substring(0, cursorPosition);
      const textAfterCursor = e.target.value.substring(cursorPosition);
      
      // Check if current line starts with bullet
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      
      if (currentLine.trim().startsWith('•')) {
        e.preventDefault();
        const newValue = textBeforeCursor + '\n• ' + textAfterCursor;
        setFormData(prev => ({
          ...prev,
          description: newValue
        }));
        
        // Set cursor position after the bullet
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = cursorPosition + 3;
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }, 0);
      }
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file,
        logoPreview: URL.createObjectURL(file)
      }));
      if (errors.logo) {
        setErrors(prev => ({ ...prev, logo: "" }));
      }
    }
  };

  const handleBenefitToggle = (benefit) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  const handleSubmit = async (isDraft = false) => {
    // Validation logic
    const newErrors = {};

    if (!formData.logo && !formData.logoPreview) {
      newErrors.logo = "Logo is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }

    if (contentType === "opportunity" && !formData.opportunityType) {
      newErrors.opportunityType = "Opportunity type is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if ((contentType === "job" || contentType === "internship") && formData.workSetup !== "remote" && !formData.workLocation.trim()) {
      newErrors.workLocation = "Work location is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Prepare form data for API
      const apiData = new FormData();
      
      // Add logo file or URL
      if (formData.logo) {
        apiData.append("logo", formData.logo);
      } else if (formData.logoPreview) {
        apiData.append("companyLogo", formData.logoPreview);
      }

      // Add basic fields
      apiData.append("title", formData.title);
      apiData.append("companyName", formData.organizationName);
      apiData.append("description", formData.description);

      if (contentType === "job" || contentType === "internship") {
        // Job/Internship specific fields
        apiData.append("jobType", contentType === "internship" ? "internship" : formData.workArrangements);
        apiData.append("locationType", formData.workSetup === "in-office" ? "onsite" : formData.workSetup);
        apiData.append("location", formData.workLocation);
        apiData.append("numberOfPositions", formData.numberOfOpenings);
        
        // Salary
        if (formData.payStructure !== "unpaid") {
          apiData.append("salary", JSON.stringify({
            min: formData.salaryMin,
            max: formData.salaryMax,
            currency: formData.salaryCurrency,
            period: formData.salaryPeriod
          }));
        }

        // Benefits
        if (formData.benefits.length > 0) {
          apiData.append("perks", JSON.stringify(formData.benefits));
        }

        // Skills
        if (formData.skills.trim()) {
          const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(s => s);
          apiData.append("skills", JSON.stringify(skillsArray));
        }

        // Duration for internship
        if (contentType === "internship") {
          apiData.append("duration", `${formData.duration} ${formData.durationUnit}`);
        }
      } else if (contentType === "opportunity") {
        // Opportunity/Event specific fields
        apiData.append("eventType", formData.opportunityType);
        apiData.append("locationType", formData.mode);
        
        // Team size
        if (formData.participationType === "team") {
          apiData.append("minTeamSize", formData.teamSizeMin);
          apiData.append("maxTeamSize", formData.teamSizeMax);
        }
      }

      // Optional fields
      if (formData.festivalCampaign) {
        apiData.append("campaign", formData.festivalCampaign);
      }
      if (formData.companyWebsite) {
        apiData.append("companyWebsite", formData.companyWebsite);
      }

      // Draft status
      if (isDraft) {
        apiData.append("approvalStatus", "draft");
      }

      // Make API call
      let response;
      if (contentType === "job" || contentType === "internship") {
        response = await apiService.createJob(apiData);
      } else {
        response = await apiService.createEvent(apiData);
      }

      console.log("Created successfully:", response);
      
      // Show success message
      toast.success(isDraft ? "Saved as draft!" : "Published successfully!");
      
      // Close modal
      onClose();
      
      // Trigger refresh - dispatch custom event
      window.dispatchEvent(new CustomEvent('refreshListings', { 
        detail: { type: contentType } 
      }));
      
    } catch (error) {
      console.error("Error creating listing:", error);
      setErrors({ submit: error.message || "Failed to create listing" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getFormTitle = () => {
    if (contentType === "opportunity") return "Create Opportunity";
    if (contentType === "job") return "Create Job";
    if (contentType === "internship") return "Create Internship";
    return "Create Listing";
  };

  return (
    <div className="quick-listing-overlay" onClick={onClose}>
      <div className="quick-listing-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="quick-listing-header">
          <h2>{getFormTitle()}</h2>
          <button className="quick-listing-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="quick-listing-body">
          {/* Section 1: Basic Details */}
          <div className="form-section">
            <h3 className="form-section-title">Basic Details</h3>
            
            {/* Logo Upload */}
            <div className="form-group">
              <label>Logo <span className="required">*</span></label>
              <div className="logo-upload-container">
                <label htmlFor="logo-upload" className="logo-preview">
                  {formData.logoPreview ? (
                    <img src={formData.logoPreview} alt="Logo preview" />
                  ) : (
                    <Upload className="w-6 h-6" style={{ color: "rgba(255,255,255,0.4)" }} />
                  )}
                </label>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleLogoUpload}
                  style={{ display: "none" }}
                />
                <div className="logo-upload-text">
                  <label htmlFor="logo-upload" style={{ cursor: "pointer", color: "#FFD600" }}>
                    {formData.logoPreview ? "Change Logo" : "Add Logo"}
                  </label>
                  <p>Supported logo image JPG, JPEG, or PNG. Max 1 MB</p>
                </div>
              </div>
              {errors.logo && <span className="error-message">{errors.logo}</span>}
              {!formData.logo && <span className="logo-required">Logo required</span>}
            </div>

            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">
                {contentType === "opportunity" ? "Opportunity" : contentType === "job" ? "Job" : "Internship"} Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={`Example: ${contentType === "job" ? "Junior Software Engineer, Product Designer etc..." : "Enter title"}`}
                maxLength={190}
              />
              <span className="helper-text">Max 190 characters</span>
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Organization Name */}
            <div className="form-group">
              <label htmlFor="organizationName">Organisation Name <span className="required">*</span></label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleInputChange}
                placeholder="Organization name"
              />
              {errors.organizationName && <span className="error-message">{errors.organizationName}</span>}
            </div>

            {/* Opportunity Type (only for opportunities) */}
            {contentType === "opportunity" && (
              <>
                <div className="form-group">
                  <label htmlFor="opportunityType">Opportunity Type <span className="required">*</span></label>
                  <select
                    id="opportunityType"
                    name="opportunityType"
                    value={formData.opportunityType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select type</option>
                    <option value="competition">General & Case Competitions</option>
                    <option value="quiz">Quizzes</option>
                    <option value="hackathon">Hackathons & Coding Challenges</option>
                    <option value="webinar">Webinars, Conferences & Workshops</option>
                    <option value="cultural">Creative & Cultural Events</option>
                    <option value="scholarship">Scholarships</option>
                  </select>
                  {errors.opportunityType && <span className="error-message">{errors.opportunityType}</span>}
                </div>

                {formData.opportunityType && (
                  <div className="form-group">
                    <label htmlFor="opportunitySubType">Opportunity Sub-type <span className="required">*</span></label>
                    <select
                      id="opportunitySubType"
                      name="opportunitySubType"
                      value={formData.opportunitySubType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select sub-type</option>
                      {formData.opportunityType === "competition" && (
                        <>
                          <option value="general">General Competition</option>
                          <option value="case-study">Case Study</option>
                        </>
                      )}
                      {formData.opportunityType === "hackathon" && (
                        <>
                          <option value="online">Online Coding Challenge</option>
                          <option value="offline">Offline Hackathon</option>
                        </>
                      )}
                      {formData.opportunityType === "scholarship" && (
                        <>
                          <option value="national">National</option>
                          <option value="international">International</option>
                        </>
                      )}
                    </select>
                    {errors.opportunitySubType && <span className="error-message">{errors.opportunitySubType}</span>}
                  </div>
                )}
              </>
            )}

            {/* Work Arrangements (for jobs/internships) */}
            {(contentType === "job" || contentType === "internship") && (
              <div className="form-group">
                <label>Select applicable work arrangements</label>
                <div className="pills-container">
                  <button
                    type="button"
                    className={`pill-button ${formData.workArrangements === "full-time" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, workArrangements: "full-time" }))}
                  >
                    Full Time
                  </button>
                  <button
                    type="button"
                    className={`pill-button ${formData.workArrangements === "part-time" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, workArrangements: "part-time" }))}
                  >
                    Part Time
                  </button>
                  <button
                    type="button"
                    className={`pill-button ${formData.workArrangements === "contract" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, workArrangements: "contract" }))}
                  >
                    Contractual
                  </button>
                </div>
              </div>
            )}

            {/* Internship Duration */}
            {contentType === "internship" && (
              <div className="form-group">
                <label>Internship Duration <span className="required">*</span></label>
                <div className="form-row">
                  <select
                    name="durationUnit"
                    value={formData.durationUnit}
                    onChange={handleInputChange}
                  >
                    <option value="months">Months</option>
                    <option value="weeks">Weeks</option>
                  </select>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="3"
                  />
                </div>
              </div>
            )}

            {/* Number of Openings */}
            <div className="form-group">
              <label htmlFor="numberOfOpenings">No. of openings <span className="required">*</span></label>
              <input
                type="number"
                id="numberOfOpenings"
                name="numberOfOpenings"
                value={formData.numberOfOpenings}
                onChange={handleInputChange}
                min="1"
              />
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="hideOpenings"
                  name="hideOpenings"
                  checked={formData.hideOpenings}
                  onChange={handleInputChange}
                />
                <label htmlFor="hideOpenings">Hide No. of openings from candidates</label>
              </div>
            </div>

            {/* Festival/Campaign Link */}
            <div className="form-group">
              <label htmlFor="festivalCampaign">Link Festival/Campaign</label>
              <input
                type="text"
                id="festivalCampaign"
                name="festivalCampaign"
                value={formData.festivalCampaign}
                onChange={handleInputChange}
                placeholder="Enter Festival/campaign name"
              />
            </div>

            {/* Company Website */}
            <div className="form-group">
              <label htmlFor="companyWebsite">Company Website URL</label>
              <input
                type="url"
                id="companyWebsite"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleInputChange}
                placeholder="https:// Company Website URL"
              />
            </div>
          </div>

          {/* More sections will be added here */}
          
          {/* Section 2: Work Location (for jobs/internships) */}
          {(contentType === "job" || contentType === "internship") && (
            <div className="form-section">
              <h3 className="form-section-title">Work Location</h3>
              
              <div className="form-group">
                <label>Select work setup for this role</label>
                <div className="pills-container">
                  <button
                    type="button"
                    className={`pill-button ${formData.workSetup === "in-office" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, workSetup: "in-office" }))}
                  >
                    In Office
                  </button>
                  <button
                    type="button"
                    className={`pill-button ${formData.workSetup === "remote" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, workSetup: "remote" }))}
                  >
                    Remote
                  </button>
                  <button
                    type="button"
                    className={`pill-button ${formData.workSetup === "hybrid" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, workSetup: "hybrid" }))}
                  >
                    Hybrid
                  </button>
                  <button
                    type="button"
                    className={`pill-button ${formData.workSetup === "field-job" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, workSetup: "field-job" }))}
                  >
                    Field job
                  </button>
                </div>
              </div>

              {formData.workSetup !== "remote" && (
                <div className="form-group">
                  <label htmlFor="workLocation">Enter Work Location <span className="required">*</span></label>
                  <input
                    type="text"
                    id="workLocation"
                    name="workLocation"
                    value={formData.workLocation}
                    onChange={handleInputChange}
                    placeholder="Search by city, state, country"
                  />
                  <span className="helper-text" style={{ color: "#3B82F6", cursor: "pointer" }}>📍 Current location</span>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Opportunity Mode & Participation (for opportunities) */}
          {contentType === "opportunity" && (
            <div className="form-section">
              <h3 className="form-section-title">Opportunity Mode & Participation Type</h3>
              
              <div className="form-group">
                <label>Participation Type</label>
                <div className="pills-container">
                  <button
                    type="button"
                    className={`pill-button ${formData.participationType === "individual" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, participationType: "individual", teamSizeMin: 1, teamSizeMax: 1 }))}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    className={`pill-button ${formData.participationType === "team" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, participationType: "team" }))}
                  >
                    Team Participation
                  </button>
                </div>
              </div>

              {formData.participationType === "team" && (
                <div className="form-group">
                  <label>Set team size</label>
                  <div className="form-row">
                    <div>
                      <label htmlFor="teamSizeMin" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Min:</label>
                      <input
                        type="number"
                        id="teamSizeMin"
                        name="teamSizeMin"
                        value={formData.teamSizeMin}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>
                    <div>
                      <label htmlFor="teamSizeMax" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Max:</label>
                      <input
                        type="number"
                        id="teamSizeMax"
                        name="teamSizeMax"
                        value={formData.teamSizeMax}
                        onChange={handleInputChange}
                        min={formData.teamSizeMin}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Mode of Opportunity</label>
                <div className="pills-container">
                  <button
                    type="button"
                    className={`pill-button ${formData.mode === "online" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, mode: "online" }))}
                  >
                    Online
                  </button>
                  <button
                    type="button"
                    className={`pill-button ${formData.mode === "offline" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, mode: "offline" }))}
                  >
                    Offline
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Remaining Sections */}
          <RemainingFormSections
            contentType={contentType}
            formData={formData}
            handleInputChange={handleInputChange}
            handleDescriptionKeyDown={handleDescriptionKeyDown}
            handleBenefitToggle={handleBenefitToggle}
            errors={errors}
            showCollegeModal={showCollegeModal}
            setShowCollegeModal={setShowCollegeModal}
            showGenderModal={showGenderModal}
            setShowGenderModal={setShowGenderModal}
            selectedColleges={selectedColleges}
            setSelectedColleges={setSelectedColleges}
            selectedGenders={selectedGenders}
            setSelectedGenders={setSelectedGenders}
            sameOrgTeam={sameOrgTeam}
            setSameOrgTeam={setSameOrgTeam}
          />
        </div>

        {/* Footer */}
        <div className="quick-listing-footer">
          <button className="footer-button cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="footer-button draft-btn" onClick={() => handleSubmit(true)}>
            Save as Draft
          </button>
          <button className="footer-button publish-btn" onClick={() => handleSubmit(false)} disabled={loading}>
            <Plus className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickListingForm;


// Helper component for rendering remaining sections
const RemainingFormSections = ({ 
  contentType, 
  formData, 
  handleInputChange,
  handleDescriptionKeyDown,
  handleBenefitToggle, 
  errors,
  showCollegeModal,
  setShowCollegeModal,
  showGenderModal,
  setShowGenderModal,
  selectedColleges,
  setSelectedColleges,
  selectedGenders,
  setSelectedGenders,
  sameOrgTeam,
  setSameOrgTeam
}) => {
  const benefitsList = contentType === "internship" 
    ? ["Job Offer", "Certificate of Completion", "Letter of Recommendation", "Medical Insurance", "Transport", "Food & Beverages", "In-Office Gym/ Yoga Studio", "Learning Allowance", "Office Library", "Flexible Hours", "Hybrid Working", "Counselling Support", "Creche Facilities", "Pre-Placement Offer", "Others"]
    : ["Employee Stock", "Certificate of Completion", "Letter of Recommendation", "Medical Insurance", "Transport", "Food & Beverages", "In-Office Gym/ Yoga Studio", "Learning Allowance", "Office Library", "Flexible Hours", "Hybrid Working", "Counselling Support", "Creche Facilities", "Pre-Placement Offer", "Others"];

  return (
    <>
      {/* Section 4: Application Criteria */}
      <div className="form-section">
        <h3 className="form-section-title">
          {contentType === "opportunity" ? "Registration Criteria" : "Application Criteria"}
        </h3>
        
        <div className="form-group">
          <label>Who can {contentType === "opportunity" ? "register" : "apply"}?</label>
          <div className="pills-container">
            <button
              type="button"
              className={`pill-button ${formData.whoCanApply === "everyone" ? "active" : ""}`}
              onClick={() => handleInputChange({ target: { name: "whoCanApply", value: "everyone" } })}
            >
              Everyone can apply
            </button>
            <button
              type="button"
              className={`pill-button ${formData.whoCanApply === "college-students" ? "active" : ""}`}
              onClick={() => handleInputChange({ target: { name: "whoCanApply", value: "college-students" } })}
            >
              College Students
            </button>
            <button
              type="button"
              className={`pill-button ${formData.whoCanApply === "freshers" ? "active" : ""}`}
              onClick={() => handleInputChange({ target: { name: "whoCanApply", value: "freshers" } })}
            >
              Freshers
            </button>
            <button
              type="button"
              className={`pill-button ${formData.whoCanApply === "professionals" ? "active" : ""}`}
              onClick={() => handleInputChange({ target: { name: "whoCanApply", value: "professionals" } })}
            >
              Professionals
            </button>
            {contentType === "opportunity" && (
              <button
                type="button"
                className={`pill-button ${formData.whoCanApply === "school-students" ? "active" : ""}`}
                onClick={() => handleInputChange({ target: { name: "whoCanApply", value: "school-students" } })}
              >
                School Students
              </button>
            )}
          </div>
        </div>

        <div className="default-info-box">
          <div className="default-info-text">
            <h4>
              {selectedColleges.length > 0 
                ? `${selectedColleges.length} College/Organization(s) selected` 
                : "Default : Everyone can apply"}
            </h4>
            <p>Restrict applicants based on their College/Organization</p>
          </div>
          <button type="button" className="change-button" onClick={() => setShowCollegeModal(true)}>
            <Pencil className="w-4 h-4" />
            Change
          </button>
        </div>

        <div className="default-info-box" style={{ marginTop: "1rem" }}>
          <div className="default-info-text">
            <h4>
              {selectedGenders.length > 0 
                ? `${selectedGenders.join(", ")} selected` 
                : "Default : Everyone can apply"}
            </h4>
            <p>Restrict applicants based on their Gender</p>
          </div>
          <button type="button" className="change-button" onClick={() => setShowGenderModal(true)}>
            <Pencil className="w-4 h-4" />
            Change
          </button>
        </div>

        {/* College/Organization Modal */}
        {showCollegeModal && (
          <div className="criteria-modal-overlay" onClick={() => setShowCollegeModal(false)}>
            <div className="criteria-modal" onClick={(e) => e.stopPropagation()}>
              <div className="criteria-modal-header">
                <h3>College/Organization</h3>
                <button className="criteria-modal-close" onClick={() => setShowCollegeModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="criteria-modal-subtitle">Restrict applicants by college/organization</p>
              
              <div className="criteria-options">
                <button
                  type="button"
                  className={`criteria-option-btn ${selectedColleges.length === 0 ? "active" : ""}`}
                  onClick={() => setSelectedColleges([])}
                >
                  Allow All
                </button>
                <button
                  type="button"
                  className={`criteria-option-btn ${selectedColleges.length > 0 ? "active" : ""}`}
                  onClick={() => {
                    if (selectedColleges.length === 0) {
                      setSelectedColleges(["Sample College"]);
                    }
                  }}
                >
                  Eligible College/Organization(s)
                </button>
              </div>

              {selectedColleges.length > 0 && (
                <div className="criteria-input-section">
                  <input
                    type="text"
                    placeholder="Search and add colleges/organizations"
                    className="criteria-search-input"
                  />
                  <div className="selected-items">
                    {selectedColleges.map((college, idx) => (
                      <div key={idx} className="selected-item-tag">
                        {college}
                        <button onClick={() => setSelectedColleges(selectedColleges.filter((_, i) => i !== idx))}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {contentType === "opportunity" && (
                    <div className="checkbox-group" style={{ marginTop: "1rem" }}>
                      <input
                        type="checkbox"
                        id="sameOrgTeam"
                        checked={sameOrgTeam}
                        onChange={(e) => setSameOrgTeam(e.target.checked)}
                      />
                      <label htmlFor="sameOrgTeam">Member of a team should be from same organizations.</label>
                    </div>
                  )}
                </div>
              )}

              <div className="criteria-modal-footer">
                <button className="criteria-cancel-btn" onClick={() => setShowCollegeModal(false)}>
                  Cancel
                </button>
                <button className="criteria-save-btn" onClick={() => setShowCollegeModal(false)}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gender Modal */}
        {showGenderModal && (
          <div className="criteria-modal-overlay" onClick={() => setShowGenderModal(false)}>
            <div className="criteria-modal" onClick={(e) => e.stopPropagation()}>
              <div className="criteria-modal-header">
                <h3>Gender</h3>
                <button className="criteria-modal-close" onClick={() => setShowGenderModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="criteria-modal-subtitle">Restrict applicants based on their gender</p>
              
              <div className="criteria-options">
                <button
                  type="button"
                  className={`criteria-option-btn ${selectedGenders.length === 0 ? "active" : ""}`}
                  onClick={() => setSelectedGenders([])}
                >
                  Allow All
                </button>
              </div>

              <div className="gender-pills-grid">
                {["Female", "Male", "Transgender", "Intersex", "Non-binary", "Prefer not to say", "Others"].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    className={`gender-pill-btn ${selectedGenders.includes(gender) ? "selected" : ""}`}
                    onClick={() => {
                      if (selectedGenders.includes(gender)) {
                        setSelectedGenders(selectedGenders.filter(g => g !== gender));
                      } else {
                        setSelectedGenders([...selectedGenders, gender]);
                      }
                    }}
                  >
                    {gender}
                  </button>
                ))}
              </div>

              <div className="criteria-modal-footer">
                <button className="criteria-cancel-btn" onClick={() => setShowGenderModal(false)}>
                  Cancel
                </button>
                <button className="criteria-save-btn" onClick={() => setShowGenderModal(false)}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 5: Skills */}
      <div className="form-section">
        <h3 className="form-section-title">
          {contentType === "opportunity" ? "Skills to be assessed" : "Skills required"}
        </h3>
        
        <div className="form-group">
          <textarea
            name="skills"
            value={formData.skills}
            onChange={handleInputChange}
            placeholder="Example: Photoshop, MS Office, etc."
            rows="3"
          />
          <span className="helper-text">
            {contentType === "opportunity" 
              ? "List required skills to attract participants with matching abilities or engage individuals eager to improve them"
              : "Add up to 10 skills. We'll use these to show candidates at a glance what you're looking for."}
          </span>
        </div>
      </div>

      {/* Section 6: Salary & Benefits (for jobs/internships) */}
      {(contentType === "job" || contentType === "internship") && (
        <div className="form-section">
          <h3 className="form-section-title">
            {contentType === "internship" ? "Stipend & Benefits" : "Salary & Benefits"}
          </h3>
          
          <div className="form-group">
            <label>How is the pay structured?</label>
            <div className="pills-container">
              <button
                type="button"
                className={`pill-button ${formData.payStructure === "fixed" ? "active" : ""}`}
                onClick={() => handleInputChange({ target: { name: "payStructure", value: "fixed" } })}
              >
                Fixed
              </button>
              <button
                type="button"
                className={`pill-button ${formData.payStructure === "range" ? "active" : ""}`}
                onClick={() => handleInputChange({ target: { name: "payStructure", value: "range" } })}
              >
                Range
              </button>
              <button
                type="button"
                className={`pill-button ${formData.payStructure === "fixed-variable" ? "active" : ""}`}
                onClick={() => handleInputChange({ target: { name: "payStructure", value: "fixed-variable" } })}
              >
                Fixed + Variable
              </button>
              {contentType === "internship" && (
                <button
                  type="button"
                  className={`pill-button ${formData.payStructure === "unpaid" ? "active" : ""}`}
                  onClick={() => handleInputChange({ target: { name: "payStructure", value: "unpaid" } })}
                >
                  Unpaid
                </button>
              )}
            </div>
          </div>

          {formData.payStructure !== "unpaid" && (
            <div className="form-group">
              <label>Enter {contentType === "internship" ? "stipend" : "salary"} range</label>
              <div className="form-row">
                <select
                  name="salaryPeriod"
                  value={formData.salaryPeriod}
                  onChange={handleInputChange}
                >
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                </select>
                <select
                  name="salaryCurrency"
                  value={formData.salaryCurrency}
                  onChange={handleInputChange}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div className="form-row" style={{ marginTop: "1rem" }}>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleInputChange}
                  placeholder="Min 0"
                />
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleInputChange}
                  placeholder="Max 0"
                />
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="hideSalary"
                  name="hideSalary"
                  checked={formData.hideSalary}
                  onChange={handleInputChange}
                />
                <label htmlFor="hideSalary">Hide the {contentType === "internship" ? "stipend" : "salary"} amount from candidates</label>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Benefits/Perks</label>
            <div className="benefits-grid">
              {benefitsList.map((benefit) => (
                <button
                  key={benefit}
                  type="button"
                  className={`benefit-pill ${formData.benefits.includes(benefit) ? "selected" : ""}`}
                  onClick={() => handleBenefitToggle(benefit)}
                >
                  {benefit}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 7: Description */}
      <div className="form-section">
        <h3 className="form-section-title">
          {contentType === "opportunity" ? "About the Opportunity" : "About the role and skills"}
        </h3>
        
        <div className="form-group">
          <label htmlFor="description">
            {contentType === "opportunity" ? "Opportunity" : contentType === "job" ? "Job" : "Internship"} Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            onKeyDown={handleDescriptionKeyDown}
            placeholder={
              contentType === "opportunity"
                ? "Include Rules, Eligibility, Process, Format, etc."
                : "Include role expectations, required skills and key responsibilities"
            }
            style={{ 
              minHeight: '150px',
              overflow: 'hidden',
              resize: 'vertical'
            }}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>
      </div>
    </>
  );
};
