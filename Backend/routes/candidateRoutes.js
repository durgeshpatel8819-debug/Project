const express = require("express");

const {
    createCandidate,
    getAllCandidates,
    getCandidateById,
    updateCandidateStatus,
    deleteCandidate
} = require("../controllers/candidateController");

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const upload =
    require("../middleware/uploadMiddleware");

const router =
    express.Router();


router.post(
    "/",
    authMiddleware,
    roleMiddleware(
        "admin",
        "hr"
    ),
    upload.single("resume"),
    createCandidate
);


router.get(
    "/",
    authMiddleware,
    roleMiddleware(
        "admin",
        "hr",
        "employee"
    ),
    getAllCandidates
);


router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "admin",
        "hr",
        "employee"
    ),
    getCandidateById
);


router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware(
        "admin",
        "hr"
    ),
    updateCandidateStatus
);


router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "admin"
    ),
    deleteCandidate
);


module.exports = router;