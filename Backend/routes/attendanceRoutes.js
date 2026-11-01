const express = require("express");

const {
    checkIn,
    checkOut,
    getAttendance,
    getMyAttendance,
    getEmployeeAttendance
} = require("../controllers/attendanceController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// CHECK-IN
// Admin, HR and Employee
router.post(
    "/check-in",
    authMiddleware,
    checkIn
);

// CHECK-OUT
// Admin, HR and Employee
router.post(
    "/check-out",
    authMiddleware,
    checkOut
);

// GET ALL ATTENDANCE
// Admin and HR only
router.get(
    "/",
    authMiddleware,
    (req, res, next) => {

        if (
            req.user.role !== "admin" &&
            req.user.role !== "hr"
        ) {
            return res.status(403).json({
                message: "Access denied. Admin or HR only."
            });
        }

        next();
    },
    getAttendance
);

// GET MY ATTENDANCE
// Employee only
router.get(
    "/my",
    authMiddleware,
    (req, res, next) => {

        if (req.user.role !== "employee") {
            return res.status(403).json({
                message: "This endpoint is for employees only."
            });
        }

        next();
    },
    getMyAttendance
);

// GET SPECIFIC EMPLOYEE ATTENDANCE
// Admin and HR only
router.get(
    "/employee/:employeeId",
    authMiddleware,
    (req, res, next) => {

        if (
            req.user.role !== "admin" &&
            req.user.role !== "hr"
        ) {
            return res.status(403).json({
                message: "Access denied. Admin or HR only."
            });
        }

        next();
    },
    getEmployeeAttendance
);

module.exports = router;