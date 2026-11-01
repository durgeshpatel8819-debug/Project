const express = require("express");

const {

    getNotifications,

    getUnreadCount,

    getNotificationById,

    markAsRead,

    markAsUnread,

    markAllAsRead,

    deleteNotification,

    deleteReadNotifications

} = require(
    "../controllers/notificationController"
);


const authMiddleware =
    require(
        "../middleware/authMiddleware"
    );


const router =
    express.Router();


/* =========================
   GET
========================= */

router.get(
    "/",
    authMiddleware,
    getNotifications
);


router.get(
    "/unread-count",
    authMiddleware,
    getUnreadCount
);


/* =========================
   IMPORTANT:
   read-all MUST COME BEFORE /:id
========================= */

router.put(
    "/read-all",
    authMiddleware,
    markAllAsRead
);


router.put(
    "/:id/read",
    authMiddleware,
    markAsRead
);


router.put(
    "/:id/unread",
    authMiddleware,
    markAsUnread
);


/* =========================
   DELETE READ
   MUST COME BEFORE /:id
========================= */

router.delete(
    "/read",
    authMiddleware,
    deleteReadNotifications
);


router.delete(
    "/:id",
    authMiddleware,
    deleteNotification
);


/* =========================
   GET SINGLE
========================= */

router.get(
    "/:id",
    authMiddleware,
    getNotificationById
);


module.exports = router;