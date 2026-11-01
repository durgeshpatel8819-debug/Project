const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const User = require("../models/User");

const {
    createNotifications
} = require("../services/notificationService");


// Create Payroll
const createPayroll = async (req, res) => {
    try {

        const {
            employeeId,
            month,
            basicSalary,
            allowances,
            deductions
        } = req.body;


        const netSalary =
            Number(basicSalary) +
            Number(allowances || 0) -
            Number(deductions || 0);


        const payroll =
            await Payroll.create({
                employeeId,
                month,
                basicSalary,
                allowances,
                deductions,
                netSalary
            });


        console.log(
            "Payroll Created:",
            payroll._id
        );


        // Find employee
        const employee =
            await Employee.findById(
                employeeId
            );


        // Find employee user
        if (employee) {

            const employeeUser =
                await User.findOne({
                    email: employee.email
                });


            if (employeeUser) {

                await createNotifications([
                    {
                        userId:
                            employeeUser._id,

                        title:
                            "Payroll Generated",

                        message:
                            `Your payroll for ${month} has been generated. Net salary: ₹${netSalary}.`,

                        type:
                            "Payroll",

                        priority:
                            "Normal",

                        actionUrl:
                            "/payroll.html",

                        relatedId:
                            payroll._id,

                        relatedModel:
                            "Payroll"
                    }
                ]);


                console.log(
                    "Payroll Notification Created"
                );

            } else {

                console.log(
                    "Employee user not found:",
                    employee.email
                );

            }

        }


        res.status(201).json({
            message:
                "Payroll created successfully",
            payroll
        });


    } catch (error) {

        console.log(
            "Create Payroll Error:",
            error.message
        );

        res.status(500).json({
            message:
                "Error creating payroll",
            error: error.message
        });
    }
};


// Get All Payrolls
const getAllPayrolls = async (req, res) => {
    try {

        const payrolls =
            await Payroll.find()
                .populate("employeeId");


        res.status(200).json({
            count:
                payrolls.length,
            payrolls
        });


    } catch (error) {

        res.status(500).json({
            message:
                "Error fetching payrolls",
            error: error.message
        });
    }
};


// Get Employee Payroll
const getEmployeePayroll = async (req, res) => {
    try {

        const payrolls =
            await Payroll.find({
                employeeId:
                    req.params.employeeId
            }).populate("employeeId");


        res.status(200).json({
            count:
                payrolls.length,
            payrolls
        });


    } catch (error) {

        res.status(500).json({
            message:
                "Error fetching employee payroll",
            error: error.message
        });
    }
};


// Update Payment Status
const updatePaymentStatus = async (req, res) => {
    try {

        const {
            paymentStatus
        } = req.body;


        const existingPayroll =
            await Payroll.findById(
                req.params.id
            );


        if (!existingPayroll) {

            return res.status(404).json({
                message:
                    "Payroll not found"
            });

        }


        const previousStatus =
            existingPayroll.paymentStatus;


        const payroll =
            await Payroll.findByIdAndUpdate(
                req.params.id,
                {
                    paymentStatus,

                    paymentDate:
                        paymentStatus === "Paid"
                            ? new Date()
                            : null
                },
                {
                    new: true
                }
            );


        // Notify employee when salary is paid
        if (
            paymentStatus === "Paid" &&
            previousStatus !== "Paid"
        ) {

            const employee =
                await Employee.findById(
                    payroll.employeeId
                );


            if (employee) {

                const employeeUser =
                    await User.findOne({
                        email:
                            employee.email
                    });


                if (employeeUser) {

                    await createNotifications([
                        {
                            userId:
                                employeeUser._id,

                            title:
                                "Salary Paid",

                            message:
                                `Your salary for ${payroll.month} has been paid. Amount: ₹${payroll.netSalary}.`,

                            type:
                                "Payroll",

                            priority:
                                "High",

                            actionUrl:
                                "/payroll.html",

                            relatedId:
                                payroll._id,

                            relatedModel:
                                "Payroll"
                        }
                    ]);


                    console.log(
                        "Salary Paid Notification Created"
                    );

                }

            }

        }


        res.status(200).json({
            message:
                "Payment status updated successfully",
            payroll
        });


    } catch (error) {

        console.log(
            "Update Payment Status Error:",
            error.message
        );

        res.status(500).json({
            message:
                "Error updating payment status",
            error: error.message
        });
    }
};


module.exports = {
    createPayroll,
    getAllPayrolls,
    getEmployeePayroll,
    updatePaymentStatus
};