const express = require("express");

const {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const router =
    express.Router();


/* =========================
   CREATE EMPLOYEE
   ADMIN ONLY
========================= */

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createEmployee
);


/* =========================
   GET ALL EMPLOYEES
   ADMIN + HR + EMPLOYEE
========================= */

router.get(
    "/",
    authMiddleware,
    roleMiddleware(
        "admin",
        "hr",
        "employee"
    ),
    getEmployees
);


/* =========================
   GET SINGLE EMPLOYEE
   ADMIN + HR + EMPLOYEE
========================= */

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "admin",
        "hr",
        "employee"
    ),
    getEmployeeById
);


/* =========================
   UPDATE EMPLOYEE
   ADMIN ONLY
========================= */

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateEmployee
);


/* =========================
   DELETE EMPLOYEE
   ADMIN ONLY
========================= */

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteEmployee
);


module.exports = router;