const admin = require("firebase-admin");

const serviceAccount = require("../firebase-adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (token, message) => {
    try {
        await admin.messaging().send({
            token,
            notification: { title: "Disaster Alert", body: message },
        });
        console.log("✅ Notification sent");
    } catch (error) {
        console.error("❌ Notification Error:", error);
    }
};

module.exports = { sendNotification }; 