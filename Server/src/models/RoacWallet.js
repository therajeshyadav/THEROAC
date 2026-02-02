const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class RoacWallet extends Model {}

RoacWallet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },

    balance: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    lastLoginDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },

    loginStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    streakRecoveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },

    isFrozen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'RoacWallet',
    tableName: 'roac_wallets',
    timestamps: true,
    paranoid: false,

    indexes: [
      {
        unique: true,
        fields: ['userId']
      }
    ]
  }
);

module.exports = RoacWallet;
