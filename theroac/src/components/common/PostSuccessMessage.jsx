import React from 'react';
import { CheckCircle, Clock, Bell } from 'lucide-react';
import './PostSuccessMessage.css';

const PostSuccessMessage = ({ type, title, onClose }) => {
  return (
    <div className="post-success-overlay">
      <div className="post-success-modal">
        <div className="post-success-header">
          <div className="success-icon">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2>Successfully Posted!</h2>
        </div>

        <div className="post-success-content">
          <div className="success-message">
            <p className="main-message">
              Your {type} "<strong>{title}</strong>" has been submitted successfully!
            </p>
            
            <div className="approval-info">
              <div className="approval-step">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <h4>Pending Admin Approval</h4>
                  <p>Your {type} is currently under review by our admin team.</p>
                </div>
              </div>
              
              <div className="approval-step">
                <Bell className="w-5 h-5 text-blue-500" />
                <div>
                  <h4>You'll Be Notified</h4>
                  <p>We'll send you a notification once your {type} is approved and goes live on the platform.</p>
                </div>
              </div>
            </div>

            <div className="approval-timeline">
              <h4>What happens next?</h4>
              <ol>
                <li>Admin reviews your {type} for quality and compliance</li>
                <li>You receive an approval or feedback notification</li>
                <li>If approved, your {type} becomes visible to all users</li>
                <li>You can track applications/registrations in your dashboard</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="post-success-footer">
          <button 
            className="btn-primary"
            onClick={onClose}
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostSuccessMessage;