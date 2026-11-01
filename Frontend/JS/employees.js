const EMPLOYEE_API =
    "http://localhost:5000/api/employees";


/* =========================
   AUTH
========================= */

const employeeToken =
    localStorage.getItem("token");


const employeeUserData =
    localStorage.getItem("user");


if (
    !employeeToken ||
    !employeeUserData
) {

    window.location.href =
        "login.html";

}


let employeeUser = null;


try {

    employeeUser =
        JSON.parse(
            employeeUserData
        );

} catch (error) {

    console.error(
        "User data error:",
        error
    );

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    window.location.href =
        "login.html";

}


/* =========================
   VARIABLES
========================= */

let employees = [];

let editEmployeeId = null;


/* =========================
   MESSAGE
========================= */

function showMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "message"
        );


    if (!messageBox) return;


    messageBox.textContent =
        message;


    messageBox.style.display =
        "block";


    if (type === "success") {

        messageBox.style.background =
            "rgba(22, 163, 74, 0.12)";

        messageBox.style.color =
            "var(--success)";

    } else {

        messageBox.style.background =
            "rgba(220, 38, 38, 0.12)";

        messageBox.style.color =
            "var(--danger)";

    }


    setTimeout(
        function () {

            messageBox.style.display =
                "none";

        },
        3000
    );

}


/* =========================
   CHECK ADMIN
========================= */

function isAdmin() {

    return (
        employeeUser &&
        employeeUser.role === "admin"
    );

}


/* =========================
   ADMIN UI
========================= */

function setupRoleAccess() {

    const formBox =
        document.getElementById(
            "employeeFormBox"
        );


    if (
        !isAdmin()
    ) {

        if (formBox) {

            formBox.style.display =
                "none";

        }

    }

}


/* =========================
   LOAD EMPLOYEES
========================= */

async function loadEmployees() {

    const tableBody =
        document.getElementById(
            "employeeTableBody"
        );


    if (tableBody) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="no-data"
                >
                    Loading employees...
                </td>

            </tr>

        `;

    }


    try {

        const response =
            await fetch(
                EMPLOYEE_API,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${employeeToken}`

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "Employees Response:",
            data
        );


        if (!response.ok) {

            showMessage(
                data.message ||
                "Unable to load employees",
                "error"
            );

            return;

        }


        employees =
            Array.isArray(
                data.employees
            )
                ? data.employees
                : [];


        displayEmployees(
            employees
        );


    } catch (error) {

        console.error(
            "Load Employees Error:",
            error
        );


        showMessage(
            "Server connection failed",
            "error"
        );

    }

}


/* =========================
   DISPLAY EMPLOYEES
========================= */

function displayEmployees(
    employeeList
) {

    const tableBody =
        document.getElementById(
            "employeeTableBody"
        );


    if (!tableBody) return;


    tableBody.innerHTML =
        "";


    if (
        !employeeList ||
        employeeList.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="no-data"
                >
                    No employees found
                </td>

            </tr>

        `;

        return;

    }


    employeeList.forEach(
        function (employee) {

            const row =
                document.createElement(
                    "tr"
                );


            const joiningDate =
                employee.joiningDate
                    ? new Date(
                        employee.joiningDate
                      ).toLocaleDateString(
                        "en-IN"
                      )
                    : "-";


            const salary =
                Number(
                    employee.salary || 0
                ).toLocaleString(
                    "en-IN"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        employee.name
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        employee.email
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        employee.phone
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        employee.department
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        employee.designation
                    )}
                </td>

                <td>
                    ₹${salary}
                </td>

                <td>
                    ${joiningDate}
                </td>

                <td>
                    ${escapeHTML(
                        employee.address
                    )}
                </td>

                <td>

                    ${
                        isAdmin()
                        ?

                        `
                        <button
                            class="edit-btn"
                            onclick="editEmployee('${employee._id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteEmployee('${employee._id}')"
                        >
                            Delete
                        </button>
                        `

                        :

                        `<span style="color: var(--muted);">
                            View Only
                        </span>`

                    }

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


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
   ADD / UPDATE
========================= */

const employeeForm =
    document.getElementById(
        "employeeForm"
    );


if (employeeForm) {

    employeeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!isAdmin()) {

                showMessage(
                    "Only admin can manage employees",
                    "error"
                );

                return;

            }


            const employeeData = {

                name:
                    document.getElementById(
                        "name"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "email"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "phone"
                    ).value.trim(),

                department:
                    document.getElementById(
                        "department"
                    ).value.trim(),

                designation:
                    document.getElementById(
                        "designation"
                    ).value.trim(),

                salary:
                    Number(
                        document.getElementById(
                            "salary"
                        ).value
                    ),

                joiningDate:
                    document.getElementById(
                        "joiningDate"
                    ).value,

                address:
                    document.getElementById(
                        "address"
                    ).value.trim()

            };


            try {

                let url =
                    EMPLOYEE_API;


                let method =
                    "POST";


                if (
                    editEmployeeId
                ) {

                    url =
                        `${EMPLOYEE_API}/${editEmployeeId}`;

                    method =
                        "PUT";

                }


                const response =
                    await fetch(
                        url,
                        {

                            method:

                                method,

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${employeeToken}`

                            },

                            body:
                                JSON.stringify(
                                    employeeData
                                )

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Employee Save Response:",
                    data
                );


                if (!response.ok) {

                    showMessage(
                        data.message ||
                        "Operation failed",
                        "error"
                    );

                    return;

                }


                if (
                    editEmployeeId
                ) {

                    showMessage(
                        "Employee updated successfully",
                        "success"
                    );

                } else {

                    showMessage(
                        "Employee added successfully",
                        "success"
                    );

                }


                resetForm();


                await loadEmployees();


            } catch (error) {

                console.error(
                    "Save Employee Error:",
                    error
                );


                showMessage(
                    "Server connection failed",
                    "error"
                );

            }

        }
    );

}


/* =========================
   EDIT EMPLOYEE
========================= */

async function editEmployee(
    id
) {

    if (!isAdmin()) {

        showMessage(
            "Only admin can edit employees",
            "error"
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${EMPLOYEE_API}/${id}`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${employeeToken}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(
                data.message ||
                "Unable to get employee",
                "error"
            );

            return;

        }


        const employee =
            data.employee;


        document.getElementById(
            "name"
        ).value =
            employee.name || "";


        document.getElementById(
            "email"
        ).value =
            employee.email || "";


        document.getElementById(
            "phone"
        ).value =
            employee.phone || "";


        document.getElementById(
            "department"
        ).value =
            employee.department || "";


        document.getElementById(
            "designation"
        ).value =
            employee.designation || "";


        document.getElementById(
            "salary"
        ).value =
            employee.salary || "";


        document.getElementById(
            "joiningDate"
        ).value =
            employee.joiningDate
                ? employee.joiningDate.substring(
                    0,
                    10
                  )
                : "";


        document.getElementById(
            "address"
        ).value =
            employee.address || "";


        editEmployeeId =
            employee._id;


        document.getElementById(
            "formTitle"
        ).textContent =
            "Edit Employee";


        document.getElementById(
            "submitBtn"
        ).textContent =
            "Update Employee";


        document.getElementById(
            "cancelBtn"
        ).style.display =
            "inline-block";


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


    } catch (error) {

        console.error(
            "Edit Employee Error:",
            error
        );


        showMessage(
            "Server connection failed",
            "error"
        );

    }

}


/* =========================
   DELETE EMPLOYEE
========================= */

async function deleteEmployee(
    id
) {

    if (!isAdmin()) {

        showMessage(
            "Only admin can delete employees",
            "error"
        );

        return;

    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this employee?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                `${EMPLOYEE_API}/${id}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${employeeToken}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(
                data.message ||
                "Unable to delete employee",
                "error"
            );

            return;

        }


        showMessage(
            "Employee deleted successfully",
            "success"
        );


        await loadEmployees();


    } catch (error) {

        console.error(
            "Delete Employee Error:",
            error
        );


        showMessage(
            "Server connection failed",
            "error"
        );

    }

}


/* =========================
   CANCEL EDIT
========================= */

function cancelEdit() {

    resetForm();

}


/* =========================
   RESET FORM
========================= */

function resetForm() {

    const form =
        document.getElementById(
            "employeeForm"
        );


    if (form) {

        form.reset();

    }


    editEmployeeId =
        null;


    const formTitle =
        document.getElementById(
            "formTitle"
        );


    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    const cancelBtn =
        document.getElementById(
            "cancelBtn"
        );


    if (formTitle) {

        formTitle.textContent =
            "Add Employee";

    }


    if (submitBtn) {

        submitBtn.textContent =
            "Add Employee";

    }


    if (cancelBtn) {

        cancelBtn.style.display =
            "none";

    }

}


/* =========================
   SEARCH
========================= */

const searchEmployee =
    document.getElementById(
        "searchEmployee"
    );


if (searchEmployee) {

    searchEmployee.addEventListener(
        "input",
        function () {

            const searchValue =
                this.value
                    .toLowerCase()
                    .trim();


            if (!searchValue) {

                displayEmployees(
                    employees
                );

                return;

            }


            const filteredEmployees =
                employees.filter(
                    function (employee) {

                        return (

                            String(
                                employee.name ||
                                ""
                            )
                            .toLowerCase()
                            .includes(
                                searchValue
                            )

                            ||

                            String(
                                employee.email ||
                                ""
                            )
                            .toLowerCase()
                            .includes(
                                searchValue
                            )

                            ||

                            String(
                                employee.department ||
                                ""
                            )
                            .toLowerCase()
                            .includes(
                                searchValue
                            )

                            ||

                            String(
                                employee.designation ||
                                ""
                            )
                            .toLowerCase()
                            .includes(
                                searchValue
                            )

                            ||

                            String(
                                employee.phone ||
                                ""
                            )
                            .toLowerCase()
                            .includes(
                                searchValue
                            )

                        );

                    }
                );


            displayEmployees(
                filteredEmployees
            );

        }
    );

}


/* =========================
   LOGOUT
========================= */

function logout() {

    const confirmLogout =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmLogout) {

        return;

    }


    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "login.html";

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupRoleAccess();

        loadEmployees();

    }
);