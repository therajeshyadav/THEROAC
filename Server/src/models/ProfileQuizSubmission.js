const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ProfileQuizSubmission extends Model {}

ProfileQuizSubmission.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: false
  },
  questions: {
    type: DataTypes.JSON,
    allowNull: false
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false
  },
  skillScores: {
    type: DataTypes.JSON,
    allowNull: false
  },
  overallScore: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  badges: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'ProfileQuizSubmission',
  tableName: 'profile_quiz_submissions',
  timestamps: true
});

module.exports = ProfileQuizSubmission;