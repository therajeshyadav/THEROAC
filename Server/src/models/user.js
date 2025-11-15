const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class User extends Model {
}

User.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: true, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING, allowNull: true },
  passwordHash: { type: DataTypes.STRING, allowNull: true },
  provider: { type: DataTypes.ENUM('email','google','linkedin','github','apple'), defaultValue: 'email' },
  providerId: { type: DataTypes.STRING, allowNull: true },
  profilePicture: { type: DataTypes.TEXT, allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  gender: { type: DataTypes.ENUM('male','female','other'), allowNull: true },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.ENUM('user','candidate','recruiter','organizer','moderator','admin','superadmin'), defaultValue: 'candidate' },
  status: { type: DataTypes.ENUM('active','inactive','banned','suspended'), defaultValue: 'active' },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  emailVerificationToken: { type: DataTypes.STRING, allowNull: true },
  emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
  resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
  resetPasswordExpires: { type: DataTypes.DATE, allowNull: true },
  failedLoginAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastLoginIP: { type: DataTypes.STRING, allowNull: true },
  lastLogin: { type: DataTypes.DATE, allowNull: true },
  preferences: { type: DataTypes.JSON, defaultValue: { emailNotifications: true, pushNotifications: true, darkMode: false } },
  fcmToken: { type: DataTypes.STRING, allowNull: true },
  deviceInfo: { type: DataTypes.JSON, allowNull: true },
  signupSource: { type: DataTypes.ENUM('website','mobile-app','referral','campaign'), defaultValue: 'website' },
  referralCode: { type: DataTypes.STRING, allowNull: true },
  referredBy: { type: DataTypes.UUID, allowNull: true }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
        user.passwordHash = await bcrypt.hash(user.passwordHash, rounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash')) {
        const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
        user.passwordHash = await bcrypt.hash(user.passwordHash, rounds);
      }
    }
  }
});

module.exports = User;
