const { User, TrainingUser, Payment } = require("../models");
const PRICING = require("../constants/pricing");
const COUPONS = require("../constants/coupons");
const phonepeService = require("../services/phonepeService");
const { v4: uuid } = require("uuid");

exports.initiatePayment = async (req, res) => {
  try {
    const form = req.body;

    if (!form.duration || !PRICING[form.duration]) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const originalPrice = PRICING[form.duration];
    let discount = 0;
    let appliedCoupon = null;

    if (form.couponCode) {
      appliedCoupon = COUPONS.find(
        c => c.code.toUpperCase() === form.couponCode.toUpperCase()
      );

      if (!appliedCoupon)
        return res.status(400).json({ success: false, message: "Invalid coupon" });

      discount =
        appliedCoupon.discountType === "PERCENT"
          ? Math.round((originalPrice * appliedCoupon.value) / 100)
          : appliedCoupon.value;
    }

    const backendAmount = Math.max(0, originalPrice - discount);

    if (backendAmount !== form.amount) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch — tampering detected"
      });
    }

    let user = await User.findOne({ where: { email: form.email } });
    if (!user) {
      user = await User.create({
        fullName: form.fullName,
        email: form.email,
      });
    }

    const transactionId = "TXN_" + uuid();

    const trainingUser = await TrainingUser.create({
      userId: user.id,
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      city: form.city,
      state: form.state,
      college: form.college,
      degree: form.degree,
      branch: form.branch,
      currentStatus: form.currentStatus,
      gradYear: form.gradYear,
      track: form.track,
      duration: form.duration,
      programmingLevel: form.programmingLevel,
      technologies: form.technologies,
      consentProgram: form.consentProgram,
      consentSalary: form.consentSalary,
      consentContact: form.consentContact,
      couponCode: form.couponCode || null,
      originalPrice,
      discount,
      finalAmount: backendAmount,
      transactionId,
      paymentStatus: "PENDING"
    });

    await Payment.create({
      trainingUserId: trainingUser.id,
      transactionId,
      amount: backendAmount,
      originalPrice,
      discount,
      finalAmount: backendAmount,
      couponCode: form.couponCode,
      paymentStatus: "PENDING"
    });

    const phonepe = await phonepeService.createOrder({
      amount: backendAmount,
      redirectUrl: form.redirectUrl
    });

    return res.status(200).json({
      success: true,
      message: "Payment initiated",
      redirectUrl: phonepe.redirectUrl,
      merchantOrderId: phonepe.merchantOrderId,
      merchantTransactionId: phonepe.merchantTransactionId,
      transactionId,
    });

  } catch (err) {
    console.error("PhonePe initiate error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { merchantOrderId } = req.body;

    const result = await phonepeService.verifyStatus({ merchantOrderId });

    const newStatus = result.success ? "SUCCESS" : "FAILED";

    await Payment.update(
      { paymentStatus: newStatus },
      { where: { merchantOrderId } }
    );

    await TrainingUser.update(
      { paymentStatus: newStatus },
      { where: { merchantOrderId } }
    );

    res.status(200).json({
      success: true,
      message: "Payment verified",
      data: result
    });

  } catch (err) {
    console.error("PhonePe verify error:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};
