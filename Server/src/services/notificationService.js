const { Notification } = require('../models');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  async createNotification(userId, type, title, message, data = {}, actionUrl = null) {
    try {
      console.log(`Creating notification for specific user: ${userId}, type: ${type}, title: ${title}`);
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
        console.log(`Emitting notification to specific user room: user_${userId}`);
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

  // Job approval notification (for recruiter)
  async notifyJobApproval(recruiterId, jobTitle, action, rejectionReason = null, jobId) {
    const title = action === 'approve' ? 'Job Approved' : 'Job Rejected';
    let message;
    
    if (action === 'approve') {
      message = `Great news! Your job posting "${jobTitle}" has been approved and is now live on the platform.`;
    } else {
      message = `Your job posting "${jobTitle}" was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`;
    }

    return this.createNotification(
      recruiterId,
      'job_approval',
      title,
      message,
      { jobId, jobTitle, action, rejectionReason },
      action === 'approve' ? `/jobs/${jobId}` : `/recruiter-dashboard?tab=jobs`
    );
  }

  // Event approval notification (for organizer)
  async notifyEventApproval(organizerId, eventTitle, action, rejectionReason = null, eventId) {
    const title = action === 'approve' ? 'Event Approved' : 'Event Rejected';
    let message;
    
    if (action === 'approve') {
      message = `Excellent! Your event "${eventTitle}" has been approved and is now visible to participants.`;
    } else {
      message = `Your event "${eventTitle}" was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`;
    }

    return this.createNotification(
      organizerId,
      'event_approval',
      title,
      message,
      { eventId, eventTitle, action, rejectionReason },
      action === 'approve' ? `/events/${eventId}` : `/recruiter-dashboard?tab=events`
    );
  }

  // Interview scheduled notification
  async notifyInterviewScheduled(candidateId, jobTitle, interviewDate, interviewId) {
    return this.createNotification(
      candidateId,
      'interview_scheduled',
      'Interview Scheduled',
      `You have an interview scheduled for "${jobTitle}" on ${new Date(interviewDate).toLocaleDateString()}`,
      { interviewId, jobTitle, interviewDate },
      `/candidate-dashboard?tab=interviews`
    );
  }

  // Interview stage shortlist notification (with date, time, duration)
  async notifyInterviewStageShortlist(candidateId, jobTitle, stageName, interviewDate, interviewTime, interviewDuration, interviewLink, applicationId, jobId) {
    const dateObj = new Date(interviewDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return this.createNotification(
      candidateId,
      'interview_stage_shortlist',
      'Interview Scheduled',
      `Congratulations! You've been shortlisted for ${stageName} for "${jobTitle}". Interview scheduled on ${formattedDate} at ${interviewTime} (Duration: ${interviewDuration} minutes)`,
      { 
        applicationId, 
        jobId,
        jobTitle, 
        stageName,
        interviewDate, 
        interviewTime,
        interviewDuration,
        interviewLink
      },
      `/candidate-dashboard?tab=applications`
    );
  }

  // Candidate hired/offered notification
  async notifyJobOffer(candidateId, jobTitle, applicationId, jobId) {
    return this.createNotification(
      candidateId,
      'job_offer',
      'Job Offer Received',
      `Congratulations! You have been selected for "${jobTitle}". Check your application for next steps.`,
      { applicationId, jobId, jobTitle },
      `/candidate-dashboard?tab=applications`
    );
  }

  // Interview rescheduled notification
  async notifyInterviewRescheduled(userId, jobTitle, newDate, interviewId) {
    return this.createNotification(
      userId,
      'interview_rescheduled',
      'Interview Rescheduled',
      `Your interview for "${jobTitle}" has been rescheduled to ${new Date(newDate).toLocaleDateString()}`,
      { interviewId, jobTitle, newDate },
      `/candidate-dashboard?tab=interviews`
    );
  }

  // Internship approval notification (for creator)
  async notifyInternshipApproval(creatorId, internshipTitle, action, rejectionReason = null, internshipId) {
    const title = action === 'approve' ? 'Internship Approved' : 'Internship Rejected';
    let message;
    
    if (action === 'approve') {
      message = `Great news! Your internship posting "${internshipTitle}" has been approved and is now live on the platform.`;
    } else {
      message = `Your internship posting "${internshipTitle}" was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`;
    }

    return this.createNotification(
      creatorId,
      'internship_approval',
      title,
      message,
      { internshipId, internshipTitle, action, rejectionReason },
      action === 'approve' ? `/event-detail/internships/${internshipId}` : `/recruiter-dashboard?tab=internships`
    );
  }

  // ROAC Prime content approval notification (for creator)
  async notifyROACPrimeApproval(creatorId, contentTitle, action, rejectionReason = null, contentId) {
    const title = action === 'approve' ? 'ROAC Prime Content Approved' : 'ROAC Prime Content Rejected';
    let message;
    
    if (action === 'approve') {
      message = `Excellent! Your ROAC Prime content "${contentTitle}" has been approved and is now visible to users.`;
    } else {
      message = `Your ROAC Prime content "${contentTitle}" was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`;
    }

    return this.createNotification(
      creatorId,
      'roac_prime_approval',
      title,
      message,
      { contentId, contentTitle, action, rejectionReason },
      action === 'approve' ? `/event-detail/internships/${contentId}` : `/recruiter-dashboard?tab=roac-prime`
    );
  }
}

module.exports = NotificationService;
