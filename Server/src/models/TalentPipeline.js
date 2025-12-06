const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class TalentPipeline extends Model {}

TalentPipeline.init({
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  candidateId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  organizationId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  addedBy: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  stage: { 
    type: DataTypes.ENUM('prospect', 'contacted', 'interested', 'qualified', 'ready-to-hire'), 
    defaultValue: 'prospect' 
  },
  source: { 
    type: DataTypes.STRING, 
    allowNull: true // e.g., 'job-application', 'referral', 'linkedin', 'manual'
  },
  sourceId: { 
    type: DataTypes.UUID, 
    allowNull: true // Reference to job application or other source
  },
  skills: { 
    type: DataTypes.ARRAY(DataTypes.STRING), 
    allowNull: true 
  },
  experience: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  desiredRole: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  expectedSalary: { 
    type: DataTypes.JSON, 
    allowNull: true // {min, max, currency}
  },
  availability: { 
    type: DataTypes.STRING, 
    allowNull: true // e.g., 'immediate', '2-weeks', '1-month'
  },
  notes: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  tags: { 
    type: DataTypes.ARRAY(DataTypes.STRING), 
    allowNull: true 
  },
  lastContactedAt: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  metadata: { 
    type: DataTypes.JSON, 
    allowNull: true 
  }
}, {
  sequelize,
  modelName: 'TalentPipeline',
  tableName: 'talent_pipeline',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['candidateId'] },
    { fields: ['organizationId'] },
    { fields: ['stage'] },
    { fields: ['organizationId', 'candidateId'], unique: true }
  ]
});

module.exports = TalentPipeline;
