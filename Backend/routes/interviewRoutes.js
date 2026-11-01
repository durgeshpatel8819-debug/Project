const express = require("express");

const {
    createInterview,
    getAllInterviews,
    getInterviewById,
    updateInterviewStatus,
    updateInterviewResult,
    deleteInterview
} = require("../controllers/interviewController");

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin", "hr"),
    createInterview
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin", "hr", "employee"),
    getAllInterviews
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "hr", "employee"),
    getInterviewById
);

router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin", "hr"),
    updateInterviewStatus
);

router.put(
    "/:id/result",
    authMiddleware,
    roleMiddleware("admin", "hr"),
    updateInterviewResult
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteInterview
);

module.exports = router;