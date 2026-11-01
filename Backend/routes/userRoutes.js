
const express = require("express");

const router = express.Router();


const authMiddleware =
    require("../middleware/authMiddleware");


const {
    getMyProfile,
    updateMyProfile,
    changePassword
} = require("../controllers/userController");



// Get Profile

router.get(
    "/profile",
    authMiddleware,
    getMyProfile
);



// Update Profile

router.put(
    "/profile",
    authMiddleware,
    updateMyProfile
);



// Change Password

router.put(
    "/change-password",
    authMiddleware,
    changePassword
);


module.exports = router;

