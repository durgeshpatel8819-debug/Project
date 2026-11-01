const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createLeave,
    getAllLeaves,
    getMyLeaves,
    approveLeave,
    rejectLeave,
    getEmployeeLeaves
} = require("../controllers/leaveController");


// Employee + Admin: Apply Leave
router.post(
    "/create",
    authMiddleware,
    roleMiddleware("employee", "admin"),
    createLeave
);


// Employee: View Own Leaves
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("employee"),
    getMyLeaves
);


// Admin: View All Leaves
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllLeaves
);


// Admin: Approve Leave
router.put(
    "/:id/approve",
    authMiddleware,
    roleMiddleware("admin"),
    approveLeave
);


// Admin: Reject Leave
router.put(
    "/:id/reject",
    authMiddleware,
    roleMiddleware("admin"),
    rejectLeave
);


// Admin: View Employee-wise Leaves
router.get(
    "/employee/:employeeId",
    authMiddleware,
    roleMiddleware("admin"),
    getEmployeeLeaves
);


module.exports = router;