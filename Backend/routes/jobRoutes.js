const express = require("express");

const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob
} = require("../controllers/jobController");

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const router =
    express.Router();


/* =========================
   CREATE JOB
   ADMIN + HR
========================= */

router.post(
    "/",
    authMiddleware,
    roleMiddleware(
        "admin",
        "hr"
    ),
    createJob
);


/* =========================
   GET ALL JOBS
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
    getJobs
);


/* =========================
   GET SINGLE JOB
========================= */

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "admin",
        "hr",
        "employee"
    ),
    getJobById
);


/* =========================
   UPDATE JOB
   ADMIN + HR
========================= */

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "admin",
        "hr"
    ),
    updateJob
);


/* =========================
   DELETE JOB
   ADMIN ONLY
========================= */

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteJob
);


module.exports = router;