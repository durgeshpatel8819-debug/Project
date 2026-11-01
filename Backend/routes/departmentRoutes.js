const express = require("express");

const {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    changeDepartmentHead,
    deleteDepartment
} = require("../controllers/departmentController");

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const router =
    express.Router();


router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin", "hr"),
    createDepartment
);


router.get(
    "/",
    authMiddleware,
    roleMiddleware(
        "admin",
        "hr",
        "employee"
    ),
    getAllDepartments
);


router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "admin",
        "hr",
        "employee"
    ),
    getDepartmentById
);


router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "hr"),
    updateDepartment
);


router.put(
    "/:id/head",
    authMiddleware,
    roleMiddleware("admin", "hr"),
    changeDepartmentHead
);


router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteDepartment
);


module.exports = router;