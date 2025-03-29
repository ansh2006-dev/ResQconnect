const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSms = async (phoneNumber, message) => {
    try {
        await client.messages.create({
            body: message,
            from: "+1234567890",  // Twilio Verified Number
            to: phoneNumber,
        });
        console.log("✅ SMS sent");
    } catch (error) {
        console.error("❌ SMS Error:", error);
    }
};

module.exports = { sendSms }; 