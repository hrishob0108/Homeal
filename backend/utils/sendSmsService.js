const axios = require("axios");

/**
 * Sends a 6-digit Mobile SMS OTP using SMS Gateways (Fast2SMS / Twilio / 2Factor)
 * @param {string} phone - 10-digit Indian phone number
 * @param {string} otp - 6-digit OTP code
 */
const sendSmsOtp = async (phone, otp) => {
  const cleanPhone = String(phone).replace(/\D/g, "");

  // Always log to backend server console for tracking & debugging
  console.log(`\n=================================================`);
  console.log(`[MOBILE SMS SERVICE] Sending OTP to +91 ${cleanPhone}`);
  console.log(`[MOBILE SMS SERVICE] OTP Code: ${otp}`);
  console.log(`=================================================\n`);

  // 1. Fast2SMS Integration (If FAST2SMS_API_KEY is present in .env)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          route: "otp",
          variables_values: otp,
          numbers: cleanPhone,
        },
        {
          headers: {
            authorization: process.env.FAST2SMS_API_KEY,
          },
        }
      );
      console.log(`[Fast2SMS] SMS sent response:`, response.data);
      return { success: true, provider: "Fast2SMS" };
    } catch (err) {
      console.error(`[Fast2SMS Error]:`, err.response?.data || err.message);
    }
  }

  // 2. Twilio Integration (If TWILIO keys are present in .env)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = require("twilio")(accountSid, authToken);

      await client.messages.create({
        body: `Your Craavyo verification OTP code is ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${cleanPhone}`,
      });
      console.log(`[Twilio] SMS sent successfully to +91${cleanPhone}`);
      return { success: true, provider: "Twilio" };
    } catch (err) {
      console.error(`[Twilio Error]:`, err.message);
    }
  }

  return { success: true, provider: "ConsoleLogger" };
};

module.exports = sendSmsOtp;
