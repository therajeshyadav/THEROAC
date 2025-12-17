import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import apiService from '../../services/api';
import './PendingApprovalsNotice.css';

const PendingApprovalsNotice = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      
      // Fetch user's jobs and events
      const [jobsResponse, eventsResponse] = await Promise.all([
        apiService.request('/jobs/my-jobs'),
        apiService.request('/events/my-events')
      ]);

      const pendingJobs = (jobsResponse.jobs || []).filter(job => 
        job.approvalStatus === 'pending' || job.approvalStatus === 'rejected'
      );
      
      const pendingEvents = (eventsResponse.events || []).filter(event => 
        event.approvalStatus === 'pending' || event.approvalStatus === 'rejected'
      );

      const allPending = [
        ...pendingJobs.map(job => ({ ...job, type: 'job' })),
        ...pendingEvents.map(event => ({ ...event, type: 'event' }))
      ];

      setPendingItems(allPending);
    } catch (error) {
      console.error('Error fetching pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="pending-notice loading">
        <div className="loading-spinner"></div>
        <span>Checking approval status...</span>
      </div>
    );
  }

  if (pendingItems.length === 0) {
    return null;
  }

  const pendingCount = pendingItems.filter(item => item.approvalStatus === 'pending').length;
  const rejectedCount = pendingItems.filter(item => item.approvalStatus === 'rejected').length;

  return (
    <div className="pending-approvals-notice">
      <div className="notice-header" onClick={() => setShowDetails(!showDetails)}>
        <div className="notice-info">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <div>
            <h4>Approval Status</h4>
            <p>
              {pendingCount > 0 && `${pendingCount} item${pendingCount > 1 ? 's' : ''} pending review`}
              {pendingCount > 0 && rejectedCount > 0 && ', '}
              {rejectedCount > 0 && `${rejectedCount} item${rejectedCount > 1 ? 's' : ''} rejected`}
            </p>
          </div>
        </div>
        <button className="toggle-btn">
          <Eye className="w-4 h-4" />
          {showDetails ? 'Hide' : 'View'} Details
        </button>
      </div>

      {showDetails && (
        <div className="notice-details">
          <div className="items-list">
            {pendingItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="pending-item">
                <div className="item-info">
                  <div className="item-title">
                    <span className="item-type">{item.type === 'job' ? 'Job' : 'Event'}:</span>
                    {item.title}
                  </div>
                  <div className="item-meta">
                    Posted: {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={`item-status status-${getStatusColor(item.approvalStatus)}`}>
                  {getStatusIcon(item.approvalStatus)}
                  <span>{getStatusText(item.approvalStatus)}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="notice-footer">
            <p className="notice-text">
              <strong>What happens next?</strong> Our admin team reviews all posts to ensure quality. 
              You'll receive a notification once your {pendingCount > 1 ? 'items are' : 'item is'} reviewed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsNotice;