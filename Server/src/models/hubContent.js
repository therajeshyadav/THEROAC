const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class HubContent extends Model {}

HubContent.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  contentType: { 
    type: DataTypes.ENUM('internship', 'job', 'article', 'guide', 'tutorial', 'opportunity'), 
    defaultValue: 'article' 
  },
  category: { 
    type: DataTypes.ENUM('career-tips', 'interview-prep', 'skill-development', 'industry-insights', 'networking', 'internships', 'jobs'), 
    defaultValue: 'career-tips' 
  },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  status: { 
    type: DataTypes.ENUM('draft', 'published', 'archived'), 
    defaultValue: 'published' 
  },
  featuredImage: { type: DataTypes.TEXT, allowNull: true },
  thumbnailImage: { type: DataTypes.TEXT, allowNull: true },
  bannerImage: { type: DataTypes.TEXT, allowNull: true },
  media: { type: DataTypes.JSON, allowNull: true }, // Array of {type: 'image'|'video', url: string, thumbnail?: string, caption?: string}
  
  // Internship/Job specific fields
  companyName: { type: DataTypes.STRING, allowNull: true },
  companyLogo: { type: DataTypes.TEXT, allowNull: true },
  companyDescription: { type: DataTypes.TEXT, allowNull: true },
  position: { type: DataTypes.STRING, allowNull: true },
  duration: { type: DataTypes.STRING, allowNull: true },
  stipend: { 
    type: DataTypes.JSON, 
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('stipend');
      // Ensure stipend is always an object or null
      if (!rawValue) return null;
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return { amount: '', currency: 'USD', period: 'monthly' };
        }
      }
      return rawValue;
    },
    set(value) {
      // Ensure stipend is stored as proper JSON
      if (value && typeof value === 'object') {
        this.setDataValue('stipend', value);
      } else if (typeof value === 'string') {
        try {
          this.setDataValue('stipend', JSON.parse(value));
        } catch (e) {
          this.setDataValue('stipend', null);
        }
      } else {
        this.setDataValue('stipend', null);
      }
    }
  },
  location: { type: DataTypes.STRING, allowNull: true },
  locationType: { type: DataTypes.ENUM('remote','onsite','hybrid'), allowNull: true },
  applicationDeadline: { type: DataTypes.DATE, allowNull: true },
  applyLink: { type: DataTypes.TEXT, allowNull: true },
  applyEmail: { type: DataTypes.STRING, allowNull: true },
  requirements: { type: DataTypes.TEXT, allowNull: true },
  responsibilities: { type: DataTypes.TEXT, allowNull: true },
  skills: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  benefits: { type: DataTypes.TEXT, allowNull: true },
  eligibility: { type: DataTypes.JSON, allowNull: true }, // Array of eligibility criteria
  faqs: { type: DataTypes.JSON, allowNull: true }, // Array of {question: string, answer: string}
  numberOfPositions: { type: DataTypes.INTEGER, allowNull: true },
  
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  applications: { type: DataTypes.INTEGER, defaultValue: 0 },
  stages: { 
    type: DataTypes.JSON, 
    allowNull: true,
    defaultValue: null,
    comment: 'Recruitment stages/rounds - [{title, type: "assessment"|"interview"|"final", description, deadline, assessmentFile: {url, name}, assessmentLink}]'
  },
  createdBy: { type: DataTypes.UUID, allowNull: false },
  organizationId: { type: DataTypes.UUID, allowNull: true },
  
  // Approval system fields
  approvalStatus: { 
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'draft'), 
    defaultValue: 'pending',
    allowNull: false 
  },
  approvedBy: { 
    type: DataTypes.UUID, 
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: { type: DataTypes.DATE, allowNull: true },
  rejectionReason: { type: DataTypes.TEXT, allowNull: true }
}, {
  sequelize,
  modelName: 'HubContent',
  tableName: 'hub_content',
  timestamps: true,
  paranoid: true
});

module.exports = HubContent;