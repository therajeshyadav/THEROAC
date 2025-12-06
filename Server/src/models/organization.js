const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Organization extends Model {}

Organization.init({
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  slug: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  description: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  logo: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  website: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  phone: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  address: { 
    type: DataTypes.JSON, 
    allowNull: true 
  },
  industry: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  companySize: { 
    type: DataTypes.ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'), 
    allowNull: true 
  },
  foundedYear: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
  socialLinks: { 
    type: DataTypes.JSON, 
    allowNull: true 
  },
  settings: { 
    type: DataTypes.JSON, 
    defaultValue: {} 
  },
  status: { 
    type: DataTypes.ENUM('active', 'inactive', 'suspended'), 
    defaultValue: 'active' 
  },
  ownerId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  }
}, {
  sequelize,
  modelName: 'Organization',
  tableName: 'organizations',
  timestamps: true,
  paranoid: true
});

module.exports = Organization;
