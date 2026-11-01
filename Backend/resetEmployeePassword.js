const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const hashedPassword = await bcrypt.hash("Employee@123", 10);

        const user = await User.findOneAndUpdate(
            { email: "durgesh@example.com" },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            console.log("Employee user not found");
        } else {
            console.log("Employee password reset successfully");
            console.log("Email:", user.email);
            console.log("Password: Employee@123");
        }

        await mongoose.disconnect();

    } catch (error) {
        console.log("Error:", error.message);
    }
};

resetPassword();