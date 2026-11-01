(function () {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const API_URL = "http://localhost:5000/api/attendance";

    function getUserFromToken() {

        try {

            const payload = JSON.parse(
                atob(
                    token
                        .split(".")[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

            return payload;

        } catch (error) {

            console.log(
                "Token Decode Error:",
                error
            );

            return null;
        }
    }

    const currentUser = getUserFromToken();

    const userRole =
        currentUser
            ? currentUser.role
            : "";

    function showMessage(message, type) {

        const messageBox =
            document.getElementById("message");

        if (!messageBox) {
            return;
        }

        messageBox.textContent = message;

        messageBox.style.color =
            type === "success"
                ? "var(--success)"
                : "var(--danger)";

        setTimeout(function () {

            messageBox.textContent = "";

        }, 3000);
    }

    function formatDate(dateValue) {

        if (!dateValue) {
            return "-";
        }

        const date =
            new Date(dateValue);

        return date.toLocaleDateString(
            "en-US"
        );
    }

    function formatTime(dateValue) {

        if (!dateValue) {
            return "-";
        }

        const date =
            new Date(dateValue);

        return date.toLocaleTimeString(
            "en-US"
        );
    }

    function displayAttendance(records) {

        const table =
            document.getElementById(
                "attendanceTableBody"
            );

        if (!table) {
            return;
        }

        table.innerHTML = "";

        if (
            !records ||
            records.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">
                        No attendance records found
                    </td>
                </tr>
            `;

            return;
        }

        records.forEach(function (record) {

            const employee =
                record.employee;

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>
                    ${employee?.name || "-"}
                </td>

                <td>
                    ${employee?.email || "-"}
                </td>

                <td>
                    ${employee?.department || "-"}
                </td>

                <td>
                    ${formatDate(record.date)}
                </td>

                <td>
                    <span class="status present">
                        ${record.status || "-"}
                    </span>
                </td>

                <td>
                    ${formatTime(record.checkIn)}
                </td>

                <td>
                    ${formatTime(record.checkOut)}
                </td>
            `;

            table.appendChild(row);

        });
    }

    function updateSummary(records) {

        const totalAttendance =
            document.getElementById(
                "totalAttendance"
            );

        const attendanceRecords =
            document.getElementById(
                "attendanceRecords"
            );

        const presentToday =
            document.getElementById(
                "presentToday"
            );

        if (totalAttendance) {

            totalAttendance.textContent =
                records.length;
        }

        if (attendanceRecords) {

            attendanceRecords.textContent =
                records.length;
        }

        const today =
            new Date();

        const todayString =
            today.toLocaleDateString(
                "en-US"
            );

        const presentCount =
            records.filter(function (record) {

                const recordDate =
                    new Date(
                        record.date
                    ).toLocaleDateString(
                        "en-US"
                    );

                return (
                    recordDate === todayString &&
                    record.status === "Present"
                );

            }).length;

        if (presentToday) {

            presentToday.textContent =
                presentCount;
        }
    }

    async function loadAttendance() {

        console.log(
            "Loading attendance..."
        );

        try {

            let endpoint =
                API_URL;

            if (userRole === "employee") {

                endpoint =
                    `${API_URL}/my`;

            }

            console.log(
                "Attendance endpoint:",
                endpoint
            );

            const response =
                await fetch(
                    endpoint,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );

            console.log(
                "Attendance API Status:",
                response.status
            );

            const data =
                await response.json();

            if (!response.ok) {

                const table =
                    document.getElementById(
                        "attendanceTableBody"
                    );

                if (table) {

                    table.innerHTML = `
                        <tr>
                            <td colspan="7"
                                class="no-data">
                                ${data.message ||
                                "Unable to load attendance"}
                            </td>
                        </tr>
                    `;
                }

                showMessage(
                    data.message ||
                    "Unable to load attendance",
                    "error"
                );

                return;
            }

            const records =
                data.attendance || [];

            updateSummary(records);

            displayAttendance(records);

        } catch (error) {

            console.log(
                "Attendance Load Error:",
                error
            );

            const table =
                document.getElementById(
                    "attendanceTableBody"
                );

            if (table) {

                table.innerHTML = `
                    <tr>
                        <td colspan="7"
                            class="no-data">
                            Server connection failed
                        </td>
                    </tr>
                `;
            }

            showMessage(
                "Server connection failed",
                "error"
            );
        }
    }

    window.checkIn = async function () {

        const employeeInput =
            document.getElementById(
                "employeeId"
            );

        const employeeId =
            employeeInput
                ? employeeInput.value.trim()
                : "";

        if (
            userRole !== "employee" &&
            !employeeId
        ) {

            showMessage(
                "Employee ID is required",
                "error"
            );

            return;
        }

        try {

            const body = {};

            if (userRole !== "employee") {

                body.employeeId =
                    employeeId;
            }

            const response =
                await fetch(
                    `${API_URL}/check-in`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(body)
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Check-in failed",
                    "error"
                );

                return;
            }

            showMessage(
                "Check-in successful",
                "success"
            );

            if (employeeInput) {
                employeeInput.value = "";
            }

            loadAttendance();

        } catch (error) {

            console.log(
                "Check-In Error:",
                error
            );

            showMessage(
                "Server connection failed",
                "error"
            );
        }
    };

    window.checkOut = async function () {

        const employeeInput =
            document.getElementById(
                "employeeId"
            );

        const employeeId =
            employeeInput
                ? employeeInput.value.trim()
                : "";

        if (
            userRole !== "employee" &&
            !employeeId
        ) {

            showMessage(
                "Employee ID is required",
                "error"
            );

            return;
        }

        try {

            const body = {};

            if (userRole !== "employee") {

                body.employeeId =
                    employeeId;
            }

            const response =
                await fetch(
                    `${API_URL}/check-out`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(body)
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Check-out failed",
                    "error"
                );

                return;
            }

            showMessage(
                "Check-out successful",
                "success"
            );

            if (employeeInput) {
                employeeInput.value = "";
            }

            loadAttendance();

        } catch (error) {

            console.log(
                "Check-Out Error:",
                error
            );

            showMessage(
                "Server connection failed",
                "error"
            );
        }
    };

    window.logout = function () {

        localStorage.removeItem(
            "token"
        );

        window.location.href =
            "login.html";
    };

    console.log(
        "attendance.js loaded successfully"
    );

    console.log(
        "Current User Role:",
        userRole
    );

    loadAttendance();

})();