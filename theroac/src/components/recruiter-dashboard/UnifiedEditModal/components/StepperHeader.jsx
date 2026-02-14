import React from 'react';
import { Check } from 'lucide-react';
import './StepperHeader.css';

const StepperHeader = ({ steps, currentStep, completedSteps, onStepClick }) => {
  return (
    <div className="unified-stepper-header">
      <div className="unified-stepper-container">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = currentStep === index;
          const isClickable = isCompleted || index <= currentStep;

          return (
            <React.Fragment key={step.key}>
              <div
                className={`unified-stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
                onClick={() => isClickable && onStepClick(index)}
              >
                <div className="unified-step-circle">
                  {isCompleted ? (
                    <Check size={20} />
                  ) : (
                    <span className="unified-step-icon">{step.icon}</span>
                  )}
                </div>
                <div className="unified-step-label">
                  <span className="unified-step-number">Step {index + 1}</span>
                  <span className="unified-step-title">{step.label}</span>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className={`unified-step-connector ${isCompleted ? 'completed' : ''}`}>
                  <div className="unified-connector-line"></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepperHeader;
