const Performance = require("../models/Performance");

const createPerformance = async (req, res) => {
    try {
        const {
            employeeId,
            reviewPeriod,
            goals,
            achievements,
            rating,
            feedback
        } = req.body;

        const performance = await Performance.create({
            employeeId,
            reviewPeriod,
            goals,
            achievements,
            rating,
            feedback
        });

        res.status(201).json({
            message: "Performance review created successfully",
            performance
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating performance review",
            error: error.message
        });
    }
};

const getAllPerformances = async (req, res) => {
    try {
        const performances = await Performance.find()
            .populate("employeeId");

        res.status(200).json({
            count: performances.length,
            performances
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching performance reviews",
            error: error.message
        });
    }
};

const getEmployeePerformance = async (req, res) => {
    try {
        const performances = await Performance.find({
            employeeId: req.params.employeeId
        }).populate("employeeId");

        res.status(200).json({
            count: performances.length,
            performances
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching employee performance",
            error: error.message
        });
    }
};

const updatePerformanceStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const performance = await Performance.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!performance) {
            return res.status(404).json({
                message: "Performance review not found"
            });
        }

        res.status(200).json({
            message: "Performance status updated successfully",
            performance
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating performance status",
            error: error.message
        });
    }
};

module.exports = {
    createPerformance,
    getAllPerformances,
    getEmployeePerformance,
    updatePerformanceStatus
};