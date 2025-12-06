const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Interview extends Model {}

Interview.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'job_applications',
      key: 'id'
    }
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  recruiterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: 'Duration in minutes'
  },
  type: {
    type: DataTypes.ENUM('phone', 'video', 'in-person', 'technical', 'hr'),
    defaultValue: 'video'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'rescheduled', 'completed', 'cancelled', 'no-show'),
    defaultValue: 'scheduled'
  },
  meetingLink: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 5 }
  }
}, {
  sequelize,
  modelName: 'Interview',
  tableName: 'interviews',
  timestamps: true
});

module.exports = Interview;
