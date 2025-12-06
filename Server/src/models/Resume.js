const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Resume extends Model {}

Resume.init({
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'My Resume'
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Resume',
  tableName: 'resumes',
  timestamps: true
});

module.exports = Resume;
