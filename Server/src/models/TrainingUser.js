const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class TrainingUser extends Model {}

TrainingUser.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    userId: { type: DataTypes.UUID, allowNull: false },

    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,

    city: DataTypes.STRING,
    state: DataTypes.STRING,

    college: DataTypes.STRING,
    degree: DataTypes.STRING,
    branch: DataTypes.STRING,
    currentStatus: DataTypes.STRING,
    gradYear: DataTypes.STRING,

    track: DataTypes.STRING,
    duration: DataTypes.STRING,
    programmingLevel: DataTypes.STRING,
    technologies: DataTypes.TEXT,

    consentProgram: DataTypes.BOOLEAN,
    consentSalary: DataTypes.BOOLEAN,
    consentContact: DataTypes.BOOLEAN,

    couponCode: DataTypes.STRING,
    originalPrice: DataTypes.INTEGER,
    discount: DataTypes.INTEGER,
    finalAmount: DataTypes.INTEGER,

    transactionId: DataTypes.STRING,
    paymentStatus: { type: DataTypes.STRING, defaultValue: "PENDING" }
  },
  {
    sequelize,
    modelName: "TrainingUser",
    tableName: "training_users",
    timestamps: true
  }
);

module.exports = TrainingUser;
