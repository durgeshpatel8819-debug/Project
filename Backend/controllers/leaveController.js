const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const User = require("../models/User");

const {
    createNotifications
} = require("../services/notificationService");


// Employee + Admin: Create Leave
const createLeave = async (req, res) => {
    try {

        console.log("REQ USER:", req.user);

        const {
            employeeId,
            leaveType,
            startDate,
            endDate,
            reason
        } = req.body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({
                message: "All leave fields are required"
            });
        }

        const user = await User.findById(req.user.id);

        console.log("DB USER:", user);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        let finalEmployeeId = employeeId;


        // Employee login
        if (user.role === "employee") {

            const employee = await Employee.findOne({
                email: user.email
            });

            console.log("EMPLOYEE RECORD:", employee);

            if (!employee) {
                return res.status(404).json({
                    message: "Employee record not found for this user"
                });
            }

            finalEmployeeId = employee._id;
        }


        // Admin must provide employeeId
        if (!finalEmployeeId) {
            return res.status(400).json({
                message: "Employee ID is required"
            });
        }


        const leave = await Leave.create({
            employeeId: finalEmployeeId,
            leaveType,
            startDate,
            endDate,
            reason,
            status: "Pending"
        });


        console.log(
            "Leave Created:",
            leave._id
        );


        // Find employee details
        const employee =
            await Employee.findById(
                finalEmployeeId
            );


        // Notify Admin + HR
        const hrUsers =
            await User.find({
                role: {
                    $in: [
                        "admin",
                        "hr"
                    ]
                }
            }).select("_id");


        console.log(
            "Admin/HR Users Found:",
            hrUsers.length
        );


        if (
            employee &&
            hrUsers.length > 0
        ) {

            const notifications =
                hrUsers.map(user => ({

                    userId:
                        user._id,

                    title:
                        "New Leave Request",

                    message:
                        `${employee.name} has applied for ${leaveType} leave.`,

                    type:
                        "Leave",

                    priority:
                        "Normal",

                    actionUrl:
                        "/leaves.html",

                    relatedId:
                        leave._id,

                    relatedModel:
                        "Leave"

                }));


            console.log(
                "Creating Leave Notifications:",
                notifications.length
            );


            const createdNotifications =
                await createNotifications(
                    notifications
                );


            console.log(
                "Leave Notifications Created:",
                createdNotifications.length
            );
        }


        res.status(201).json({
            message: "Leave applied successfully",
            leave
        });

    } catch (error) {

        console.log(
            "Create Leave Error:",
            error.message
        );

        res.status(500).json({
            message: "Error creating leave",
            error: error.message
        });
    }
};


// Admin: Get All Leaves
const getAllLeaves = async (req, res) => {
    try {

        const leaves = await Leave.find()
            .populate(
                "employeeId",
                "name email department designation"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: leaves.length,
            leaves
        });

    } catch (error) {

        console.log(
            "Get All Leaves Error:",
            error.message
        );

        res.status(500).json({
            message: "Error fetching leaves",
            error: error.message
        });
    }
};


// Employee: Get Own Leaves
const getMyLeaves = async (req, res) => {
    try {

        console.log(
            "MY LEAVES USER:",
            req.user
        );

        const user =
            await User.findById(
                req.user.id
            );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const employee =
            await Employee.findOne({
                email: user.email
            });

        console.log(
            "MY EMPLOYEE RECORD:",
            employee
        );

        if (!employee) {
            return res.status(404).json({
                message:
                    "Employee record not found for this user"
            });
        }

        const leaves =
            await Leave.find({
                employeeId:
                    employee._id
            })
                .populate(
                    "employeeId",
                    "name email department designation"
                )
                .sort({
                    createdAt: -1
                });

        res.status(200).json({
            count: leaves.length,
            leaves
        });

    } catch (error) {

        console.log(
            "Get My Leaves Error:",
            error.message
        );

        res.status(500).json({
            message:
                "Error fetching your leaves",
            error: error.message
        });
    }
};


// Admin: Approve Leave
const approveLeave = async (req, res) => {
    try {

        const leave =
            await Leave.findByIdAndUpdate(
                req.params.id,
                {
                    status: "Approved"
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!leave) {
            return res.status(404).json({
                message:
                    "Leave not found"
            });
        }


        // Find employee
        const employee =
            await Employee.findById(
                leave.employeeId
            );


        if (employee) {

            // Find employee user
            const employeeUser =
                await User.findOne({
                    email:
                        employee.email
                });


            if (employeeUser) {

                await createNotifications(
                    [
                        {
                            userId:
                                employeeUser._id,

                            title:
                                "Leave Approved",

                            message:
                                `Your ${leave.leaveType} leave from ${leave.startDate} to ${leave.endDate} has been approved.`,

                            type:
                                "Leave",

                            priority:
                                "Normal",

                            actionUrl:
                                "/leaves.html",

                            relatedId:
                                leave._id,

                            relatedModel:
                                "Leave"
                        }
                    ]
                );

            }

        }


        res.status(200).json({
            message:
                "Leave approved successfully",
            leave
        });

    } catch (error) {

        console.log(
            "Approve Leave Error:",
            error.message
        );

        res.status(500).json({
            message:
                "Error approving leave",
            error: error.message
        });
    }
};


// Admin: Reject Leave
const rejectLeave = async (req, res) => {
    try {

        const leave =
            await Leave.findByIdAndUpdate(
                req.params.id,
                {
                    status: "Rejected"
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!leave) {
            return res.status(404).json({
                message:
                    "Leave not found"
            });
        }


        // Find employee
        const employee =
            await Employee.findById(
                leave.employeeId
            );


        if (employee) {

            // Find employee user
            const employeeUser =
                await User.findOne({
                    email:
                        employee.email
                });


            if (employeeUser) {

                await createNotifications(
                    [
                        {
                            userId:
                                employeeUser._id,

                            title:
                                "Leave Rejected",

                            message:
                                `Your ${leave.leaveType} leave from ${leave.startDate} to ${leave.endDate} has been rejected.`,

                            type:
                                "Leave",

                            priority:
                                "High",

                            actionUrl:
                                "/leaves.html",

                            relatedId:
                                leave._id,

                            relatedModel:
                                "Leave"
                        }
                    ]
                );

            }

        }


        res.status(200).json({
            message:
                "Leave rejected successfully",
            leave
        });

    } catch (error) {

        console.log(
            "Reject Leave Error:",
            error.message
        );

        res.status(500).json({
            message:
                "Error rejecting leave",
            error: error.message
        });
    }
};


// Admin: Employee-wise Leaves
const getEmployeeLeaves = async (req, res) => {
    try {

        const leaves =
            await Leave.find({
                employeeId:
                    req.params.employeeId
            })
                .populate(
                    "employeeId",
                    "name email department designation"
                )
                .sort({
                    createdAt: -1
                });

        res.status(200).json({
            count: leaves.length,
            leaves
        });

    } catch (error) {

        console.log(
            "Employee Leaves Error:",
            error.message
        );

        res.status(500).json({
            message:
                "Error fetching employee leaves",
            error: error.message
        });
    }
};


module.exports = {

    createLeave,
    getAllLeaves,
    getMyLeaves,
    approveLeave,
    rejectLeave,
    getEmployeeLeaves

};