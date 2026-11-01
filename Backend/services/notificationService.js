const Notification =
    require("../models/Notification");


/* =========================
   CREATE ONE
========================= */

const createNotification = async ({
    userId,
    title,
    message,
    type = "System",
    priority = "Normal",
    actionUrl = "",
    relatedId = null,
    relatedModel = ""
}) => {

    try {

        const notification =
            await Notification.create({

                userId,

                title,

                message,

                type,

                priority,

                actionUrl,

                relatedId,

                relatedModel

            });


        console.log(
            "Notification Created:",
            notification.title
        );


        return notification;


    } catch (error) {

        console.error(
            "Create Notification Error:",
            error
        );


        return null;

    }

};


/* =========================
   CREATE MANY
========================= */

const createNotifications =
    async (notifications) => {

        try {

            if (
                !Array.isArray(
                    notifications
                ) ||
                notifications.length === 0
            ) {

                console.log(
                    "No notifications to create"
                );

                return [];

            }


            console.log(
                "Creating Notifications:",
                notifications.length
            );


            const createdNotifications =
                await Notification.insertMany(
                    notifications
                );


            console.log(
                "Notifications Created:",
                createdNotifications.length
            );


            return createdNotifications;


        } catch (error) {

            console.error(
                "Create Notifications Error:",
                error
            );


            return [];

        }

    };


module.exports = {

    createNotification,

    createNotifications

};