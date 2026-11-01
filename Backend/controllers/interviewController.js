const Interview = require("../models/Interview");

const createInterview = async (req, res) => {
    try {
        const {
            candidateId,
            jobId,
            interviewer,
            interviewDate,
            mode,
            meetingLink,
            location
        } = req.body;

        if (
            !candidateId ||
            !jobId ||
            !interviewer ||
            !interviewDate ||
            !mode
        ) {
            return res.status(400).json({
                message: "All required interview fields are required"
            });
        }

        if (mode === "Online" && !meetingLink) {
            return res.status(400).json({
                message: "Meeting link is required for online interview"
            });
        }

        if (mode === "Offline" && !location) {
            return res.status(400).json({
                message: "Location is required for offline interview"
            });
        }

        const interview = await Interview.create({
            candidateId,
            jobId,
            interviewer,
            interviewDate,
            mode,
            meetingLink,
            location
        });

        res.status(201).json({
            message: "Interview scheduled successfully",
            interview
        });

    } catch (error) {

        console.error(
            "Create Interview Error:",
            error
        );

        res.status(500).json({
            message: "Error scheduling interview",
            error: error.message
        });
    }
};

const getAllInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find()
            .populate("candidateId")
            .populate("jobId");

        res.status(200).json({
            count: interviews.length,
            interviews
        });

    } catch (error) {

        res.status(500).json({
            message: "Error fetching interviews",
            error: error.message
        });
    }
};

const getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate("candidateId")
            .populate("jobId");

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        res.status(200).json({
            interview
        });

    } catch (error) {

        res.status(500).json({
            message: "Error fetching interview",
            error: error.message
        });
    }
};

const updateInterviewStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const interview = await Interview.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        res.status(200).json({
            message: "Interview status updated successfully",
            interview
        });

    } catch (error) {

        res.status(500).json({
            message: "Error updating interview status",
            error: error.message
        });
    }
};

const updateInterviewResult = async (req, res) => {
    try {
        const { result, feedback } = req.body;

        const interview = await Interview.findByIdAndUpdate(
            req.params.id,
            {
                result,
                feedback
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        res.status(200).json({
            message: "Interview result updated successfully",
            interview
        });

    } catch (error) {

        res.status(500).json({
            message: "Error updating interview result",
            error: error.message
        });
    }
};

const deleteInterview = async (req, res) => {
    try {
        const interview = await Interview.findByIdAndDelete(
            req.params.id
        );

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        res.status(200).json({
            message: "Interview deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Error deleting interview",
            error: error.message
        });
    }
};

module.exports = {
    createInterview,
    getAllInterviews,
    getInterviewById,
    updateInterviewStatus,
    updateInterviewResult,
    deleteInterview
};