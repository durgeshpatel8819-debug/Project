const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const User = require("../models/User");

const {
    createNotifications
} = require("../services/notificationService");

const getLoggedInEmployee = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        return null;
    }

    const employee = await Employee.findOne({
        email: user.email
    });

    return employee;
};

// CHECK IN
const checkIn = async (req, res) => {
    try {
        let { employeeId } = req.body;

        // Employee can only check in himself
        if (req.user.role === "employee") {
            const employee = await getLoggedInEmployee(req.user.id);

            if (!employee) {
                return res.status(404).json({
                    message: "Employee profile not found"
                });
            }

            employeeId = employee._id;
        }

        if (!employeeId) {
            return res.status(400).json({
                message: "Employee ID is required"
            });
        }

        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (existingAttendance) {
            return res.status(400).json({
                message: "Attendance already marked for today"
            });
        }

        const attendance = await Attendance.create({
            employee: employeeId,
            date: today,
            checkIn: today,
            status: "Present"
        });

        const adminHrUsers = await User.find({
            role: {
                $in: ["admin", "hr"]
            }
        });

        const notifications = adminHrUsers.map((user) => {
            return {
                userId: user._id,
                title: "Attendance Marked",
                message: `${employee.name} marked attendance as Present.`,
                type: "Attendance",
                priority: "Normal",
                actionUrl: "/attendance.html",
                relatedId: attendance._id,
                relatedModel: "Attendance"
            };
        });

        await createNotifications(notifications);

        res.status(201).json({
            message: "Check-in successful",
            attendance
        });

    } catch (error) {
        console.log("Check-In Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// CHECK OUT
const checkOut = async (req, res) => {
    try {
        let { employeeId } = req.body;

        // Employee can only check out himself
        if (req.user.role === "employee") {
            const employee = await getLoggedInEmployee(req.user.id);

            if (!employee) {
                return res.status(404).json({
                    message: "Employee profile not found"
                });
            }

            employeeId = employee._id;
        }

        if (!employeeId) {
            return res.status(400).json({
                message: "Employee ID is required"
            });
        }

        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const attendance = await Attendance.findOne({
            employee: employeeId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (!attendance) {
            return res.status(404).json({
                message: "No check-in record found for today"
            });
        }

        if (attendance.checkOut) {
            return res.status(400).json({
                message: "Employee already checked out"
            });
        }

        attendance.checkOut = today;

        await attendance.save();

        const adminHrUsers = await User.find({
            role: {
                $in: ["admin", "hr"]
            }
        });

        const notifications = adminHrUsers.map((user) => {
            return {
                userId: user._id,
                title: "Attendance Checkout",
                message: `${employee.name} checked out from attendance.`,
                type: "Attendance",
                priority: "Normal",
                actionUrl: "/attendance.html",
                relatedId: attendance._id,
                relatedModel: "Attendance"
            };
        });

        await createNotifications(notifications);

        res.status(200).json({
            message: "Check-out successful",
            attendance
        });

    } catch (error) {
        console.log("Check-Out Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// ADMIN / HR - GET ALL ATTENDANCE
const getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate(
                "employee",
                "name email department designation"
            )
            .sort({
                date: -1
            });

        res.status(200).json({
            count: attendance.length,
            attendance
        });

    } catch (error) {
        console.log("Get Attendance Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// EMPLOYEE - GET OWN ATTENDANCE
const getMyAttendance = async (req, res) => {
    try {
        const employee = await getLoggedInEmployee(req.user.id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        const attendance = await Attendance.find({
            employee: employee._id
        })
            .populate(
                "employee",
                "name email department designation"
            )
            .sort({
                date: -1
            });

        res.status(200).json({
            count: attendance.length,
            attendance
        });

    } catch (error) {
        console.log("Get My Attendance Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// ADMIN / HR - GET SPECIFIC EMPLOYEE ATTENDANCE
const getEmployeeAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({
            employee: req.params.employeeId
        })
            .populate(
                "employee",
                "name email department designation"
            )
            .sort({
                date: -1
            });

        res.status(200).json({
            count: attendance.length,
            attendance
        });

    } catch (error) {
        console.log(
            "Get Employee Attendance Error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    checkIn,
    checkOut,
    getAttendance,
    getMyAttendance,
    getEmployeeAttendance
};