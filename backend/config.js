export const config = {
  // Development Environment
  environment: process.env.NODE_ENV || "development",

  // Hosts and Ports
  port: process.env.PORT || 3000,
  clientURL: process.env.CLIENT_URL || "https://localhost:4200",

  // Database
  dbDialect: process.env.DB_DIALECT,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,

  // Twilio
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioServiceId: process.env.TWILIO_SERVICE_ID,

  // Stripe
  stripePrivateKey: process.env.STRIPE_PRIVATE_KEY,
  stripeEndpointSecret: process.env.STRIPE_ENDPOINT_SECRET,
};
