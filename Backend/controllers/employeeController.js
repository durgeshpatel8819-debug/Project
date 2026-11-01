const Employee = require("../models/Employee");
const User = require("../models/User");

const {
    createNotifications
} = require("../services/notificationService");


/* =========================
   CREATE EMPLOYEE
========================= */

const createEmployee = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            department,
            designation,
            salary,
            joiningDate,
            address
        } = req.body;


        if (
            !name ||
            !email ||
            !phone ||
            !department ||
            !designation ||
            !salary ||
            !joiningDate ||
            !address
        ) {

            return res.status(400).json({
                message:
                    "All employee fields are required"
            });

        }


        const existingEmployee =
            await Employee.findOne({
                email
            });


        if (existingEmployee) {

            return res.status(400).json({
                message:
                    "Employee with this email already exists"
            });

        }


        const employee =
            await Employee.create({

                name,
                email,
                phone,
                department,
                designation,
                salary,
                joiningDate,
                address

            });


        console.log(
            "Employee Created:",
            employee.name
        );


        /* =========================
           FIND HR + ADMIN USERS
        ========================= */

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


        /* =========================
           CREATE NOTIFICATIONS
        ========================= */

        if (hrUsers.length > 0) {

            const notifications =
                hrUsers.map(user => ({

                    userId:
                        user._id,

                    title:
                        "New Employee Added",

                    message:
                        `${employee.name} has been added to the ${employee.department} department.`,

                    type:
                        "Employee",

                    priority:
                        "Normal",

                    actionUrl:
                        "/employees.html",

                    relatedId:
                        employee._id,

                    relatedModel:
                        "Employee"

                }));


            console.log(
                "Creating Employee Notifications:",
                notifications.length
            );


            const createdNotifications =
                await createNotifications(
                    notifications
                );


            console.log(
                "Employee Notifications Created:",
                createdNotifications.length
            );

        } else {

            console.log(
                "No Admin or HR users found"
            );

        }


        res.status(201).json({

            message:
                "Employee created successfully",

            employee

        });


    } catch (error) {

        console.error(
            "Create Employee Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


/* =========================
   GET ALL EMPLOYEES
========================= */

const getEmployees = async (req, res) => {

    try {

        const employees =
            await Employee.find()
                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            count:
                employees.length,

            employees

        });


    } catch (error) {

        console.error(
            "Get Employees Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


/* =========================
   GET EMPLOYEE BY ID
========================= */

const getEmployeeById = async (req, res) => {

    try {

        const employeeId =
            req.params.id;


        if (
            !employeeId.match(
                /^[0-9a-fA-F]{24}$/
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid employee ID"

            });

        }


        const employee =
            await Employee.findById(
                employeeId
            );


        if (!employee) {

            return res.status(404).json({

                message:
                    "Employee not found"

            });

        }


        res.status(200).json({

            employee

        });


    } catch (error) {

        console.error(
            "Get Employee Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


/* =========================
   UPDATE EMPLOYEE
========================= */

const updateEmployee = async (req, res) => {

    try {

        const employeeId =
            req.params.id;


        if (
            !employeeId.match(
                /^[0-9a-fA-F]{24}$/
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid employee ID"

            });

        }


        const employee =
            await Employee.findByIdAndUpdate(

                employeeId,

                req.body,

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!employee) {

            return res.status(404).json({

                message:
                    "Employee not found"

            });

        }


        res.status(200).json({

            message:
                "Employee updated successfully",

            employee

        });


    } catch (error) {

        console.error(
            "Update Employee Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


/* =========================
   DELETE EMPLOYEE
========================= */

const deleteEmployee = async (req, res) => {

    try {

        const employeeId =
            req.params.id;


        if (
            !employeeId.match(
                /^[0-9a-fA-F]{24}$/
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid employee ID"

            });

        }


        const employee =
            await Employee.findByIdAndDelete(
                employeeId
            );


        if (!employee) {

            return res.status(404).json({

                message:
                    "Employee not found"

            });

        }


        res.status(200).json({

            message:
                "Employee deleted successfully"

        });


    } catch (error) {

        console.error(
            "Delete Employee Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


/* =========================
   EXPORT
========================= */

module.exports = {

    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee

};