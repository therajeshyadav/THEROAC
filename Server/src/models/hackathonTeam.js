const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class HackathonTeam extends Model {}

HackathonTeam.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hackathonId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  leaderId: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.ENUM('registered','shortlisted','winner','disqualified'), defaultValue: 'registered' },
  metadata: { type: DataTypes.JSON, allowNull: true }
}, {
  sequelize,
  modelName: 'HackathonTeam',
  tableName: 'hackathon_teams',
  timestamps: true,
  paranoid: true
});

module.exports = HackathonTeam;
