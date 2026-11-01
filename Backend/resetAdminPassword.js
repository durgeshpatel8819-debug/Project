const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        const user = await User.findOneAndUpdate(
            { email: "admin@example.com" },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            console.log("Admin user not found");
        } else {
            console.log("Admin password reset successfully");
            console.log("Email:", user.email);
            console.log("Password: Admin@123");
        }

        await mongoose.disconnect();

    } catch (error) {
        console.log("Error:", error.message);
    }
};

resetPassword();