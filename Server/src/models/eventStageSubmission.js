const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class EventStageSubmission extends Model {}

EventStageSubmission.init({
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  eventId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    }
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  stageIndex: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    comment: 'Index of the stage in the event stages array'
  },
  stageName: { 
    type: DataTypes.STRING, 
    allowNull: false,
    comment: 'Name of the stage (e.g., Round 1, Final Round)'
  },
  submissionData: { 
    type: DataTypes.JSON, 
    allowNull: false,
    comment: 'JSON object containing all submission data (files, links, text, etc.)'
  },
  status: { 
    type: DataTypes.ENUM('submitted', 'under_review', 'accepted', 'rejected'), 
    defaultValue: 'submitted' 
  },
  reviewNotes: { 
    type: DataTypes.TEXT, 
    allowNull: true,
    comment: 'Notes from reviewers/judges'
  },
  score: { 
    type: DataTypes.DECIMAL(5, 2), 
    allowNull: true,
    comment: 'Score given by judges (if applicable)'
  },
  submittedAt: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  },
  reviewedAt: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  reviewedBy: { 
    type: DataTypes.UUID, 
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'EventStageSubmission',
  tableName: 'event_stage_submissions',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['eventId', 'userId', 'stageIndex'],
      name: 'unique_user_stage_submission'
    }
  ]
});

module.exports = EventStageSubmission;