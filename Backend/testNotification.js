const mongoose = require("mongoose");
require("dotenv").config();

const Notification = require("./models/Notification");
const {
    createNotification
} = require("./services/notificationService");

const testNotification = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        const notification = await createNotification({

            userId: "6abb4ecce8ed40e277e74bb2",

            title: "Welcome to HRGenius",

            message:
                "This is a test notification from HRGenius.",

            type: "System",

            priority: "Normal",

            actionUrl: "/notifications.html"

        });

        console.log(
            "Notification Created:",
            notification
        );

    } catch (error) {

        console.log(
            "Test Notification Error:",
            error
        );

    } finally {

        await mongoose.connection.close();

        console.log("MongoDB Connection Closed");
    }
};

testNotification();