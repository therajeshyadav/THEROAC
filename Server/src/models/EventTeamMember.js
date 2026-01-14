const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class EventTeamMember extends Model {
  static associate(models) {
    // A team member belongs to a team
    EventTeamMember.belongsTo(models.EventTeam, {
      foreignKey: 'teamId',
      as: 'team'
    });

    // A team member is a user
    EventTeamMember.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // A team member belongs to an event
    EventTeamMember.belongsTo(models.Event, {
      foreignKey: 'eventId',
      as: 'event'
    });
  }
}

EventTeamMember.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  teamId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  eventId: { type: DataTypes.UUID, allowNull: false },
  role: { 
    type: DataTypes.ENUM('leader', 'member'), 
    defaultValue: 'member',
    allowNull: false 
  },
  joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  modelName: 'EventTeamMember',
  tableName: 'event_team_members',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'eventId'] // One team per user per event
    },
    {
      fields: ['teamId']
    },
    {
      fields: ['eventId']
    }
  ]
});

module.exports = EventTeamMember;