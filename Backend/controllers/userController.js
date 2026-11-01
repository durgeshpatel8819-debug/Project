
const User = require("../models/User");
const bcrypt = require("bcryptjs");


// Get My Profile

const getMyProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json({
            user
        });

    } catch (error) {

        console.log("Profile Error:", error.message);

        res.status(500).json({
            message: "Error fetching profile",
            error: error.message
        });

    }

};



// Update My Profile

const updateMyProfile = async (req, res) => {

    try {

        const {
            name,
            email
        } = req.body;


        if (!name || !email) {

            return res.status(400).json({
                message: "Name and email are required"
            });

        }


        const existingUser = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: req.user.id }
        });


        if (existingUser) {

            return res.status(400).json({
                message: "Email already exists"
            });

        }


        const user = await User.findByIdAndUpdate(

            req.user.id,

            {
                name: name.trim(),
                email: email.toLowerCase().trim()
            },

            {
                new: true,
                runValidators: true
            }

        ).select("-password");


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }


        res.status(200).json({

            message: "Profile updated successfully",

            user

        });


    } catch (error) {

        console.log(
            "Update Profile Error:",
            error.message
        );

        res.status(500).json({

            message: "Error updating profile",

            error: error.message

        });

    }

};



// Change Password

const changePassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword
        } = req.body;


        if (!currentPassword || !newPassword) {

            return res.status(400).json({

                message:
                    "Current password and new password are required"

            });

        }


        if (newPassword.length < 6) {

            return res.status(400).json({

                message:
                    "New password must be at least 6 characters"

            });

        }


        const user = await User.findById(
            req.user.id
        );


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        const isPasswordCorrect =
            await bcrypt.compare(
                currentPassword,
                user.password
            );


        if (!isPasswordCorrect) {

            return res.status(400).json({

                message:
                    "Current password is incorrect"

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        user.password =
            hashedPassword;


        await user.save();


        res.status(200).json({

            message:
                "Password changed successfully"

        });


    } catch (error) {

        console.log(
            "Change Password Error:",
            error.message
        );

        res.status(500).json({

            message:
                "Error changing password",

            error:
                error.message

        });

    }

};



module.exports = {

    getMyProfile,

    updateMyProfile,

    changePassword

};

