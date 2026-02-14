import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
      setFormData(editData);
    } else {
      // Initialize with default values
      setFormData({
        contentType,
        companyLogo: authUser?.company?.logo || '',
        companyName: authUser?.company?.name || '',
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
    console.log('Saving draft...', formData);
    // API call to save draft
  };

  const handlePublish = async () => {
    console.log('Publishing...', formData);
    // API call to publish
    if (onSuccess) onSuccess();
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
