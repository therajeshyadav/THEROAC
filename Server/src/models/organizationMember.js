const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class OrganizationMember extends Model {}

OrganizationMember.init({
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  organizationId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  role: { 
    type: DataTypes.ENUM('owner', 'admin', 'manager', 'member', 'viewer'), 
    defaultValue: 'member' 
  },
  permissions: { 
    type: DataTypes.JSON, 
    defaultValue: {
      canManageJobs: false,
      canManageEvents: false,
      canManageTeam: false,
      canViewAnalytics: false,
      canManageApplications: false,
      canPostJobs: false,
      canPostEvents: false,
      canEditJobs: false,
      canEditEvents: false,
      canDeleteJobs: false,
      canDeleteEvents: false,
      canRespondToApplications: false
    }
  },
  invitedBy: { 
    type: DataTypes.UUID, 
    allowNull: true 
  },
  invitedAt: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  joinedAt: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  status: { 
    type: DataTypes.ENUM('pending', 'active', 'inactive', 'removed'), 
    defaultValue: 'pending' 
  }
}, {
  sequelize,
  modelName: 'OrganizationMember',
  tableName: 'organization_members',
  timestamps: true,
  paranoid: true
});

module.exports = OrganizationMember;
