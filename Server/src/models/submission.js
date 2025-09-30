const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Submission extends Model {}

Submission.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hackathonId: { type: DataTypes.UUID, allowNull: false },
  teamId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  submissionLink: { type: DataTypes.TEXT, allowNull: true },
  metadata: { type: DataTypes.JSON, allowNull: true },
  status: { type: DataTypes.ENUM('submitted','under_review','accepted','rejected'), defaultValue: 'submitted' }
}, {
  sequelize,
  modelName: 'Submission',
  tableName: 'submissions',
  timestamps: true,
  paranoid: true
});

module.exports = Submission;
