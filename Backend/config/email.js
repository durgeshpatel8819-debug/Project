require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"HRGenius" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "HRGenius Password Reset OTP",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 12px;">
                <h2 style="color: #2563eb;">HRGenius</h2>

                <h3>Password Reset Request</h3>

                <p>You requested to reset your HRGenius account password.</p>

                <p>Your OTP is:</p>

                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; margin: 20px 0;">
                    ${otp}
                </div>

                <p>This OTP will expire in <b>10 minutes</b>.</p>

                <p>If you did not request this password reset, you can safely ignore this email.</p>

                <hr>

                <p style="color: #777; font-size: 13px;">
                    This is an automated email from HRGenius.
                </p>
            </div>
        `
    });
};

module.exports = sendOTPEmail;