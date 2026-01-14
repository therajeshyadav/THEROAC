const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class QuizSubmission extends Model {}

QuizSubmission.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  eventId: { type: DataTypes.UUID, allowNull: false },
  stageIndex: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  answers: { type: DataTypes.JSON, allowNull: false }, // { questionIndex: selectedOptionIndex }
  score: { type: DataTypes.FLOAT, allowNull: false }, // Percentage score
  correctAnswers: { type: DataTypes.INTEGER, allowNull: false },
  totalQuestions: { type: DataTypes.INTEGER, allowNull: false },
  timeSpent: { type: DataTypes.INTEGER, allowNull: false }, // Time in seconds
  completedAt: { type: DataTypes.DATE, allowNull: false },
  passed: { type: DataTypes.BOOLEAN, allowNull: false }, // Whether score >= 70%
}, {
  sequelize,
  modelName: 'QuizSubmission',
  tableName: 'quiz_submissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['eventId', 'stageIndex', 'userId'] // One submission per user per stage
    }
  ]
});

module.exports = QuizSubmission;