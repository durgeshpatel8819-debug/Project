const express = require("express");

const {
    createAuditLog,
    getAllAuditLogs
} = require("../controllers/auditLogController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/create",
    authMiddleware,
    roleMiddleware("admin"),
    createAuditLog
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllAuditLogs
);

module.exports = router;