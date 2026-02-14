import React from 'react';
import { Edit2 } from 'lucide-react';
import '../StepStyles.css';

const ReviewStep = ({ formData, contentType, onEditStep }) => {
  const getTypeLabel = () => {
    if (contentType === 'job') return 'Job';
    if (contentType === 'internship') return 'Internship';
    return 'Opportunity';
  };

  const ReviewSection = ({ title, stepIndex, children }) => (
    <div className="unified-review-section">
      <div className="unified-review-section-header">
        <h3 className="unified-review-section-title">{title}</h3>
        <button 
          className="unified-icon-btn" 
          onClick={() => onEditStep(stepIndex)}
          title="Edit this section"
        >
          <Edit2 size={16} />
        </button>
      </div>
      <div className="unified-review-section-content">
        {children}
      </div>
    </div>
  );

  const ReviewItem = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="unified-review-item">
        <span className="unified-review-label">{label}:</span>
        <span className="unified-review-value">{value}</span>
      </div>
    );
  };

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">Review & Publish</h2>
        <p className="unified-step-description">
          Review all details before publishing your {getTypeLabel().toLowerCase()}
        </p>
      </div>

      <div className="unified-review-container">
        {/* Basic Details */}
        <ReviewSection title="Basic Details" stepIndex={0}>
          <ReviewItem label="Title" value={formData.title} />
          <ReviewItem label="Company" value={formData.companyName} />
          <ReviewItem label="Location" value={formData.location} />
          <ReviewItem label="Category" value={formData.category} />
          {contentType === 'opportunity' && (
            <>
              <ReviewItem label="Type" value={formData.opportunityType} />
              <ReviewItem label="Mode" value={formData.eventMode} />
              <ReviewItem label="Start Date" value={formData.startDate} />
              <ReviewItem label="End Date" value={formData.endDate} />
            </>
          )}
        </ReviewSection>

        {/* Work Details (for jobs/internships) */}
        {(contentType === 'job' || contentType === 'internship') && (
          <ReviewSection title="Work Details" stepIndex={1}>
            <ReviewItem label="Employment Type" value={formData.employmentType} />
            <ReviewItem label="Work Mode" value={formData.workMode} />
            <ReviewItem label="Experience Level" value={formData.experienceLevel} />
            <ReviewItem 
              label="Salary Range" 
              value={formData.salaryMin && formData.salaryMax 
                ? `${formData.currency || 'INR'} ${formData.salaryMin} - ${formData.salaryMax} per ${formData.salaryPeriod || 'month'}`
                : null
              } 
            />
          </ReviewSection>
        )}

        {/* Description */}
        <ReviewSection title="Description" stepIndex={contentType === 'opportunity' ? 1 : 2}>
          <ReviewItem label="Short Description" value={formData.shortDescription} />
          {formData.description && (
            <div className="unified-review-item">
              <span className="unified-review-label">Full Description:</span>
              <div className="unified-review-value" style={{ whiteSpace: 'pre-wrap' }}>
                {formData.description.substring(0, 200)}
                {formData.description.length > 200 && '...'}
              </div>
            </div>
          )}
        </ReviewSection>

        {/* Eligibility */}
        <ReviewSection title="Eligibility" stepIndex={contentType === 'opportunity' ? 2 : 3}>
          <ReviewItem label="Education" value={formData.education} />
          <ReviewItem label="Age Range" value={
            formData.minAge || formData.maxAge 
              ? `${formData.minAge || 'Any'} - ${formData.maxAge || 'Any'} years`
              : null
          } />
          <ReviewItem label="Freshers Allowed" value={formData.allowFreshers ? 'Yes' : 'No'} />
        </ReviewSection>

        {/* Application Settings */}
        <ReviewSection 
          title={contentType === 'opportunity' ? 'Registration Settings' : 'Application Settings'} 
          stepIndex={contentType === 'opportunity' ? 3 : 4}
        >
          <ReviewItem label="Deadline" value={formData.deadline} />
          <ReviewItem label="Max Applicants" value={formData.maxApplicants || 'Unlimited'} />
          <ReviewItem label="Application Method" value={formData.applicationMethod} />
          {contentType === 'opportunity' && (
            <ReviewItem 
              label="Team Size" 
              value={formData.minTeamSize || formData.maxTeamSize 
                ? `${formData.minTeamSize || 1} - ${formData.maxTeamSize || 'Any'}`
                : null
              } 
            />
          )}
        </ReviewSection>

        {/* Rounds */}
        <ReviewSection 
          title={contentType === 'opportunity' ? 'Rounds & Stages' : 'Hiring Rounds'} 
          stepIndex={contentType === 'opportunity' ? 4 : 5}
        >
          {formData.rounds && formData.rounds.length > 0 ? (
            <div className="unified-review-list">
              {formData.rounds.map((round, index) => (
                <div key={round.id} className="unified-review-list-item">
                  {index + 1}. {round.name} ({round.type})
                </div>
              ))}
            </div>
          ) : (
            <span className="unified-review-value">No rounds added</span>
          )}
        </ReviewSection>

        {/* Prizes (for opportunities) */}
        {contentType === 'opportunity' && (
          <ReviewSection title="Prizes" stepIndex={5}>
            <ReviewItem 
              label="Total Prize Pool" 
              value={formData.totalPrizePool 
                ? `${formData.prizeCurrency || 'INR'} ${formData.totalPrizePool}`
                : null
              } 
            />
            {formData.prizes && formData.prizes.length > 0 && (
              <div className="unified-review-list">
                {formData.prizes.map((prize) => (
                  <div key={prize.id} className="unified-review-list-item">
                    {prize.position}: {prize.currency} {prize.amount}
                  </div>
                ))}
              </div>
            )}
          </ReviewSection>
        )}

        {/* Payment (for opportunities) */}
        {contentType === 'opportunity' && (
          <ReviewSection title="Payment" stepIndex={6}>
            <ReviewItem label="Event Type" value={formData.isPaid ? 'Paid' : 'Free'} />
            {formData.isPaid && (
              <>
                <ReviewItem 
                  label="Registration Fee" 
                  value={`${formData.currency || 'INR'} ${formData.registrationFee}`} 
                />
                {formData.tickets && formData.tickets.length > 0 && (
                  <div className="unified-review-item">
                    <span className="unified-review-label">Ticket Types:</span>
                    <div className="unified-review-list">
                      {formData.tickets.map((ticket) => (
                        <div key={ticket.id} className="unified-review-list-item">
                          {ticket.name}: {formData.currency} {ticket.price}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </ReviewSection>
        )}

        {/* Additional Info */}
        <ReviewSection 
          title="Additional Information" 
          stepIndex={contentType === 'opportunity' ? 7 : 6}
        >
          <ReviewItem label="Contact Email" value={formData.contactEmail} />
          <ReviewItem label="Website" value={formData.websiteUrl} />
          <ReviewItem label="Featured" value={formData.featured ? 'Yes' : 'No'} />
        </ReviewSection>

        {/* Banner & Theme */}
        <ReviewSection 
          title="Banner & Theme" 
          stepIndex={contentType === 'opportunity' ? 8 : 7}
        >
          <ReviewItem label="Banner Image" value={formData.bannerImage ? 'Uploaded' : 'Not uploaded'} />
          <ReviewItem label="Logo" value={formData.eventLogo ? 'Uploaded' : 'Not uploaded'} />
          <ReviewItem label="Theme Color" value={formData.themeColor} />
        </ReviewSection>
      </div>

      <div className="unified-review-footer">
        <div className="unified-review-warning">
          ⚠️ Please review all information carefully before publishing. You can edit later, but changes may require re-approval.
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
