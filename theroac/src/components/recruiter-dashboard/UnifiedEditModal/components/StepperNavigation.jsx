import React from 'react';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import './StepperNavigation.css';

const StepperNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  onPublish,
  isLastStep
}) => {
  return (
    <div className="unified-stepper-navigation">
      <div className="unified-nav-container">
        {/* Left side - Previous button */}
        <div className="unified-nav-left">
          {currentStep > 0 && (
            <button className="unified-nav-btn unified-nav-btn-secondary" onClick={onPrevious}>
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>
          )}
        </div>

        {/* Center - Save Draft button */}
        <div className="unified-nav-center">
          <button className="unified-nav-btn unified-nav-btn-draft" onClick={onSaveDraft}>
            <Save size={18} />
            <span>Save as Draft</span>
          </button>
        </div>

        {/* Right side - Next/Publish button */}
        <div className="unified-nav-right">
          {isLastStep ? (
            <button className="unified-nav-btn unified-nav-btn-primary" onClick={onPublish}>
              <span>Publish</span>
              <Send size={20} />
            </button>
          ) : (
            <button className="unified-nav-btn unified-nav-btn-primary" onClick={onNext}>
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="unified-progress-indicator">
        <div className="unified-progress-text">
          Step {currentStep + 1} of {totalSteps}
        </div>
        <div className="unified-progress-bar">
          <div 
            className="unified-progress-fill" 
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StepperNavigation;
