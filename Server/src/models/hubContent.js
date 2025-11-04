const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class HubContent extends Model {}

HubContent.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  category: { 
    type: DataTypes.ENUM('career-tips', 'interview-prep', 'skill-development', 'industry-insights', 'networking'), 
    defaultValue: 'career-tips' 
  },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  status: { 
    type: DataTypes.ENUM('draft', 'published', 'archived'), 
    defaultValue: 'published' 
  },
  featuredImage: { type: DataTypes.TEXT, allowNull: true },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdBy: { type: DataTypes.UUID, allowNull: false }
}, {
  sequelize,
  modelName: 'HubContent',
  tableName: 'hub_content',
  timestamps: true,
  paranoid: true
});

module.exports = HubContent;