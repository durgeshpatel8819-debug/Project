const NOTIFICATION_API =
    "http://localhost:5000/api/notifications";


let allNotifications = [];

let filteredNotifications = [];

let currentPage = 1;

const pageSize = 5;


const notificationToken =
    localStorage.getItem("token");


if (!notificationToken) {

    window.location.href =
        "login.html";

}


/* =========================
   HEADERS
========================= */

function notificationHeaders() {

    return {

        "Authorization":
            `Bearer ${notificationToken}`,

        "Content-Type":
            "application/json"

    };

}


/* =========================
   READ STATUS
========================= */

function isNotificationRead(
    notification
) {

    return (

        notification.isRead === true ||

        notification.isRead === "true" ||

        notification.isRead === 1 ||

        notification.isRead === "1"

    );

}


/* =========================
   MESSAGE
========================= */

function showNotificationMessage(
    message,
    type = "success"
) {

    const box =
        document.getElementById(
            "message"
        );


    if (!box) return;


    box.textContent =
        message;


    box.style.display =
        "block";


    if (type === "error") {

        box.style.background =
            "rgba(220,38,38,0.12)";

        box.style.color =
            "var(--danger)";

    } else {

        box.style.background =
            "rgba(22,163,74,0.12)";

        box.style.color =
            "var(--success)";

    }


    setTimeout(() => {

        box.style.display =
            "none";

    }, 3000);

}


/* =========================
   LOAD
========================= */

async function loadNotifications(
    page = 1
) {

    currentPage = page;


    const loading =
        document.getElementById(
            "loadingState"
        );


    const empty =
        document.getElementById(
            "emptyState"
        );


    const list =
        document.getElementById(
            "notificationList"
        );


    if (loading) {

        loading.style.display =
            "block";

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    if (list) {

        list.innerHTML =
            "";

    }


    try {

        const response =
            await fetch(
                `${NOTIFICATION_API}?page=1&limit=100`,
                {
                    method: "GET",

                    headers:
                        notificationHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load notifications"
            );

        }


        allNotifications =
            Array.isArray(
                data
            )
                ? data
                : (
                    data.notifications ||
                    data.data ||
                    []
                );


        applyFilters();


    } catch (error) {

        if (loading) {

            loading.style.display =
                "none";

        }


        showNotificationMessage(

            error.message ||
            "Server connection error",

            "error"

        );

    }

}


/* =========================
   FILTER
========================= */

function applyFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const typeFilter =
        document.getElementById(
            "typeFilter"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const type =
        typeFilter
            ? typeFilter.value
            : "all";


    const status =
        statusFilter
            ? statusFilter.value
            : "all";


    filteredNotifications =
        allNotifications.filter(
            notification => {

                const title =
                    String(
                        notification.title ||
                        ""
                    )
                    .toLowerCase();


                const message =
                    String(
                        notification.message ||
                        ""
                    )
                    .toLowerCase();


                const notificationType =
                    String(
                        notification.type ||
                        ""
                    );


                const matchesSearch =
                    !search ||

                    title.includes(
                        search
                    ) ||

                    message.includes(
                        search
                    ) ||

                    notificationType
                        .toLowerCase()
                        .includes(search);


                const matchesType =
                    type === "all" ||
                    notificationType === type;


                let matchesStatus =
                    true;


                if (
                    status === "unread"
                ) {

                    matchesStatus =
                        !isNotificationRead(
                            notification
                        );

                }


                if (
                    status === "read"
                ) {

                    matchesStatus =
                        isNotificationRead(
                            notification
                        );

                }


                return (

                    matchesSearch &&

                    matchesType &&

                    matchesStatus

                );

            }
        );


    filteredNotifications.sort(
        (a, b) =>

            new Date(
                b.createdAt
            ) -

            new Date(
                a.createdAt
            )
    );


    currentPage = 1;


    updateStats();

    renderNotifications();

}


/* =========================
   STATS
========================= */

function updateStats() {

    const total =
        allNotifications.length;


    const unread =
        allNotifications.filter(
            notification =>
                !isNotificationRead(
                    notification
                )
        ).length;


    const read =
        total - unread;


    const totalElement =
        document.getElementById(
            "totalNotifications"
        );


    const unreadElement =
        document.getElementById(
            "unreadNotifications"
        );


    const readElement =
        document.getElementById(
            "readNotifications"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (unreadElement) {

        unreadElement.textContent =
            unread;

    }


    if (readElement) {

        readElement.textContent =
            read;

    }


    const resultText =
        document.getElementById(
            "resultText"
        );


    if (resultText) {

        resultText.textContent =
            `${filteredNotifications.length} notification${
                filteredNotifications.length !== 1
                    ? "s"
                    : ""
            }`;

    }

}


/* =========================
   RENDER
========================= */

function renderNotifications() {

    const loading =
        document.getElementById(
            "loadingState"
        );


    const empty =
        document.getElementById(
            "emptyState"
        );


    const list =
        document.getElementById(
            "notificationList"
        );


    if (loading) {

        loading.style.display =
            "none";

    }


    if (!list) return;


    if (
        filteredNotifications.length === 0
    ) {

        list.innerHTML =
            "";


        if (empty) {

            empty.style.display =
                "block";

        }


        renderPagination();

        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    const totalPages =
        Math.ceil(
            filteredNotifications.length /
            pageSize
        );


    if (
        currentPage > totalPages
    ) {

        currentPage =
            totalPages;

    }


    const start =
        (currentPage - 1) *
        pageSize;


    const pageNotifications =
        filteredNotifications.slice(
            start,
            start + pageSize
        );


    list.innerHTML =
        pageNotifications
            .map(
                notification =>
                    createNotificationHTML(
                        notification
                    )
            )
            .join("");


    renderPagination();

}


/* =========================
   CARD
========================= */

function createNotificationHTML(
    notification
) {

    const id =
        notification._id;


    const isRead =
        isNotificationRead(
            notification
        );


    const type =
        notification.type ||
        "System";


    const priority =
        notification.priority ||
        "Normal";


    const title =
        escapeHTML(
            notification.title ||
            "Notification"
        );


    const message =
        escapeHTML(
            notification.message ||
            ""
        );


    const date =
        notification.createdAt
            ? new Date(
                notification.createdAt
            ).toLocaleString()
            : "-";


    const timeAgo =
        getTimeAgo(
            notification.createdAt
        );


    return `

        <div
            class="notification-item ${
                isRead
                    ? "read"
                    : "unread"
            }"
            onclick="
                openNotificationFromCard(
                    event,
                    '${id}'
                )
            "
        >

            <div class="notification-icon">

                ${getNotificationIcon(type)}

            </div>


            <div class="notification-content">


                <div class="notification-title-row">

                    <h3 class="notification-title">

                        ${title}

                    </h3>


                    <span
                        class="notification-time"
                        title="${date}"
                    >

                        ${timeAgo}

                    </span>

                </div>


                <div class="notification-message">

                    ${message}

                </div>


                <div class="notification-meta">

                    <span class="notification-type">

                        ${escapeHTML(type)}

                    </span>


                    <span class="notification-priority">

                        ${escapeHTML(priority)}

                    </span>


                    <span
                        class="notification-status ${
                            isRead
                                ? "read"
                                : "unread"
                        }"
                    >

                        ${
                            isRead
                                ? "Read"
                                : "Unread"
                        }

                    </span>

                </div>

            </div>


            <div class="notification-actions">


                <button
                    type="button"
                    class="notification-action-btn"
                    title="Open notification"
                    onclick="
                        viewNotification(
                            event,
                            '${id}'
                        )
                    "
                >
                    👁
                </button>


                ${
                    isRead
                        ? `
                            <button
                                type="button"
                                class="notification-action-btn"
                                title="Mark as unread"
                                onclick="
                                    markAsUnread(
                                        event,
                                        '${id}'
                                    )
                                "
                            >
                                🔵
                            </button>
                        `
                        : ""
                }


                <button
                    type="button"
                    class="notification-action-btn delete"
                    title="Delete"
                    onclick="
                        deleteNotification(
                            event,
                            '${id}'
                        )
                    "
                >
                    🗑
                </button>


            </div>

        </div>

    `;

}


/* =========================
   CARD OPEN
========================= */

function openNotificationFromCard(
    event,
    id
) {

    if (
        event &&
        event.target.closest("button")
    ) {

        return;

    }


    viewNotification(
        event,
        id
    );

}


/* =========================
   ICON
========================= */

function getNotificationIcon(
    type
) {

    const icons = {

        Recruitment: "👤",

        Interview: "📅",

        Leave: "🏖️",

        Payroll: "💰",

        Employee: "👨‍💼",

        Department: "🏢",

        Attendance: "🕘",

        Performance: "📈",

        System: "🔔"

    };


    return icons[type] ||
        "🔔";

}


/* =========================
   VIEW
   AUTO READ
========================= */

async function viewNotification(
    event,
    id
) {

    if (event) {

        event.stopPropagation();

    }


    const notification =
        allNotifications.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!notification) {

        return;

    }


    /* =========================
       AUTO READ
    ========================= */

    if (
        !isNotificationRead(
            notification
        )
    ) {

        try {

            const response =
                await fetch(
                    `${NOTIFICATION_API}/${id}/read`,
                    {
                        method: "PUT",

                        headers:
                            notificationHeaders()
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to mark as read"
                );

            }


            /*
             * IMPORTANT:
             * Use backend response
             */

            if (
                data.notification
            ) {

                Object.assign(
                    notification,
                    data.notification
                );

            } else {

                notification.isRead =
                    true;

                notification.readAt =
                    new Date().toISOString();

            }


            updateStats();


            /*
             * Re-render card without
             * closing modal
             */

            renderNotifications();


        } catch (error) {

            console.error(
                "Auto Read Error:",
                error
            );


            showNotificationMessage(

                error.message ||
                "Unable to mark as read",

                "error"

            );


            return;

        }

    }


    /* =========================
       MODAL
    ========================= */

    const modalType =
        document.getElementById(
            "modalType"
        );


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const modalMessage =
        document.getElementById(
            "modalMessage"
        );


    const modalPriority =
        document.getElementById(
            "modalPriority"
        );


    const modalStatus =
        document.getElementById(
            "modalStatus"
        );


    const modalDate =
        document.getElementById(
            "modalDate"
        );


    if (modalType) {

        modalType.textContent =
            notification.type ||
            "System";

    }


    if (modalTitle) {

        modalTitle.textContent =
            notification.title ||
            "-";

    }


    if (modalMessage) {

        modalMessage.textContent =
            notification.message ||
            "-";

    }


    if (modalPriority) {

        modalPriority.textContent =
            notification.priority ||
            "Normal";

    }


    if (modalStatus) {

        modalStatus.textContent =
            "Read";

    }


    if (modalDate) {

        modalDate.textContent =
            notification.createdAt
                ? new Date(
                    notification.createdAt
                ).toLocaleString()
                : "-";

    }


    const modal =
        document.getElementById(
            "notificationModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


/* =========================
   MARK UNREAD
========================= */

async function markAsUnread(
    event,
    id
) {

    if (event) {

        event.stopPropagation();

    }


    try {

        const response =
            await fetch(
                `${NOTIFICATION_API}/${id}/unread`,
                {
                    method: "PUT",

                    headers:
                        notificationHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to mark as unread"
            );

        }


        const notification =
            allNotifications.find(
                item =>
                    String(item._id) ===
                    String(id)
            );


        if (notification) {

            if (
                data.notification
            ) {

                Object.assign(
                    notification,
                    data.notification
                );

            } else {

                notification.isRead =
                    false;

                notification.readAt =
                    null;

            }

        }


        applyFilters();


        showNotificationMessage(
            "Notification marked as unread"
        );


    } catch (error) {

        showNotificationMessage(

            error.message ||
            "Unable to mark as unread",

            "error"

        );

    }

}


/* =========================
   MARK ALL READ
========================= */

async function markAllAsRead() {

    try {

        const response =
            await fetch(
                `${NOTIFICATION_API}/read-all`,
                {
                    method: "PUT",

                    headers:
                        notificationHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to mark all as read"
            );

        }


        /*
         * Update local data
         */

        allNotifications =
            allNotifications.map(
                notification => ({

                    ...notification,

                    isRead: true,

                    readAt:
                        new Date().toISOString()

                })
            );


        applyFilters();


        showNotificationMessage(
            "All notifications marked as read"
        );


    } catch (error) {

        showNotificationMessage(

            error.message ||
            "Unable to mark all as read",

            "error"

        );

    }

}


/* =========================
   DELETE
========================= */

async function deleteNotification(
    event,
    id
) {

    if (event) {

        event.stopPropagation();

    }


    if (
        !confirm(
            "Delete this notification?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${NOTIFICATION_API}/${id}`,
                {
                    method: "DELETE",

                    headers:
                        notificationHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete notification"
            );

        }


        allNotifications =
            allNotifications.filter(
                notification =>
                    String(
                        notification._id
                    ) !==
                    String(id)
            );


        applyFilters();


        showNotificationMessage(
            "Notification deleted"
        );


    } catch (error) {

        showNotificationMessage(

            error.message ||
            "Unable to delete notification",

            "error"

        );

    }

}


/* =========================
   DELETE READ
========================= */

async function deleteReadNotifications() {

    if (
        !confirm(
            "Delete all read notifications?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${NOTIFICATION_API}/read`,
                {
                    method: "DELETE",

                    headers:
                        notificationHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete read notifications"
            );

        }


        allNotifications =
            allNotifications.filter(
                notification =>
                    !isNotificationRead(
                        notification
                    )
            );


        applyFilters();


        showNotificationMessage(
            "Read notifications deleted"
        );


    } catch (error) {

        showNotificationMessage(

            error.message ||
            "Unable to delete read notifications",

            "error"

        );

    }

}


/* =========================
   CLOSE MODAL
========================= */

function closeNotificationModal() {

    const modal =
        document.getElementById(
            "notificationModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =========================
   SEARCH
========================= */

function clearSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) return;


    input.value =
        "";


    const button =
        document.getElementById(
            "clearSearch"
        );


    if (button) {

        button.style.display =
            "none";

    }


    applyFilters();

}


/* =========================
   RESET
========================= */

function resetFilters() {

    const search =
        document.getElementById(
            "searchInput"
        );


    const type =
        document.getElementById(
            "typeFilter"
        );


    const status =
        document.getElementById(
            "statusFilter"
        );


    if (search) {

        search.value =
            "";

    }


    if (type) {

        type.value =
            "all";

    }


    if (status) {

        status.value =
            "all";

    }


    const button =
        document.getElementById(
            "clearSearch"
        );


    if (button) {

        button.style.display =
            "none";

    }


    applyFilters();

}


/* =========================
   PAGINATION
========================= */

function renderPagination() {

    const pagination =
        document.getElementById(
            "pagination"
        );


    if (!pagination) return;


    const totalPages =
        Math.ceil(
            filteredNotifications.length /
            pageSize
        );


    if (totalPages <= 1) {

        pagination.innerHTML =
            "";

        return;

    }


    let html =
        "";


    html += `

        <button
            class="page-btn"
            ${
                currentPage === 1
                    ? "disabled"
                    : ""
            }
            onclick="
                changePage(
                    ${currentPage - 1}
                )
            "
        >
            ‹
        </button>

    `;


    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        html += `

            <button
                class="page-btn ${
                    i === currentPage
                        ? "active"
                        : ""
                }"
                onclick="
                    changePage(${i})
                "
            >
                ${i}
            </button>

        `;

    }


    html += `

        <button
            class="page-btn"
            ${
                currentPage === totalPages
                    ? "disabled"
                    : ""
            }
            onclick="
                changePage(
                    ${currentPage + 1}
                )
            "
        >
            ›
        </button>

    `;


    pagination.innerHTML =
        html;

}


/* =========================
   CHANGE PAGE
========================= */

function changePage(
    page
) {

    const totalPages =
        Math.ceil(
            filteredNotifications.length /
            pageSize
        );


    if (
        page < 1 ||
        page > totalPages
    ) {

        return;

    }


    currentPage =
        page;


    renderNotifications();

}


/* =========================
   TIME AGO
========================= */

function getTimeAgo(
    dateValue
) {

    if (!dateValue) {

        return "";

    }


    const date =
        new Date(
            dateValue
        );


    const now =
        new Date();


    const seconds =
        Math.floor(
            (now - date) /
            1000
        );


    if (seconds < 60) {

        return "Just now";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {

        return `${minutes}m ago`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return `${hours}h ago`;

    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days < 30) {

        return `${days}d ago`;

    }


    return date.toLocaleDateString();

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================
   DOM READY
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        const searchInput =
            document.getElementById(
                "searchInput"
            );


        const typeFilter =
            document.getElementById(
                "typeFilter"
            );


        const statusFilter =
            document.getElementById(
                "statusFilter"
            );


        const clearButton =
            document.getElementById(
                "clearSearch"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                () => {

                    if (clearButton) {

                        clearButton.style.display =
                            searchInput.value
                                ? "block"
                                : "none";

                    }


                    applyFilters();

                }
            );

        }


        if (typeFilter) {

            typeFilter.addEventListener(
                "change",
                applyFilters
            );

        }


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                applyFilters
            );

        }


        const modal =
            document.getElementById(
                "notificationModal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeNotificationModal();

                    }

                }
            );

        }


        loadNotifications(1);

    }
);