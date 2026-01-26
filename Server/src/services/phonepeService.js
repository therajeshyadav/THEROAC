const { PhonePeNode } = require("@dev_innovations_labs/phonepe-pg-sdk");

const phonepe = new PhonePeNode({
  clientId: process.env.PHONEPE_CLIENT_ID,
  clientSecret: process.env.PHONEPE_CLIENT_SECRET,
  environment: "production",
});

module.exports = {
  async createOrder({ amount, redirectUrl }) {
    const response = await phonepe.createPayment({
      amount: amount * 100,
      expireAfter: 1200,
      metaInfo: { udf1: "custom-info" },

      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: {
          redirectUrl: redirectUrl,
        },
      },
      merchantOrderId: undefined,
      merchantTransactionId: undefined,
    });

    return {
      redirectUrl: response.redirectUrl,
      merchantOrderId: response.merchantOrderId,
      merchantTransactionId: response.merchantTransactionId,
    };
  },

  async verifyStatus({ merchantOrderId }) {
    return await phonepe.getStatus(
      process.env.PHONEPE_MERCHANT_ID,
      merchantOrderId
    );
  }
};
