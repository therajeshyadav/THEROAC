const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class RETSubmission extends Model {}

RETSubmission.init({
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  topic: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  difficulty: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  questions: { 
    type: DataTypes.JSON, 
    allowNull: false 
  }, // Store questions with correct answers
  answers: { 
    type: DataTypes.JSON, 
    allowNull: false 
  }, // User's answers
  score: { 
    type: DataTypes.FLOAT, 
    allowNull: false 
  }, // Percentage score
  correctAnswers: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  totalQuestions: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  timeSpent: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  }, // Time in seconds
  completedAt: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  passed: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false 
  }, // Whether score >= 70%
  coinsEarned: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  }, // Coins awarded for this submission
}, {
  sequelize,
  modelName: 'RETSubmission',
  tableName: 'ret_submissions',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'createdAt']
    }
  ]
});

module.exports = RETSubmission;
