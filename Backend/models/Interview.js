const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true
        },

        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },

        interviewer: {
            type: String,
            required: true
        },

        interviewDate: {
            type: Date,
            required: true
        },

        mode: {
            type: String,
            enum: ["Online", "Offline"],
            required: true
        },

        meetingLink: {
            type: String
        },

        location: {
            type: String
        },

        status: {
            type: String,
            enum: [
                "Scheduled",
                "Completed",
                "Cancelled"
            ],
            default: "Scheduled"
        },

        feedback: {
            type: String
        },

        result: {
            type: String,
            enum: [
                "Pending",
                "Selected",
                "Rejected"
            ],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Interview", interviewSchema);