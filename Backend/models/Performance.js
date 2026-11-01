const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        reviewPeriod: {
            type: String,
            required: true
        },

        goals: {
            type: String,
            required: true
        },

        achievements: {
            type: String,
            required: true
        },

        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },

        feedback: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Pending", "Reviewed"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Performance", performanceSchema);