const Department = require("../models/Department");
const Employee = require("../models/Employee");

const createDepartment = async (req, res) => {
    try {
        const {
            name,
            description
        } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Department name is required"
            });
        }

        const existingDepartment =
            await Department.findOne({
                name: name.trim()
            });

        if (existingDepartment) {
            return res.status(400).json({
                message: "Department already exists"
            });
        }

        const department =
            await Department.create({
                name: name.trim(),
                description: description || "",
                status: "Active",
                head: null
            });

        res.status(201).json({
            message:
                "Department created successfully",
            department
        });

    } catch (error) {
        console.error(
            "Create Department Error:",
            error
        );

        res.status(500).json({
            message:
                "Error creating department",
            error: error.message
        });
    }
};


const getAllDepartments = async (req, res) => {
    try {
        const departments =
            await Department.find()
                .populate(
                    "head",
                    "name email designation department"
                )
                .sort({
                    createdAt: -1
                });

        const departmentsWithStats =
            await Promise.all(
                departments.map(
                    async department => {

                        const employees =
                            await Employee.find({
                                department:
                                    department.name
                            });

                        const employeeCount =
                            employees.length;

                        const totalSalary =
                            employees.reduce(
                                (
                                    total,
                                    employee
                                ) => {
                                    return (
                                        total +
                                        Number(
                                            employee.salary || 0
                                        )
                                    );
                                },
                                0
                            );

                        return {
                            ...department.toObject(),
                            employeeCount,
                            totalSalary
                        };
                    }
                )
            );

        res.status(200).json({
            count:
                departmentsWithStats.length,
            departments:
                departmentsWithStats
        });

    } catch (error) {
        console.error(
            "Get Departments Error:",
            error
        );

        res.status(500).json({
            message:
                "Error fetching departments",
            error: error.message
        });
    }
};


const getDepartmentById = async (
    req,
    res
) => {
    try {

        const department =
            await Department.findById(
                req.params.id
            ).populate(
                "head",
                "name email designation department"
            );

        if (!department) {
            return res.status(404).json({
                message:
                    "Department not found"
            });
        }

        const employees =
            await Employee.find({
                department:
                    department.name
            });

        const employeeCount =
            employees.length;

        const totalSalary =
            employees.reduce(
                (
                    total,
                    employee
                ) => {
                    return (
                        total +
                        Number(
                            employee.salary || 0
                        )
                    );
                },
                0
            );

        res.status(200).json({
            department,
            employeeCount,
            totalSalary,
            employees
        });

    } catch (error) {
        console.error(
            "Get Department Error:",
            error
        );

        res.status(500).json({
            message:
                "Error fetching department",
            error: error.message
        });
    }
};


const updateDepartment = async (
    req,
    res
) => {
    try {

        const {
            name,
            description,
            status
        } = req.body;

        const department =
            await Department.findById(
                req.params.id
            );

        if (!department) {
            return res.status(404).json({
                message:
                    "Department not found"
            });
        }

        const oldName =
            department.name;

        if (name) {

            const newName =
                name.trim();

            const existingDepartment =
                await Department.findOne({
                    name: newName,
                    _id: {
                        $ne:
                            req.params.id
                    }
                });

            if (existingDepartment) {
                return res.status(400).json({
                    message:
                        "Department name already exists"
                });
            }

            department.name =
                newName;

            if (oldName !== newName) {

                await Employee.updateMany(
                    {
                        department:
                            oldName
                    },
                    {
                        $set: {
                            department:
                                newName
                        }
                    }
                );
            }
        }

        if (description !== undefined) {
            department.description =
                description;
        }

        if (status) {
            department.status =
                status;
        }

        await department.save();

        res.status(200).json({
            message:
                "Department updated successfully",
            department
        });

    } catch (error) {
        console.error(
            "Update Department Error:",
            error
        );

        res.status(500).json({
            message:
                "Error updating department",
            error: error.message
        });
    }
};


const changeDepartmentHead = async (
    req,
    res
) => {
    try {

        const {
            head
        } = req.body;

        const department =
            await Department.findById(
                req.params.id
            );

        if (!department) {
            return res.status(404).json({
                message:
                    "Department not found"
            });
        }

        if (!head) {

            department.head = null;

            await department.save();

            return res.status(200).json({
                message:
                    "Department head removed successfully",
                department
            });
        }

        const employee =
            await Employee.findById(head);

        if (!employee) {
            return res.status(404).json({
                message:
                    "Employee not found"
            });
        }

        if (
            employee.department !==
            department.name
        ) {
            return res.status(400).json({
                message:
                    "Department head must belong to this department"
            });
        }

        department.head =
            employee._id;

        await department.save();

        const updatedDepartment =
            await Department.findById(
                department._id
            ).populate(
                "head",
                "name email designation department"
            );

        res.status(200).json({
            message:
                "Department head updated successfully",
            department:
                updatedDepartment
        });

    } catch (error) {
        console.error(
            "Change Department Head Error:",
            error
        );

        res.status(500).json({
            message:
                "Error changing department head",
            error: error.message
        });
    }
};


const deleteDepartment = async (
    req,
    res
) => {
    try {

        const department =
            await Department.findById(
                req.params.id
            );

        if (!department) {
            return res.status(404).json({
                message:
                    "Department not found"
            });
        }

        const employeeCount =
            await Employee.countDocuments({
                department:
                    department.name
            });

        if (employeeCount > 0) {
            return res.status(400).json({
                message:
                    "Cannot delete department because employees are assigned to it"
            });
        }

        await Department.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            message:
                "Department deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete Department Error:",
            error
        );

        res.status(500).json({
            message:
                "Error deleting department",
            error: error.message
        });
    }
};


module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    changeDepartmentHead,
    deleteDepartment
};