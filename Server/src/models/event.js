const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Event extends Model {}

Event.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  bannerImage: { type: DataTypes.TEXT, allowNull: true },
  thumbnailImage: { type: DataTypes.TEXT, allowNull: true },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  registrationDeadline: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('upcoming','ongoing','completed','cancelled'), defaultValue: 'upcoming' },
  approvalStatus: { type: DataTypes.ENUM('pending','approved','rejected','draft'), defaultValue: 'pending' },
  approvedBy: { type: DataTypes.UUID, allowNull: true },
  approvedAt: { type: DataTypes.DATE, allowNull: true },
  rejectionReason: { type: DataTypes.TEXT, allowNull: true },
  locationType: { type: DataTypes.ENUM('online','offline','hybrid'), defaultValue: 'online' },
  location: { type: DataTypes.STRING, allowNull: true },
  venue: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  venueAddress: { type: DataTypes.TEXT, allowNull: true },
  mapLink: { type: DataTypes.TEXT, allowNull: true },
  eligibility: { type: DataTypes.JSON, allowNull: true },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  categories: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  prizes: { type: DataTypes.JSON, allowNull: true }, // Array of {position, amount, description}
  registrationLink: { type: DataTypes.TEXT, allowNull: true },
  registrationFee: { type: DataTypes.JSON, allowNull: true }, // {amount, currency, type}
  maxParticipants: { type: DataTypes.INTEGER, allowNull: true },
  agenda: { type: DataTypes.JSON, allowNull: true }, // Array of {time, title, description, speaker}
  speakers: { type: DataTypes.JSON, allowNull: true }, // Array of {name, title, bio, image, socials}
  sponsors: { type: DataTypes.JSON, allowNull: true }, // Array of {name, logo, tier, website}
  media: { type: DataTypes.JSON, allowNull: true }, // Array of {type: 'image'|'video', url: string, thumbnail?: string, caption?: string}
  requirements: { type: DataTypes.TEXT, allowNull: true },
  whatToBring: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  contactInfo: { type: DataTypes.JSON, allowNull: true }, // {email, phone, website}
  socials: { type: DataTypes.JSON, allowNull: true }, // {facebook, twitter, linkedin, instagram}
  faqs: { type: DataTypes.JSON, allowNull: true }, // Array of {question, answer}
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  registrations: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdBy: { type: DataTypes.UUID, allowNull: false },
  organizationId: { type: DataTypes.UUID, allowNull: true }
}, {
  sequelize,
  modelName: 'Event',
  tableName: 'events',
  timestamps: true,
  paranoid: true
});

module.exports = Event;
