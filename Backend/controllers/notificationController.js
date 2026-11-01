const Notification = require("../models/Notification");


/* =========================
   GET NOTIFICATIONS
========================= */

const getNotifications = async (req, res) => {

    try {

        const {
            page = 1,
            limit = 100,
            search = "",
            status = "all",
            type = "all"
        } = req.query;


        const filter = {

            userId: req.user.id

        };


        if (search.trim()) {

            filter.$or = [

                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    message: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];

        }


        if (status === "read") {

            filter.isRead = true;

        }


        if (status === "unread") {

            filter.isRead = false;

        }


        if (type !== "all") {

            filter.type = type;

        }


        const skip =
            (Number(page) - 1) *
            Number(limit);


        const notifications =
            await Notification
                .find(filter)
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(Number(limit));


        const total =
            await Notification.countDocuments(
                filter
            );


        const unreadCount =
            await Notification.countDocuments({

                userId: req.user.id,

                isRead: false

            });


        res.status(200).json({

            success: true,

            notifications,

            pagination: {

                page: Number(page),

                limit: Number(limit),

                total,

                totalPages:
                    Math.ceil(
                        total /
                        Number(limit)
                    )

            },

            unreadCount

        });


    } catch (error) {

        console.log(
            "Get Notifications Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch notifications"

        });

    }

};


/* =========================
   GET UNREAD COUNT
========================= */

const getUnreadCount = async (
    req,
    res
) => {

    try {

        const count =
            await Notification.countDocuments({

                userId: req.user.id,

                isRead: false

            });


        res.status(200).json({

            success: true,

            unreadCount: count

        });


    } catch (error) {

        console.log(
            "Unread Count Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to get unread count"

        });

    }

};


/* =========================
   GET BY ID
========================= */

const getNotificationById = async (
    req,
    res
) => {

    try {

        const notification =
            await Notification.findOne({

                _id: req.params.id,

                userId: req.user.id

            });


        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found"

            });

        }


        res.status(200).json({

            success: true,

            notification

        });


    } catch (error) {

        console.log(
            "Get Notification Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch notification"

        });

    }

};


/* =========================
   MARK AS READ
========================= */

const markAsRead = async (
    req,
    res
) => {

    try {

        const notification =
            await Notification.findOne({

                _id: req.params.id,

                userId: req.user.id

            });


        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found"

            });

        }


        notification.isRead = true;

        notification.readAt =
            new Date();


        await notification.save();


        res.status(200).json({

            success: true,

            message:
                "Notification marked as read",

            notification

        });


    } catch (error) {

        console.log(
            "Mark Read Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to mark notification as read"

        });

    }

};


/* =========================
   MARK AS UNREAD
========================= */

const markAsUnread = async (
    req,
    res
) => {

    try {

        const notification =
            await Notification.findOne({

                _id: req.params.id,

                userId: req.user.id

            });


        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found"

            });

        }


        notification.isRead = false;

        notification.readAt = null;


        await notification.save();


        res.status(200).json({

            success: true,

            message:
                "Notification marked as unread",

            notification

        });


    } catch (error) {

        console.log(
            "Mark Unread Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to mark notification as unread"

        });

    }

};


/* =========================
   MARK ALL AS READ
========================= */

const markAllAsRead = async (
    req,
    res
) => {

    try {

        const result =
            await Notification.updateMany(

                {
                    userId: req.user.id,

                    isRead: false
                },

                {
                    $set: {

                        isRead: true,

                        readAt:
                            new Date()

                    }

                }

            );


        res.status(200).json({

            success: true,

            message:
                "All notifications marked as read",

            modifiedCount:
                result.modifiedCount

        });


    } catch (error) {

        console.log(
            "Mark All Read Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to mark all notifications as read"

        });

    }

};


/* =========================
   DELETE NOTIFICATION
========================= */

const deleteNotification = async (
    req,
    res
) => {

    try {

        const notification =
            await Notification.findOneAndDelete({

                _id: req.params.id,

                userId: req.user.id

            });


        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Notification deleted successfully"

        });


    } catch (error) {

        console.log(
            "Delete Notification Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to delete notification"

        });

    }

};


/* =========================
   DELETE READ
========================= */

const deleteReadNotifications =
    async (
        req,
        res
    ) => {

        try {

            const result =
                await Notification.deleteMany({

                    userId:
                        req.user.id,

                    isRead: true

                });


            res.status(200).json({

                success: true,

                message:
                    "Read notifications deleted successfully",

                deletedCount:
                    result.deletedCount

            });


        } catch (error) {

            console.log(
                "Delete Read Notifications Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to delete read notifications"

            });

        }

    };


module.exports = {

    getNotifications,

    getUnreadCount,

    getNotificationById,

    markAsRead,

    markAsUnread,

    markAllAsRead,

    deleteNotification,

    deleteReadNotifications

};