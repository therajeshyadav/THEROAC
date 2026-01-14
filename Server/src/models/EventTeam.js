const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class EventTeam extends Model {
  static associate(models) {
    // A team belongs to an event
    EventTeam.belongsTo(models.Event, {
      foreignKey: 'eventId',
      as: 'event'
    });

    // A team has a leader (user)
    EventTeam.belongsTo(models.User, {
      foreignKey: 'leaderId',
      as: 'leader'
    });

    // A team has many members
    EventTeam.hasMany(models.EventTeamMember, {
      foreignKey: 'teamId',
      as: 'members'
    });
  }
}

EventTeam.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  eventId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  teamCode: { type: DataTypes.STRING(6), allowNull: false, unique: true },
  leaderId: { type: DataTypes.UUID, allowNull: false },
  maxMembers: { type: DataTypes.INTEGER, defaultValue: 4, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  projectTitle: { type: DataTypes.STRING, allowNull: true },
  projectDescription: { type: DataTypes.TEXT, allowNull: true },
  submissionData: { type: DataTypes.JSON, allowNull: true }, // Store submission details
}, {
  sequelize,
  modelName: 'EventTeam',
  tableName: 'event_teams',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['teamCode']
    },
    {
      fields: ['eventId']
    },
    {
      fields: ['leaderId']
    }
  ]
});

module.exports = EventTeam;