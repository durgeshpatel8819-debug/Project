const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                "Recruitment",
                "Interview",
                "Leave",
                "Payroll",
                "Employee",
                "Department",
                "Attendance",
                "Performance",
                "System"
            ],
            default: "System"
        },

        priority: {
            type: String,
            enum: [
                "Low",
                "Normal",
                "High",
                "Urgent"
            ],
            default: "Normal"
        },

        isRead: {
            type: Boolean,
            default: false
        },

        actionUrl: {
            type: String,
            default: ""
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        relatedModel: {
            type: String,
            default: ""
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

notificationSchema.index({
    userId: 1,
    isRead: 1,
    createdAt: -1
});

notificationSchema.index({
    type: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);