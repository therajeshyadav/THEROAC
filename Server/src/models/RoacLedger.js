const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class RoacLedger extends Model {}

RoacLedger.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    walletId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    type: {
      type: DataTypes.ENUM('EARN', 'SPEND', 'ADJUST'),
      allowNull: false
    },

    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notZero(value) {
          if (value === 0) {
            throw new Error('Ledger amount cannot be zero');
          }
        }
      }
    },

    reasonCode: {
      type: DataTypes.STRING,
      allowNull: false
    },

    referenceId: {
      type: DataTypes.UUID,
      allowNull: true
    },

    quarter: {
      type: DataTypes.STRING,
      allowNull: false
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'RoacLedger',
    tableName: 'roac_ledger',
    timestamps: true,
    updatedAt: false,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'reasonCode', 'referenceId'],
        name: 'roac_unique_event'
      },
      {
        fields: ['userId']
      },
      {
        fields: ['quarter']
      }
    ]
  }
);

module.exports = RoacLedger;
