const express = require("express");

const {
    createPerformance,
    getAllPerformances,
    getEmployeePerformance,
    updatePerformanceStatus
} = require("../controllers/performanceController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/create",
    authMiddleware,
    roleMiddleware("admin"),
    createPerformance
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllPerformances
);

router.get(
    "/employee/:employeeId",
    authMiddleware,
    roleMiddleware("admin"),
    getEmployeePerformance
);

router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updatePerformanceStatus
);

module.exports = router;