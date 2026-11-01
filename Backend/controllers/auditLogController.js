const AuditLog = require("../models/AuditLog");

const createAuditLog = async (req, res) => {
    try {
        const {
            action,
            module,
            description
        } = req.body;

        const auditLog = await AuditLog.create({
            userId: req.user.id,
            action,
            module,
            description,
            ipAddress: req.ip
        });

        res.status(201).json({
            message: "Audit log created successfully",
            auditLog
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating audit log",
            error: error.message
        });
    }
};

const getAllAuditLogs = async (req, res) => {
    try {
        const auditLogs = await AuditLog.find()
            .populate("userId", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: auditLogs.length,
            auditLogs
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching audit logs",
            error: error.message
        });
    }
};

module.exports = {
    createAuditLog,
    getAllAuditLogs
};