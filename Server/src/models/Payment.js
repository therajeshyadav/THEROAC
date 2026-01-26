const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Payment extends Model {}

Payment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    trainingUserId: { type: DataTypes.UUID, allowNull: false },

    transactionId: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    couponCode: DataTypes.STRING,
    originalPrice: DataTypes.INTEGER,
    discount: DataTypes.INTEGER,
    finalAmount: DataTypes.INTEGER,

    paymentStatus: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
      defaultValue: "PENDING"
    }
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true
  }
);

module.exports = Payment;
