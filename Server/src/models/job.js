const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Job extends Model {}

Job.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  companyName: { type: DataTypes.STRING, allowNull: false },
  companyLogo: { type: DataTypes.TEXT, allowNull: true },
  bannerImage: { type: DataTypes.TEXT, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  responsibilities: { type: DataTypes.TEXT, allowNull: true },
  requirements: { type: DataTypes.TEXT, allowNull: true },
  qualifications: { type: DataTypes.TEXT, allowNull: true },
  benefits: { type: DataTypes.TEXT, allowNull: true },
  perks: { type: DataTypes.JSON, allowNull: true }, // Array of perks
  eligibility: { type: DataTypes.JSON, allowNull: true }, // Array of eligibility criteria
  faqs: { type: DataTypes.JSON, allowNull: true }, // Array of {question: string, answer: string}
  jobType: { type: DataTypes.ENUM('full-time','part-time','internship','contract'), defaultValue: 'full-time' },
  experienceLevel: { type: DataTypes.ENUM('fresher','junior','mid','senior'), defaultValue: 'fresher' },
  locationType: { type: DataTypes.ENUM('remote','onsite','hybrid'), defaultValue: 'remote' },
  location: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  salary: { 
    type: DataTypes.JSON, 
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('salary');
      // Ensure salary is always an object or null
      if (!rawValue) return null;
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return { min: '', max: '', currency: 'USD', period: 'yearly' };
        }
      }
      return rawValue;
    },
    set(value) {
      // Ensure salary is stored as proper JSON
      if (value && typeof value === 'object') {
        this.setDataValue('salary', value);
      } else if (typeof value === 'string') {
        try {
          this.setDataValue('salary', JSON.parse(value));
        } catch (e) {
          this.setDataValue('salary', null);
        }
      } else {
        this.setDataValue('salary', null);
      }
    }
  },
  applicationDeadline: { type: DataTypes.DATE, allowNull: true },
  applyLink: { type: DataTypes.TEXT, allowNull: true },
  applyEmail: { type: DataTypes.STRING, allowNull: true },
  skills: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  categories: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  department: { type: DataTypes.STRING, allowNull: true },
  numberOfPositions: { type: DataTypes.INTEGER, defaultValue: 1 },
  media: { type: DataTypes.JSON, allowNull: true }, // Array of {type: 'image'|'video', url: string, caption?: string}
  companyDescription: { type: DataTypes.TEXT, allowNull: true },
  companyWebsite: { type: DataTypes.STRING, allowNull: true },
  companySocials: { type: DataTypes.JSON, allowNull: true }, // {linkedin, twitter, etc}
  contactPerson: { type: DataTypes.JSON, allowNull: true }, // {name, email, phone}
  status: { type: DataTypes.ENUM('open','closed','paused'), defaultValue: 'open' },
  approvalStatus: { type: DataTypes.ENUM('pending','approved','rejected','draft'), defaultValue: 'pending' },
  approvedBy: { type: DataTypes.UUID, allowNull: true },
  approvedAt: { type: DataTypes.DATE, allowNull: true },
  rejectionReason: { type: DataTypes.TEXT, allowNull: true },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  urgent: { type: DataTypes.BOOLEAN, defaultValue: false },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  applications: { type: DataTypes.INTEGER, defaultValue: 0 },
  stages: { 
    type: DataTypes.JSON, 
    allowNull: true,
    defaultValue: null,
    comment: 'Recruitment stages/rounds - [{title, type: "assessment"|"interview"|"final", description, deadline, assessmentFile: {url, name}, assessmentLink, submissions: [{type, label, description, required}]}]'
  },
  createdBy: { type: DataTypes.UUID, allowNull: false },
  organizationId: { type: DataTypes.UUID, allowNull: true }
}, {
  sequelize,
  modelName: 'Job',
  tableName: 'jobs',
  timestamps: true,
  paranoid: true
});

module.exports = Job;
