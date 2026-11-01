const express = require("express");

const {
    createPayroll,
    getAllPayrolls,
    getEmployeePayroll,
    updatePaymentStatus
} = require("../controllers/payrollController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Create payroll - Admin only
router.post(
    "/create",
    authMiddleware,
    roleMiddleware("admin"),
    createPayroll
);

// Get all payrolls - Admin only
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllPayrolls
);

// Get employee payroll - Admin only
router.get(
    "/employee/:employeeId",
    authMiddleware,
    roleMiddleware("admin"),
    getEmployeePayroll
);

// Update payment status - Admin only
router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updatePaymentStatus
);

module.exports = router;