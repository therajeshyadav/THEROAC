const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class SavedJob extends Model {}

SavedJob.init({
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
  jobId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  jobType: {
    type: DataTypes.ENUM('job', 'internship'),
    defaultValue: 'job'
  },
  collection: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'default'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'SavedJob',
  tableName: 'saved_jobs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'jobId', 'jobType']
    }
  ]
});

module.exports = SavedJob;
