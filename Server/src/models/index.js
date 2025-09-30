const sequelize = require('../config/database');
const User = require('./user');
const Event = require('./event');
const Hackathon = require('./hackathon');
const Job = require('./job');
const EventRegistration = require('./eventRegistration');
const HackathonTeam = require('./hackathonTeam');
const TeamMember = require('./teamMember');
const Submission = require('./submission');
const JobApplication = require('./jobApplication');

// Associations
User.hasMany(Event, { foreignKey: 'createdBy', as: 'createdEvents' });
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'organizer' });

User.hasMany(Hackathon, { foreignKey: 'createdBy', as: 'createdHackathons' });
Hackathon.belongsTo(User, { foreignKey: 'createdBy', as: 'organizer' });

User.hasMany(Job, { foreignKey: 'createdBy', as: 'createdJobs' });
Job.belongsTo(User, { foreignKey: 'createdBy', as: 'recruiter' });

User.belongsToMany(Event, { through: EventRegistration, foreignKey: 'userId', otherKey: 'eventId' });
Event.belongsToMany(User, { through: EventRegistration, foreignKey: 'eventId', otherKey: 'userId' });

Hackathon.hasMany(HackathonTeam, { foreignKey: 'hackathonId', as: 'teams' });
HackathonTeam.belongsTo(Hackathon, { foreignKey: 'hackathonId' });

HackathonTeam.hasMany(TeamMember, { foreignKey: 'teamId', as: 'members' });
TeamMember.belongsTo(HackathonTeam, { foreignKey: 'teamId' });

TeamMember.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(TeamMember, { foreignKey: 'userId' });

HackathonTeam.hasMany(Submission, { foreignKey: 'teamId', as: 'submissions' });
Submission.belongsTo(HackathonTeam, { foreignKey: 'teamId' });

Job.belongsToMany(User, { through: JobApplication, foreignKey: 'jobId', otherKey: 'userId' });
User.belongsToMany(Job, { through: JobApplication, foreignKey: 'userId', otherKey: 'jobId' });

module.exports = {
  sequelize,
  User,
  Event,
  Hackathon,
  Job,
  EventRegistration,
  HackathonTeam,
  TeamMember,
  Submission,
  JobApplication
};
