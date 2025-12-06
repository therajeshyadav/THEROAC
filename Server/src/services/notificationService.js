const { Notification } = require('../models');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  async createNotification(userId, type, title, message, data = {}, actionUrl = null) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        actionUrl,
        read: false
      });

      // Emit real-time notification via Socket.io
      if (this.io) {
        this.io.to(`user_${userId}`).emit('new_notification', notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Application status changed
  async notifyApplicationStatusChange(userId, jobTitle, newStatus, applicationId) {
    const statusMessages = {
      reviewing: `Your application for "${jobTitle}" is being reviewed`,
      interview: `You've been shortlisted for an interview for "${jobTitle}"`,
      accepted: `Congratulations! Your application for "${jobTitle}" has been accepted`,
      rejected: `Your application for "${jobTitle}" was not successful this time`
    };

    return this.createNotification(
      userId,
      'application_status',
      'Application Status Updated',
      statusMessages[newStatus] || `Your application status has been updated to ${newStatus}`,
      { applicationId, jobTitle, status: newStatus },
      `/candidate-dashboard?tab=applications`
    );
  }

  // New application received (for recruiter)
  async notifyNewApplication(recruiterId, candidateName, jobTitle, applicationId) {
    return this.createNotification(
      recruiterId,
      'new_application',
      'New Application Received',
      `${candidateName} has applied for "${jobTitle}"`,
      { applicationId, candidateName, jobTitle },
      `/recruiter-dashboard?tab=evaluate`
    );
  }

  // Application viewed by recruiter
  async notifyApplicationViewed(userId, jobTitle, recruiterName) {
    return this.createNotification(
      userId,
      'application_viewed',
      'Application Viewed',
      `${recruiterName} viewed your application for "${jobTitle}"`,
      { jobTitle, recruiterName },
      `/candidate-dashboard?tab=applications`
    );
  }

  // Organization invitation
  async notifyOrganizationInvite(userId, organizationName, inviterName, organizationId, memberId = null) {
    return this.createNotification(
      userId,
      'organization_invite',
      'Organization Invitation',
      `${inviterName} invited you to join "${organizationName}"`,
      { organizationId, organizationName, inviterName, memberId },
      `/notifications`
    );
  }

  // Job posted (for followers/interested candidates)
  async notifyJobPosted(userId, jobTitle, companyName, jobId) {
    return this.createNotification(
      userId,
      'job_posted',
      'New Job Posted',
      `New opportunity: ${jobTitle} at ${companyName}`,
      { jobId, jobTitle, companyName },
      `/jobs/${jobId}`
    );
  }
}

module.exports = NotificationService;
