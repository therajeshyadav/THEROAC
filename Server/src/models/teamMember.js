const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class TeamMember extends Model {}

TeamMember.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  teamId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: true }
}, {
  sequelize,
  modelName: 'TeamMember',
  tableName: 'team_members',
  timestamps: true,
  paranoid: true
});

module.exports = TeamMember;
