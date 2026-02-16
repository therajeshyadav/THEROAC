import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../../../services/api';
import StepperHeader from './components/StepperHeader';
import StepperNavigation from './components/StepperNavigation';
import { getStepsForType } from './utils/stepConfig';
import './UnifiedEditModal.css';

// Step components
import DetailsStep from './components/steps/DetailsStep';
import EligibilityStep from './components/steps/EligibilityStep';
import ApplicationStep from './components/steps/ApplicationStep';
import RoundsStep from './components/steps/RoundsStep';
import PrizesStep from './components/steps/PrizesStep';
import PaymentStep from './components/steps/PaymentStep';
import AdditionalInfoStep from './components/steps/AdditionalInfoStep';
import BannerThemeStep from './components/steps/BannerThemeStep';

const UnifiedEditModal = ({ 
  isOpen, 
  onClose, 
  contentType, // 'job', 'internship', 'opportunity'
  editData = null,
  authUser,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});

  const steps = getStepsForType(contentType);

  useEffect(() => {
    if (editData) {
      console.log('📝 Loading edit data:', editData);
      
      // Map database fields to form fields
      const mappedData = {
        ...editData,
        // Map stages to rounds for the RoundsStep component
        rounds: editData.stages || editData.rounds || [],
        // Parse prizesList if it's a string
        prizesList: typeof editData.prizesList === 'string' 
          ? JSON.parse(editData.prizesList) 
          : (Array.isArray(editData.prizesList) ? editData.prizesList : []),
        // Ensure rounds is always an array
        rounds: Array.isArray(editData.stages) ? editData.stages : 
                Array.isArray(editData.rounds) ? editData.rounds : [],
        // Map contactInfo to contacts for the form
        contacts: Array.isArray(editData.contactInfo) ? editData.contactInfo : 
                  Array.isArray(editData.contacts) ? editData.contacts : [],
        // Map categories - ensure it's always an array
        categories: Array.isArray(editData.categories) ? editData.categories : [],
        // Map importantDates
        importantDates: Array.isArray(editData.importantDates) ? editData.importantDates : [],
        // Map attachments
        attachments: Array.isArray(editData.attachments) ? editData.attachments : [],
        // Map gallery
        gallery: Array.isArray(editData.gallery) ? editData.gallery : [],
        // Extract eligibility fields if eligibility is an object
        ...(editData.eligibility && typeof editData.eligibility === 'object' ? {
          whoCanApply: editData.eligibility.whoCanApply || 'Everyone can apply',
          collegeRestriction: editData.eligibility.collegeRestriction || 'Everyone can apply',
          collegeRestrictionDetail: editData.eligibility.collegeRestrictionDetail || '',
          genderRestriction: editData.eligibility.genderRestriction || 'Everyone can apply',
          genderRestrictionDetail: editData.eligibility.genderRestrictionDetail || ''
        } : {}),
        // Extract registrationSettings/applicationSettings fields (for opportunities use registrationSettings, for jobs use applicationSettings)
        ...((editData.registrationSettings || editData.applicationSettings) && typeof (editData.registrationSettings || editData.applicationSettings) === 'object' ? {
          applicationPlatform: (editData.registrationSettings || editData.applicationSettings).platform || 'ROAC',
          maxApplications: (editData.registrationSettings || editData.applicationSettings).maxApplications || '',
          applicationStatus: (editData.registrationSettings || editData.applicationSettings).status || 'open',
          applicationFormFields: (editData.registrationSettings || editData.applicationSettings).formFields || [],
          screeningQuestions: (editData.registrationSettings || editData.applicationSettings).screeningQuestions || [],
          applicationStartDate: (editData.registrationSettings || editData.applicationSettings).startDate || '',
          applicationEndDate: (editData.registrationSettings || editData.applicationSettings).endDate || ''
        } : {}),
        // Extract salary fields if salary is an object
        ...(editData.salary && typeof editData.salary === 'object' ? {
          payStructure: editData.salary.structure || 'Range',
          currency: editData.salary.currency || 'INR',
          salaryPeriod: editData.salary.period || 'Monthly',
          salaryFixed: editData.salary.fixed || '',
          salaryMin: editData.salary.min || '',
          salaryMax: editData.salary.max || '',
          salaryVariable: editData.salary.variable || ''
        } : {}),
        // Map locationType back to workSetup display values
        workSetup: editData.locationType === 'onsite' ? 'In Office' : 
                   editData.locationType === 'remote' ? 'Remote' : 
                   editData.locationType === 'hybrid' ? 'Hybrid' : editData.locationType,
        // Keep jobType as-is from database (already lowercase)
        jobType: editData.jobType,
        // Map numberOfPositions to openings for the form
        openings: editData.numberOfPositions || editData.openings || editData.numberOfOpenings,
        // Map location to workLocation for consistency
        location: editData.location || editData.workLocation,
        // Filter benefits/perks to remove single character items
        benefits: Array.isArray(editData.perks) ? editData.perks.filter(p => p && p.length > 1) : 
                  Array.isArray(editData.benefits) ? editData.benefits.filter(p => p && p.length > 1) : [],
        // Convert participationCertificate boolean to 'yes'/'no' for the form
        participationCertificate: editData.participationCertificate ? 'yes' : 'no',
        // Extract paymentSettings fields
        ...(editData.paymentSettings && typeof editData.paymentSettings === 'object' ? {
          hasRegistrationFee: editData.paymentSettings.hasRegistrationFee ? 'yes' : 'no',
          registrationFee: editData.paymentSettings.amount || '',
          registrationFeeCurrency: editData.paymentSettings.currency || 'INR',
          paymentPlatform: editData.paymentSettings.platform || 'roac',
          paymentMethods: editData.paymentSettings.methods || {},
          accountDetails: editData.paymentSettings.accountDetails || null,
          ticketsList: editData.paymentSettings.tickets || [],
          serviceChargeFrom: editData.paymentSettings.serviceChargeFrom || 'player'
        } : {
          hasRegistrationFee: 'no'
        })
      };
      setFormData(mappedData);
      console.log('✅ Mapped formData:', {
        workArrangement: mappedData.workArrangement,
        workSetup: mappedData.workSetup,
        benefits: mappedData.benefits
      });
    } else {
      // Initialize with default values
      setFormData({
        contentType,
        companyLogo: authUser?.company?.logo || '',
        companyName: authUser?.company?.name || '',
        rounds: [],
        prizesList: [],
        whoCanApply: 'Everyone can apply',
        collegeRestriction: 'Everyone can apply',
        genderRestriction: 'Everyone can apply',
        applicationPlatform: 'ROAC',
        applicationStatus: 'open',
        applicationFormFields: [],
        screeningQuestions: [],
        participationCertificate: 'no',
        hasRegistrationFee: 'no',
        contacts: [],
        importantDates: [],
        attachments: [],
        gallery: []
      });
    }
  }, [editData, contentType, authUser]);

  const renderStepContent = () => {
    const stepKey = steps[currentStep]?.key;

    switch (stepKey) {
      case 'details':
        return <DetailsStep formData={formData} setFormData={setFormData} contentType={contentType} errors={errors} authUser={authUser} />;
      case 'eligibility':
        return <EligibilityStep formData={formData} setFormData={setFormData} errors={errors} />;
      case 'application':
        return <ApplicationStep formData={formData} setFormData={setFormData} contentType={contentType} errors={errors} />;
      case 'rounds':
        return <RoundsStep formData={formData} setFormData={setFormData} contentType={contentType} errors={errors} />;
      case 'prizes':
        return <PrizesStep formData={formData} setFormData={setFormData} errors={errors} />;
      case 'payment':
        return <PaymentStep formData={formData} setFormData={setFormData} errors={errors} />;
      case 'additional':
        return <AdditionalInfoStep formData={formData} setFormData={setFormData} contentType={contentType} errors={errors} />;
      case 'banner':
        return <BannerThemeStep formData={formData} setFormData={setFormData} errors={errors} />;
      default:
        return <div>Step not found</div>;
    }
  };

  const validateStep = () => {
    // Add validation logic per step
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (stepIndex) => {
    if (completedSteps.includes(stepIndex) || stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSaveDraft = async () => {
    try {
      console.log('Saving draft...', formData);
      
      const apiData = prepareApiData(formData, true); // true = draft
      
      let response;
      if (contentType === 'job' || contentType === 'internship') {
        if (editData?.id) {
          response = await apiService.updateJob(editData.id, apiData);
        } else {
          response = await apiService.createJob(apiData);
        }
      } else {
        if (editData?.id) {
          response = await apiService.updateEvent(editData.id, apiData);
        } else {
          response = await apiService.createEvent(apiData);
        }
      }
      
      console.log('Draft saved:', response);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrors({ submit: error.message || 'Failed to save draft' });
    }
  };

  const handlePublish = async () => {
    try {
      console.log('📤 Publishing...', formData);
      
      const apiData = prepareApiData(formData, false); // false = publish
      
      // Log what's being sent
      console.log('📦 API Data being sent:');
      for (let [key, value] of apiData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      let response;
      if (contentType === 'job' || contentType === 'internship') {
        if (editData?.id) {
          response = await apiService.updateJob(editData.id, apiData);
        } else {
          response = await apiService.createJob(apiData);
        }
      } else {
        if (editData?.id) {
          response = await apiService.updateEvent(editData.id, apiData);
        } else {
          response = await apiService.createEvent(apiData);
        }
      }
      
      console.log('✅ Published:', response);
      
      // Trigger refresh event
      window.dispatchEvent(new CustomEvent('refreshListings', { 
        detail: { type: contentType } 
      }));
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error publishing:', error);
      setErrors({ submit: error.message || 'Failed to publish' });
    }
  };

  const prepareApiData = (data, isDraft) => {
    console.log('🔍 Preparing API data from formData:', {
      jobType: data.jobType,
      workSetup: data.workSetup,
      location: data.location,
      openings: data.openings,
      benefits: data.benefits,
      prizeDescription: data.prizeDescription,
      prizeDeliverDays: data.prizeDeliverDays,
      participationCertificate: data.participationCertificate,
      applicationStatus: data.applicationStatus,
      applicationFormFields: data.applicationFormFields,
      screeningQuestions: data.screeningQuestions
    });
    
    const apiData = new FormData();
    
    // Basic fields
    if (data.title) apiData.append('title', data.title);
    if (data.companyName) apiData.append('companyName', data.companyName);
    if (data.companyLogo) apiData.append('companyLogo', data.companyLogo);
    if (data.description) apiData.append('description', data.description);
    
    // Categories
    if (data.categories) {
      console.log('📂 Saving categories:', data.categories);
      apiData.append('categories', JSON.stringify(data.categories));
    }
    
    // Work arrangements (for jobs/internships)
    if (contentType === 'job' || contentType === 'internship') {
      // Use jobType directly from form (already in correct format: 'full-time', 'part-time', 'contract')
      if (data.jobType) {
        apiData.append('jobType', data.jobType);
      }
      
      // Map workSetup to locationType enum values
      if (data.workSetup) {
        let locationType = data.workSetup.toLowerCase();
        if (locationType === 'in office') locationType = 'onsite';
        if (locationType === 'field job') locationType = 'onsite'; // Field job is also onsite
        apiData.append('locationType', locationType);
      }
      
      if (data.location) apiData.append('location', data.location);
      if (data.openings) apiData.append('numberOfPositions', data.openings);
      if (data.duration) apiData.append('duration', data.duration);
      
      // New fields
      if (data.workingDays) apiData.append('workingDays', JSON.stringify(data.workingDays));
      if (data.jobSchedule) apiData.append('jobSchedule', JSON.stringify(data.jobSchedule));
      if (data.hideOpenings !== undefined) apiData.append('hideOpenings', data.hideOpenings);
      if (data.festivalCampaign) apiData.append('festivalCampaign', data.festivalCampaign);
      
      // Salary - build based on pay structure
      if (data.payStructure && data.payStructure !== 'Unpaid') {
        const salaryData = {
          structure: data.payStructure,
          currency: data.currency || 'INR',
          period: data.salaryPeriod || 'Monthly'
        };
        
        if (data.payStructure === 'Fixed') {
          salaryData.fixed = data.salaryFixed || null;
        } else if (data.payStructure === 'Range') {
          salaryData.min = data.salaryMin || null;
          salaryData.max = data.salaryMax || null;
        } else if (data.payStructure === 'Fixed + Variable') {
          salaryData.fixed = data.salaryFixed || null;
          salaryData.variable = data.salaryVariable || null;
        }
        
        apiData.append('salary', JSON.stringify(salaryData));
      }
      
      // Filter benefits to remove single character items before sending
      if (data.benefits && Array.isArray(data.benefits)) {
        const filteredBenefits = data.benefits.filter(b => b && b.length > 1);
        apiData.append('perks', JSON.stringify(filteredBenefits));
      }
      if (data.skills) apiData.append('skills', JSON.stringify(data.skills));
    }
    
    // Eligibility - build from individual fields
    const eligibilityData = {
      whoCanApply: data.whoCanApply || 'Everyone can apply',
      collegeRestriction: data.collegeRestriction || 'Everyone can apply',
      collegeRestrictionDetail: data.collegeRestrictionDetail || '',
      genderRestriction: data.genderRestriction || 'Everyone can apply',
      genderRestrictionDetail: data.genderRestrictionDetail || ''
    };
    apiData.append('eligibility', JSON.stringify(eligibilityData));
    
    // Application/Registration Settings
    if (contentType === 'opportunity') {
      // Opportunity specific fields
      if (data.opportunityType) apiData.append('opportunityType', data.opportunityType);
      if (data.opportunitySubType) apiData.append('opportunitySubType', data.opportunitySubType);
      if (data.participationType) apiData.append('participationType', data.participationType);
      if (data.minTeamSize) apiData.append('minTeamSize', data.minTeamSize);
      if (data.maxTeamSize) apiData.append('maxTeamSize', data.maxTeamSize);
      if (data.mode) apiData.append('mode', data.mode);
      if (data.skills) apiData.append('skills', data.skills);
      
      // Registration settings - build from individual fields
      const registrationSettings = {
        platform: data.applicationPlatform || 'ROAC',
        maxApplications: data.maxApplications || null,
        status: data.applicationStatus || 'open',
        formFields: data.applicationFormFields || [],
        screeningQuestions: data.screeningQuestions || [],
        startDate: data.applicationStartDate || null,
        endDate: data.applicationEndDate || null
      };
      apiData.append('registrationSettings', JSON.stringify(registrationSettings));
    } else {
      // Application settings for jobs/internships
      const applicationSettings = {
        platform: data.applicationPlatform || 'ROAC',
        maxApplications: data.maxApplications || null,
        status: data.applicationStatus || 'open',
        formFields: data.applicationFormFields || [],
        screeningQuestions: data.screeningQuestions || [],
        startDate: data.applicationStartDate || null,
        endDate: data.applicationEndDate || null
      };
      apiData.append('applicationSettings', JSON.stringify(applicationSettings));
    }
    
    // Rounds/Stages
    if (data.rounds) {
      console.log('📊 Saving rounds/stages:', data.rounds);
      apiData.append('stages', JSON.stringify(data.rounds));
    }
    
    // Prizes (for opportunities)
    if (contentType === 'opportunity') {
      if (data.prizesList) apiData.append('prizesList', JSON.stringify(data.prizesList));
      if (data.prizeDescription) apiData.append('prizeDescription', data.prizeDescription);
      if (data.prizeDeliverDays) apiData.append('prizeDeliverDays', data.prizeDeliverDays);
      if (data.participationCertificate !== undefined) {
        // Convert 'yes'/'no' to boolean
        const certValue = data.participationCertificate === 'yes' || data.participationCertificate === true;
        apiData.append('participationCertificate', certValue);
      }
      
      // Payment - build from individual fields
      if (data.hasRegistrationFee === 'yes') {
        const paymentSettings = {
          hasRegistrationFee: true,
          amount: data.registrationFee || null,
          currency: data.registrationFeeCurrency || 'INR',
          platform: data.paymentPlatform || 'roac',
          methods: data.paymentMethods || {},
          accountDetails: data.accountDetails || null,
          tickets: data.ticketsList || [],
          serviceChargeFrom: data.serviceChargeFrom || 'player'
        };
        apiData.append('paymentSettings', JSON.stringify(paymentSettings));
      } else {
        apiData.append('paymentSettings', JSON.stringify({ hasRegistrationFee: false }));
      }
    }
    
    // Additional Info
    if (data.importantDates) {
      console.log('📅 Saving important dates:', data.importantDates);
      apiData.append('importantDates', JSON.stringify(data.importantDates));
    }
    
    // Contact Info - use contacts array
    if (data.contacts && data.contacts.length > 0) {
      console.log('📞 Saving contacts:', data.contacts);
      apiData.append('contactInfo', JSON.stringify(data.contacts));
    }
    
    if (data.attachments) {
      console.log('📎 Saving attachments:', data.attachments);
      apiData.append('attachments', JSON.stringify(data.attachments));
    }
    if (data.gallery) {
      console.log('🖼️ Saving gallery:', data.gallery);
      apiData.append('gallery', JSON.stringify(data.gallery));
    }
    
    // Social Links - build from individual URLs
    const socialLinks = {};
    if (data.discordUrl) socialLinks.discord = data.discordUrl;
    if (data.slackUrl) socialLinks.slack = data.slackUrl;
    if (data.linkedinUrl) socialLinks.linkedin = data.linkedinUrl;
    if (data.twitterUrl) socialLinks.twitter = data.twitterUrl;
    if (data.facebookUrl) socialLinks.facebook = data.facebookUrl;
    if (data.websiteUrl) socialLinks.website = data.websiteUrl;
    if (Object.keys(socialLinks).length > 0) {
      apiData.append('socialLinks', JSON.stringify(socialLinks));
    }
    
    // FAQs - parse from text format if string
    if (data.faqs) {
      if (typeof data.faqs === 'string') {
        // Parse FAQ text format
        const faqLines = data.faqs.split('\n').filter(line => line.trim());
        const faqArray = [];
        for (let i = 0; i < faqLines.length; i++) {
          const line = faqLines[i];
          if (line.startsWith('Q:')) {
            const question = line.substring(2).trim();
            const answerLine = faqLines[i + 1];
            if (answerLine && answerLine.startsWith('A:')) {
              const answer = answerLine.substring(2).trim();
              faqArray.push({ question, answer });
              i++; // Skip next line as we've processed it
            }
          }
        }
        apiData.append('faqs', JSON.stringify(faqArray));
      } else {
        apiData.append('faqs', JSON.stringify(data.faqs));
      }
    }
    
    // Terms - use termsAndConditions field
    if (data.termsAndConditions) apiData.append('terms', data.termsAndConditions);
    if (data.additionalNotes) apiData.append('additionalNotes', data.additionalNotes);
    if (data.featured !== undefined) apiData.append('featured', data.featured);
    
    // Banner/Theme
    if (data.bannerImage) apiData.append('bannerImage', data.bannerImage);
    if (data.mobileBanner) apiData.append('mobileBanner', data.mobileBanner);
    if (data.themeColor) apiData.append('themeColor', data.themeColor);
    
    // Draft status
    if (isDraft) {
      apiData.append('approvalStatus', 'draft');
    }
    
    return apiData;
  };

  if (!isOpen) return null;

  return (
    <div className="unified-edit-modal-overlay">
      <div className="unified-edit-modal">
        {/* Close button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Stepper Header */}
        <StepperHeader
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        {/* Content Area */}
        <div className="stepper-content">
          <div className="stepper-content-inner">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation */}
        <StepperNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          isLastStep={currentStep === steps.length - 1}
        />
      </div>
    </div>
  );
};

export default UnifiedEditModal;
