const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class JobApplication extends Model {}

JobApplication.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  jobId: { type: DataTypes.UUID, allowNull: false },
  resumeLink: { type: DataTypes.TEXT, allowNull: true },
  coverLetter: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('applied','pending','reviewing','shortlisted','interview','offered','hired','accepted','rejected','cancelled'), defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  metadata: { type: DataTypes.JSON, allowNull: true },
  currentStage: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'Current recruitment stage index' },
  stageSubmissions: { 
    type: DataTypes.JSON, 
    allowNull: true,
    defaultValue: null,
    comment: 'Stage-wise submissions - [{stageIndex, submittedAt, submissionLink, submissionFile}]'
  }
}, {
  sequelize,
  modelName: 'JobApplication',
  tableName: 'job_applications',
  timestamps: true,
  paranoid: true
});

module.exports = JobApplication;
