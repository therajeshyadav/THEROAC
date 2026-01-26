const sequelize = require("../config/database");
const User = require("./user");
const Event = require("./event");
const Hackathon = require("./hackathon");
const Job = require("./job");
const HubContent = require("./hubContent");
const EventRegistration = require("./eventRegistration");
const EventStageSubmission = require("./eventStageSubmission");
const EventTeam = require("./EventTeam");
const EventTeamMember = require("./EventTeamMember");
const Submission = require("./submission");
const JobApplication = require("./jobApplication");
const HubContentApplication = require("./HubContentApplication");
const Bookmark = require("./Bookmark");
const Like = require("./Like");
const ProfileView = require("./ProfileView");
const Organization = require("./organization");
const OrganizationMember = require("./organizationMember");
const ActivityLog = require("./activityLog");
const Notification = require("./notification");
const Interview = require("./Interview");
const SavedJob = require("./SavedJob");
const Resume = require("./Resume");
const TalentPipeline = require("./TalentPipeline");
const Review = require("./Review");
const FAQ = require("./FAQ");
const QuizSubmission = require("./QuizSubmission");
const ProfileQuizSubmission = require("./ProfileQuizSubmission");
const TrainingUser = require("./TrainingUser");
const Payment = require("./Payment");

// Associations
User.hasMany(Event, { foreignKey: "createdBy", as: "createdEvents" });
Event.belongsTo(User, { foreignKey: "createdBy", as: "organizer" });

User.hasMany(Hackathon, { foreignKey: "createdBy", as: "createdHackathons" });
Hackathon.belongsTo(User, { foreignKey: "createdBy", as: "organizer" });

User.hasMany(Job, { foreignKey: "createdBy", as: "createdJobs" });
Job.belongsTo(User, { foreignKey: "createdBy", as: "recruiter" });

User.hasMany(HubContent, { foreignKey: "createdBy", as: "createdHubContent" });
HubContent.belongsTo(User, { foreignKey: "createdBy", as: "author" });

User.belongsToMany(Event, {
  through: EventRegistration,
  foreignKey: "userId",
  otherKey: "eventId",
});
Event.belongsToMany(User, {
  through: EventRegistration,
  foreignKey: "eventId",
  otherKey: "userId",
});

Job.belongsToMany(User, {
  through: JobApplication,
  foreignKey: "jobId",
  otherKey: "userId",
});
User.belongsToMany(Job, {
  through: JobApplication,
  foreignKey: "userId",
  otherKey: "jobId",
});

// Direct associations for JobApplication
JobApplication.belongsTo(User, { foreignKey: "userId", as: "user" });
JobApplication.belongsTo(Job, { foreignKey: "jobId", as: "job" });
User.hasMany(JobApplication, { foreignKey: "userId", as: "jobApplications" });
Job.hasMany(JobApplication, { foreignKey: "jobId", as: "jobApplications" });

// Direct associations for EventRegistration
EventRegistration.belongsTo(User, { foreignKey: "userId", as: "user" });
EventRegistration.belongsTo(Event, { foreignKey: "eventId", as: "event" });
User.hasMany(EventRegistration, {
  foreignKey: "userId",
  as: "eventRegistrations",
});
Event.hasMany(EventRegistration, {
  foreignKey: "eventId",
  as: "eventRegistrations",
});

// Event Stage Submission associations
EventStageSubmission.belongsTo(User, { foreignKey: "userId", as: "user" });
EventStageSubmission.belongsTo(Event, { foreignKey: "eventId", as: "event" });
EventStageSubmission.belongsTo(User, {
  foreignKey: "reviewedBy",
  as: "reviewer",
});
User.hasMany(EventStageSubmission, {
  foreignKey: "userId",
  as: "stageSubmissions",
});
Event.hasMany(EventStageSubmission, {
  foreignKey: "eventId",
  as: "stageSubmissions",
});
User.hasMany(EventStageSubmission, {
  foreignKey: "reviewedBy",
  as: "reviewedSubmissions",
});

// Hub Content Application associations
HubContent.belongsToMany(User, {
  through: HubContentApplication,
  foreignKey: "hubContentId",
  otherKey: "userId",
});
User.belongsToMany(HubContent, {
  through: HubContentApplication,
  foreignKey: "userId",
  otherKey: "hubContentId",
});

// Direct associations for HubContentApplication
HubContentApplication.belongsTo(User, { foreignKey: "userId", as: "user" });
HubContentApplication.belongsTo(HubContent, {
  foreignKey: "hubContentId",
  as: "hubContent",
});
User.hasMany(HubContentApplication, {
  foreignKey: "userId",
  as: "hubContentApplications",
});
HubContent.hasMany(HubContentApplication, {
  foreignKey: "hubContentId",
  as: "hubContentApplications",
});

// Bookmark and Like associations
Bookmark.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Bookmark, { foreignKey: "userId", as: "bookmarks" });

Like.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Like, { foreignKey: "userId", as: "likes" });

// ProfileView associations
ProfileView.belongsTo(User, {
  foreignKey: "profileUserId",
  as: "profileOwner",
});
ProfileView.belongsTo(User, { foreignKey: "viewerUserId", as: "viewer" });
User.hasMany(ProfileView, { foreignKey: "profileUserId", as: "profileViews" });
User.hasMany(ProfileView, { foreignKey: "viewerUserId", as: "viewedProfiles" });

// Organization associations
Organization.belongsTo(User, { foreignKey: "ownerId", as: "owner" });
User.hasMany(Organization, { foreignKey: "ownerId", as: "ownedOrganizations" });

// Organization Members associations
Organization.belongsToMany(User, {
  through: OrganizationMember,
  foreignKey: "organizationId",
  otherKey: "userId",
  as: "members",
});
User.belongsToMany(Organization, {
  through: OrganizationMember,
  foreignKey: "userId",
  otherKey: "organizationId",
  as: "organizations",
});

OrganizationMember.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});
OrganizationMember.belongsTo(User, { foreignKey: "userId", as: "user" });
OrganizationMember.belongsTo(User, { foreignKey: "invitedBy", as: "inviter" });

Organization.hasMany(OrganizationMember, {
  foreignKey: "organizationId",
  as: "organizationMembers",
});
User.hasMany(OrganizationMember, { foreignKey: "userId", as: "memberships" });

// Organization content associations
Organization.hasMany(Job, { foreignKey: "organizationId", as: "jobs" });
Job.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.hasMany(Event, { foreignKey: "organizationId", as: "events" });
Event.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.hasMany(HubContent, {
  foreignKey: "organizationId",
  as: "hubContents",
});
HubContent.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

// Activity Log associations
ActivityLog.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});
ActivityLog.belongsTo(User, { foreignKey: "userId", as: "user" });
Organization.hasMany(ActivityLog, {
  foreignKey: "organizationId",
  as: "activityLogs",
});
User.hasMany(ActivityLog, { foreignKey: "userId", as: "activities" });

// User current organization
User.belongsTo(Organization, {
  foreignKey: "currentOrganizationId",
  as: "currentOrganization",
});

// Notification associations
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });

// Interview associations
Interview.belongsTo(JobApplication, {
  foreignKey: "applicationId",
  as: "application",
});
Interview.belongsTo(User, { foreignKey: "candidateId", as: "candidate" });
Interview.belongsTo(User, { foreignKey: "recruiterId", as: "recruiter" });
Interview.belongsTo(Job, { foreignKey: "jobId", as: "job" });
JobApplication.hasMany(Interview, {
  foreignKey: "applicationId",
  as: "interviews",
});
User.hasMany(Interview, {
  foreignKey: "candidateId",
  as: "candidateInterviews",
});
User.hasMany(Interview, {
  foreignKey: "recruiterId",
  as: "recruiterInterviews",
});

// SavedJob associations
SavedJob.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(SavedJob, { foreignKey: "userId", as: "savedJobs" });

// Resume associations
Resume.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Resume, { foreignKey: "userId", as: "resumes" });

// TalentPipeline associations
TalentPipeline.belongsTo(User, { foreignKey: "candidateId", as: "candidate" });
TalentPipeline.belongsTo(User, { foreignKey: "addedBy", as: "addedByUser" });
TalentPipeline.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});
User.hasMany(TalentPipeline, {
  foreignKey: "candidateId",
  as: "pipelineEntries",
});
Organization.hasMany(TalentPipeline, {
  foreignKey: "organizationId",
  as: "talentPipeline",
});

// Review associations
Review.belongsTo(User, { foreignKey: "createdBy", as: "author" });
Review.belongsTo(User, { foreignKey: "moderatedBy", as: "moderator" });
User.hasMany(Review, { foreignKey: "createdBy", as: "reviews" });
User.hasMany(Review, { foreignKey: "moderatedBy", as: "moderatedReviews" });

// FAQ associations
FAQ.belongsTo(User, { foreignKey: "createdBy", as: "author" });
FAQ.belongsTo(User, { foreignKey: "answeredBy", as: "answerer" });
User.hasMany(FAQ, { foreignKey: "createdBy", as: "faqs" });
User.hasMany(FAQ, { foreignKey: "answeredBy", as: "answeredFaqs" });

// QuizSubmission associations
QuizSubmission.belongsTo(User, { foreignKey: "userId", as: "user" });
QuizSubmission.belongsTo(Event, { foreignKey: "eventId", as: "event" });
User.hasMany(QuizSubmission, { foreignKey: "userId", as: "quizSubmissions" });
Event.hasMany(QuizSubmission, { foreignKey: "eventId", as: "quizSubmissions" });

// EventTeam associations
EventTeam.belongsTo(Event, { foreignKey: "eventId", as: "event" });
EventTeam.belongsTo(User, { foreignKey: "leaderId", as: "leader" });
EventTeam.hasMany(EventTeamMember, { foreignKey: "teamId", as: "members" });
Event.hasMany(EventTeam, { foreignKey: "eventId", as: "teams" });
User.hasMany(EventTeam, { foreignKey: "leaderId", as: "ledTeams" });

// EventTeamMember associations
EventTeamMember.belongsTo(EventTeam, { foreignKey: "teamId", as: "team" });
EventTeamMember.belongsTo(User, { foreignKey: "userId", as: "user" });
EventTeamMember.belongsTo(Event, { foreignKey: "eventId", as: "event" });
User.hasMany(EventTeamMember, { foreignKey: "userId", as: "teamMemberships" });
Event.hasMany(EventTeamMember, { foreignKey: "eventId", as: "teamMembers" });

// payment-related associations
User.hasOne(TrainingUser, { foreignKey: "userId" });
TrainingUser.belongsTo(User, { foreignKey: "userId" });
TrainingUser.hasMany(Payment, { foreignKey: "trainingUserId" });
Payment.belongsTo(TrainingUser, { foreignKey: "trainingUserId" });


// ProfileQuizSubmission associations
ProfileQuizSubmission.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(ProfileQuizSubmission, {
  foreignKey: "userId",
  as: "profileQuizSubmissions",
});

// ===============================
// Bookmark → Actual Item relations
// ===============================

// Bookmark → Job
Bookmark.belongsTo(Job, {
  foreignKey: "itemId",
  constraints: false,
});

// Bookmark → Event
Bookmark.belongsTo(Event, {
  foreignKey: "itemId",
  constraints: false,
});

// Bookmark → Internship (HubContent)
Bookmark.belongsTo(HubContent, {
  foreignKey: "itemId",
  constraints: false,
});

module.exports = {
  sequelize,
  User,
  Event,
  Hackathon,
  Job,
  HubContent,
  EventRegistration,
  EventStageSubmission,
  EventTeam,
  EventTeamMember,
  Submission,
  JobApplication,
  HubContentApplication,
  Bookmark,
  Like,
  ProfileView,
  Organization,
  OrganizationMember,
  ActivityLog,
  Notification,
  Interview,
  SavedJob,
  Resume,
  TalentPipeline,
  Review,
  FAQ,
  QuizSubmission,
  ProfileQuizSubmission,
  TrainingUser,
  Payment
};
