const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        department: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        jobType: {
            type: String,
            enum: [
                "Full Time",
                "Part Time",
                "Internship",
                "Contract"
            ],
            default: "Full Time"
        },

        salary: {
            type: Number,
            required: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        requirements: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "Open",
                "Closed"
            ],
            default: "Open"
        },

        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("Job", jobSchema);