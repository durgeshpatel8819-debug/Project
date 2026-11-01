// =========================
// HRGENIUS PAYROLL
// =========================

(function () {

    // =========================
    // TOKEN
    // =========================

    const payrollToken =
        localStorage.getItem("token");

    // =========================
    // LOGIN CHECK
    // =========================

    if (!payrollToken) {
        window.location.href = "login.html";
        return;
    }

    // =========================
    // PAYROLL API
    // =========================

    const PAYROLL_API =
        "http://localhost:5000/api/payroll";

    // =========================
    // DASHBOARD
    // =========================

    window.goDashboard = function () {
        window.location.href =
            "dashboard.html";
    };

    // =========================
    // LOGOUT
    // =========================

    window.logout = function () {

        localStorage.removeItem("token");

        window.location.href =
            "login.html";
    };

    // =========================
    // SHOW MESSAGE
    // =========================

    function showMessage(message, type) {

        const messageBox =
            document.getElementById("message");

        if (!messageBox) {
            return;
        }

        messageBox.textContent =
            message;

        if (type === "success") {

            messageBox.style.color =
                "var(--success)";

        } else {

            messageBox.style.color =
                "var(--danger)";
        }

        setTimeout(function () {

            messageBox.textContent = "";

        }, 3000);
    }

    // =========================
    // FORMAT PAYROLL MONTH
    // =========================

    function formatPayrollMonth(monthValue) {

        if (!monthValue) {
            return "";
        }

        const parts =
            monthValue.split("-");

        const year =
            Number(parts[0]);

        const monthNumber =
            Number(parts[1]);

        if (
            !year ||
            !monthNumber ||
            monthNumber < 1 ||
            monthNumber > 12
        ) {
            return "";
        }

        const monthDate =
            new Date(
                year,
                monthNumber - 1,
                1
            );

        return monthDate.toLocaleString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );
    }

    // =========================
    // LOAD PAYROLL
    // =========================

    async function loadPayroll() {

        const table =
            document.getElementById(
                "payrollTableBody"
            );

        try {

            const response =
                await fetch(
                    PAYROLL_API,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${payrollToken}`
                        }
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                if (table) {

                    table.innerHTML = `
                        <tr>
                            <td
                                colspan="10"
                                class="no-data"
                            >
                                ${
                                    data.message ||
                                    "Unable to load payroll"
                                }
                            </td>
                        </tr>
                    `;
                }

                showMessage(
                    data.message ||
                    "Unable to load payroll",
                    "error"
                );

                return;
            }

            const payrolls =
                data.payrolls || [];

            // =========================
            // SUMMARY
            // =========================

            const totalPayroll =
                document.getElementById(
                    "totalPayroll"
                );

            const paidPayroll =
                document.getElementById(
                    "paidPayroll"
                );

            const pendingPayroll =
                document.getElementById(
                    "pendingPayroll"
                );

            if (totalPayroll) {

                totalPayroll.textContent =
                    payrolls.length;
            }

            if (paidPayroll) {

                paidPayroll.textContent =
                    payrolls.filter(
                        function (payroll) {

                            return (
                                payroll.paymentStatus ===
                                "Paid"
                            );
                        }
                    ).length;
            }

            if (pendingPayroll) {

                pendingPayroll.textContent =
                    payrolls.filter(
                        function (payroll) {

                            return (
                                payroll.paymentStatus ===
                                "Pending"
                            );
                        }
                    ).length;
            }

            // =========================
            // TABLE
            // =========================

            if (!table) {
                return;
            }

            table.innerHTML = "";

            if (payrolls.length === 0) {

                table.innerHTML = `
                    <tr>
                        <td
                            colspan="10"
                            class="no-data"
                        >
                            No payroll records found
                        </td>
                    </tr>
                `;

                return;
            }

            // =========================
            // PAYROLL ROWS
            // =========================

            payrolls.forEach(
                function (payroll) {

                    const employee =
                        payroll.employeeId;

                    const employeeName =
                        employee &&
                        typeof employee === "object"
                            ? employee.name
                            : "Unknown";

                    const employeeEmail =
                        employee &&
                        typeof employee === "object"
                            ? employee.email
                            : "-";

                    const department =
                        employee &&
                        typeof employee === "object"
                            ? employee.department
                            : "-";

                    const status =
                        payroll.paymentStatus ||
                        "Pending";

                    const statusClass =
                        status.toLowerCase();

                    let action = "-";

                    if (status === "Pending") {

                        action = `
                            <button
                                class="action-btn pay-btn"
                                onclick="markAsPaid('${payroll._id}')"
                            >
                                Mark Paid
                            </button>
                        `;
                    }

                    const row =
                        document.createElement("tr");

                    row.innerHTML = `
                        <td>
                            ${employeeName}
                        </td>

                        <td>
                            ${employeeEmail}
                        </td>

                        <td>
                            ${department}
                        </td>

                        <td>
                            ${payroll.month}
                        </td>

                        <td>
                            ₹${payroll.basicSalary}
                        </td>

                        <td>
                            ₹${payroll.allowances}
                        </td>

                        <td>
                            ₹${payroll.deductions}
                        </td>

                        <td>
                            ₹${payroll.netSalary}
                        </td>

                        <td>
                            <span
                                class="status ${statusClass}"
                            >
                                ${status}
                            </span>
                        </td>

                        <td>
                            ${action}
                        </td>
                    `;

                    table.appendChild(row);
                }
            );

        } catch (error) {

            console.log(
                "Error loading payroll:",
                error
            );

            if (table) {

                table.innerHTML = `
                    <tr>
                        <td
                            colspan="10"
                            class="no-data"
                        >
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

    // =========================
    // GENERATE PAYROLL
    // =========================

    const payrollForm =
        document.getElementById(
            "payrollForm"
        );

    if (payrollForm) {

        payrollForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const employeeId =
                    document
                        .getElementById(
                            "employeeId"
                        )
                        .value
                        .trim();

                const monthValue =
                    document
                        .getElementById(
                            "month"
                        )
                        .value;

                const basicSalary =
                    Number(
                        document
                            .getElementById(
                                "basicSalary"
                            )
                            .value
                    );

                const allowances =
                    Number(
                        document
                            .getElementById(
                                "allowances"
                            )
                            .value
                    );

                const deductions =
                    Number(
                        document
                            .getElementById(
                                "deductions"
                            )
                            .value
                    );

                // =========================
                // VALIDATION
                // =========================

                if (!employeeId) {

                    showMessage(
                        "Employee ID is required",
                        "error"
                    );

                    return;
                }

                if (!monthValue) {

                    showMessage(
                        "Please select payroll month",
                        "error"
                    );

                    return;
                }

                const month =
                    formatPayrollMonth(
                        monthValue
                    );

                if (!month) {

                    showMessage(
                        "Invalid payroll month",
                        "error"
                    );

                    return;
                }

                if (
                    Number.isNaN(
                        basicSalary
                    ) ||
                    basicSalary < 0
                ) {

                    showMessage(
                        "Basic salary cannot be negative",
                        "error"
                    );

                    return;
                }

                if (
                    Number.isNaN(
                        allowances
                    ) ||
                    allowances < 0
                ) {

                    showMessage(
                        "Allowances cannot be negative",
                        "error"
                    );

                    return;
                }

                if (
                    Number.isNaN(
                        deductions
                    ) ||
                    deductions < 0
                ) {

                    showMessage(
                        "Deductions cannot be negative",
                        "error"
                    );

                    return;
                }

                // =========================
                // NET SALARY
                // =========================

                const netSalary =
                    basicSalary +
                    allowances -
                    deductions;

                if (netSalary < 0) {

                    showMessage(
                        "Deductions cannot be greater than salary",
                        "error"
                    );

                    return;
                }

                // =========================
                // BUTTON
                // =========================

                const generateButton =
                    document.getElementById(
                        "generatePayrollBtn"
                    );

                if (generateButton) {

                    generateButton.disabled =
                        true;

                    generateButton.textContent =
                        "Generating...";
                }

                // =========================
                // CREATE PAYROLL
                // =========================

                try {

                    const response =
                        await fetch(
                            `${PAYROLL_API}/create`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${payrollToken}`
                                },

                                body:
                                    JSON.stringify({
                                        employeeId:
                                            employeeId,

                                        month:
                                            month,

                                        basicSalary:
                                            basicSalary,

                                        allowances:
                                            allowances,

                                        deductions:
                                            deductions
                                    })
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {

                        showMessage(
                            data.message ||
                            "Failed to generate payroll",
                            "error"
                        );

                        return;
                    }

                    showMessage(
                        "Payroll generated successfully!",
                        "success"
                    );

                    // =========================
                    // RESET FORM
                    // =========================

                    payrollForm.reset();

                    const allowancesInput =
                        document.getElementById(
                            "allowances"
                        );

                    const deductionsInput =
                        document.getElementById(
                            "deductions"
                        );

                    if (allowancesInput) {
                        allowancesInput.value =
                            "0";
                    }

                    if (deductionsInput) {
                        deductionsInput.value =
                            "0";
                    }

                    // =========================
                    // RELOAD
                    // =========================

                    loadPayroll();

                } catch (error) {

                    console.log(
                        "Generate Payroll Error:",
                        error
                    );

                    showMessage(
                        "Server connection failed",
                        "error"
                    );

                } finally {

                    if (generateButton) {

                        generateButton.disabled =
                            false;

                        generateButton.textContent =
                            "Generate Payroll";
                    }
                }
            }
        );
    }

    // =========================
    // MARK AS PAID
    // =========================

    window.markAsPaid =
        async function (id) {

            try {

                const response =
                    await fetch(
                        `${PAYROLL_API}/${id}/status`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${payrollToken}`
                            },

                            body:
                                JSON.stringify({
                                    paymentStatus:
                                        "Paid"
                                })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    showMessage(
                        data.message ||
                        "Failed to update payment status",
                        "error"
                    );

                    return;
                }

                showMessage(
                    "Payroll marked as Paid",
                    "success"
                );

                loadPayroll();

            } catch (error) {

                console.log(
                    "Mark Paid Error:",
                    error
                );

                showMessage(
                    "Server connection failed",
                    "error"
                );
            }
        };

    // =========================
    // INITIAL LOAD
    // =========================

    loadPayroll();

})();