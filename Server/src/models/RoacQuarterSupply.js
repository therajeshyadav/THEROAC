const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class RoacQuarterSupply extends Model {}

RoacQuarterSupply.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    quarter: {
      type: DataTypes.ENUM('Q1', 'Q2', 'Q3', 'Q4'),
      allowNull: false
    },

    baseCap: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    bonusCap: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    distributed: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'RoacQuarterSupply',
    tableName: 'roac_quarter_supply',
    timestamps: true,
    paranoid: false,

    indexes: [
      {
        unique: true,
        fields: ['year', 'quarter'],
        name: 'roac_unique_quarter'
      }
    ]
  }
);

module.exports = RoacQuarterSupply;
