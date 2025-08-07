const Stripe = require("stripe");

if (!process.env.PAYMENT_SK_KEY) {
  throw new Error(
    "❌ Stripe Secret Key (PAYMENT_SK_KEY) is missing in .env file"
  );
}

// Initialize Stripe with secret key
const stripe = Stripe(process.env.PAYMENT_SK_KEY, {
  apiVersion: "2023-10-16", // Always lock a stable API version
});

module.exports = stripe;
