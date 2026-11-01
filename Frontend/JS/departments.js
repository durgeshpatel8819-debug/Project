const API_URL =
    "http://localhost:5000/api";


let departments = [];
let employees = [];

let currentSort = {
    field: null,
    direction: "asc"
};

let departmentToDelete = null;


/* =====================================================
   AUTH
===================================================== */

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken")
    );

}


function getAuthHeaders() {

    const token = getToken();

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

}


function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    window.location.href = "login.html";

}


/* =====================================================
   INITIAL LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupEvents();

        setupSearch();

        await loadEmployees();
        await loadDepartments();

    }
);


/* =====================================================
   EVENTS
===================================================== */

function setupEvents() {

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderDepartments
        );

    }


    const departmentForm =
        document.getElementById(
            "departmentForm"
        );

    if (departmentForm) {

        departmentForm.addEventListener(
            "submit",
            handleDepartmentSubmit
        );

    }


    const headSelect =
        document.getElementById(
            "departmentHeadSelect"
        );

    if (headSelect) {

        headSelect.addEventListener(
            "change",
            updateHeadPreview
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeDepartmentModal();
                closeDeleteModal();
                closeHeadModal();
                closeEmployeesModal();
                closeDepartmentDetailsModal();

            }


            /*
                Ctrl + K
                Search box focus
            */

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                const searchInput =
                    document.getElementById(
                        "searchInput"
                    );

                if (searchInput) {

                    searchInput.focus();

                    searchInput.select();

                }

            }

        }
    );

}


/* =====================================================
   SEARCH SETUP
===================================================== */

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {

        return;

    }


    searchInput.addEventListener(
        "input",
        () => {

            updateSearchUI();

            renderDepartments();

        }
    );


    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                searchInput.value = "";

                updateSearchUI();

                renderDepartments();

                searchInput.blur();

            }

        }
    );


    updateSearchUI();

}


/* =====================================================
   SEARCH UI
===================================================== */

function updateSearchUI() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {

        return;

    }


    const clearButton =
        document.getElementById(
            "clearSearch"
        );


    const searchResult =
        document.getElementById(
            "searchResultText"
        );


    const search =
        searchInput.value.trim();


    if (clearButton) {

        clearButton.style.display =
            search
                ? "flex"
                : "none";

    }


    if (searchResult) {

        if (search) {

            const filtered =
                getFilteredDepartments();

            searchResult.textContent =
                `${filtered.length} result${
                    filtered.length === 1
                        ? ""
                        : "s"
                } found`;

        }
        else {

            searchResult.textContent =
                `${departments.length} department${
                    departments.length === 1
                        ? ""
                        : "s"
                }`;

        }

    }

}


/* =====================================================
   CLEAR SEARCH
===================================================== */

function clearDepartmentSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {

        return;

    }


    searchInput.value = "";


    updateSearchUI();

    renderDepartments();


    searchInput.focus();

}


/* =====================================================
   LOAD EMPLOYEES
===================================================== */

async function loadEmployees() {

    try {

        const response =
            await fetch(
                `${API_URL}/employees`,
                {
                    method: "GET",
                    headers:
                        getAuthHeaders()
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logout();

            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load employees"
            );

        }


        if (
            Array.isArray(data)
        ) {

            employees = data;

        }
        else if (
            Array.isArray(
                data.employees
            )
        ) {

            employees =
                data.employees;

        }
        else {

            employees = [];

        }

    }
    catch (error) {

        console.error(
            "Load Employees Error:",
            error
        );

        employees = [];

        showToast(
            "error",
            "Error",
            "Unable to load employees."
        );

    }

}


/* =====================================================
   LOAD DEPARTMENTS
===================================================== */

async function loadDepartments() {

    try {

        const response =
            await fetch(
                `${API_URL}/departments`,
                {
                    method: "GET",
                    headers:
                        getAuthHeaders()
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logout();

            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load departments"
            );

        }


        if (
            Array.isArray(
                data.departments
            )
        ) {

            departments =
                data.departments;

        }
        else if (
            Array.isArray(data)
        ) {

            departments = data;

        }
        else {

            departments = [];

        }


        updateStats();

        updateSearchUI();

        renderDepartments();

    }
    catch (error) {

        console.error(
            "Load Departments Error:",
            error
        );

        departments = [];

        updateStats();

        updateSearchUI();

        renderDepartments();

        showToast(
            "error",
            "Error",
            "Unable to load departments."
        );

    }

}


/* =====================================================
   STATS
===================================================== */

function updateStats() {

    const total =
        departments.length;


    const active =
        departments.filter(
            department =>
                department.status ===
                "Active"
        ).length;


    const totalEmployees =
        departments.reduce(
            (
                total,
                department
            ) => {

                return (
                    total +
                    Number(
                        department.employeeCount ||
                        0
                    )
                );

            },
            0
        );


    const totalSalary =
        departments.reduce(
            (
                total,
                department
            ) => {

                return (
                    total +
                    Number(
                        department.totalSalary ||
                        0
                    )
                );

            },
            0
        );


    setText(
        "totalDepartments",
        total
    );

    setText(
        "activeDepartments",
        active
    );

    setText(
        "totalEmployees",
        totalEmployees
    );

    setText(
        "totalSalary",
        formatCurrency(
            totalSalary
        )
    );

}


/* =====================================================
   FILTER / SEARCH
===================================================== */

function getFilteredDepartments() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const search =
        (
            searchInput?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const status =
        statusFilter?.value ||
        "all";


    return departments.filter(
        department => {

            const name =
                String(
                    department.name ||
                    ""
                ).toLowerCase();


            const description =
                String(
                    department.description ||
                    ""
                ).toLowerCase();


            const headName =
                String(
                    department.head?.name ||
                    ""
                ).toLowerCase();


            const headEmail =
                String(
                    department.head?.email ||
                    ""
                ).toLowerCase();


            const matchesSearch =
                !search ||
                name.includes(search) ||
                description.includes(search) ||
                headName.includes(search) ||
                headEmail.includes(search);


            const matchesStatus =
                status === "all" ||
                department.status ===
                    status;


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );

}


/* =====================================================
   SORT
===================================================== */

function changeDepartmentSort(
    field
) {

    if (
        currentSort.field ===
        field
    ) {

        currentSort.direction =
            currentSort.direction ===
            "asc"
                ? "desc"
                : "asc";

    }
    else {

        currentSort.field =
            field;

        currentSort.direction =
            "asc";

    }


    updateSortArrow();

    renderDepartments();

}


function updateSortArrow() {

    const fields = [
        "name",
        "employees",
        "salary",
        "createdAt"
    ];


    fields.forEach(
        field => {

            const element =
                document.getElementById(
                    `sort-${field}`
                );


            if (!element) {

                return;

            }


            if (
                currentSort.field !==
                field
            ) {

                element.textContent =
                    "↕";

            }
            else if (
                currentSort.direction ===
                "asc"
            ) {

                element.textContent =
                    "↑";

            }
            else {

                element.textContent =
                    "↓";

            }

        }
    );

}


function sortDepartments(
    list
) {

    if (!currentSort.field) {

        return list;

    }


    return [...list].sort(
        (
            first,
            second
        ) => {

            let valueA;
            let valueB;


            if (
                currentSort.field ===
                "name"
            ) {

                valueA =
                    String(
                        first.name ||
                        ""
                    ).toLowerCase();

                valueB =
                    String(
                        second.name ||
                        ""
                    ).toLowerCase();

            }


            else if (
                currentSort.field ===
                "employees"
            ) {

                valueA =
                    Number(
                        first.employeeCount ||
                        0
                    );

                valueB =
                    Number(
                        second.employeeCount ||
                        0
                    );

            }


            else if (
                currentSort.field ===
                "salary"
            ) {

                valueA =
                    Number(
                        first.totalSalary ||
                        0
                    );

                valueB =
                    Number(
                        second.totalSalary ||
                        0
                    );

            }


            else if (
                currentSort.field ===
                "createdAt"
            ) {

                valueA =
                    new Date(
                        first.createdAt ||
                        0
                    ).getTime();

                valueB =
                    new Date(
                        second.createdAt ||
                        0
                    ).getTime();

            }


            if (
                valueA <
                valueB
            ) {

                return (
                    currentSort.direction ===
                    "asc"
                        ? -1
                        : 1
                );

            }


            if (
                valueA >
                valueB
            ) {

                return (
                    currentSort.direction ===
                    "asc"
                        ? 1
                        : -1
                );

            }


            return 0;

        }
    );

}


/* =====================================================
   RENDER DEPARTMENTS
===================================================== */

function renderDepartments() {

    const tableBody =
        document.getElementById(
            "departmentTableBody"
        );


    if (!tableBody) {

        return;

    }


    let filtered =
        getFilteredDepartments();


    filtered =
        sortDepartments(
            filtered
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const search =
        searchInput?.value.trim() ||
        "";


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const status =
        statusFilter?.value ||
        "all";


    setText(
        "departmentCountText",
        `${filtered.length} department${
            filtered.length === 1
                ? ""
                : "s"
        }`
    );


    updateSearchUI();


    if (
        filtered.length === 0
    ) {

        let message =
            "No departments found.";


        let subMessage =
            "Try changing your search or filter.";


        if (search) {

            message =
                `No results for "${search}"`;

            subMessage =
                "Try another department name, description or head name.";

        }
        else if (
            status !== "all"
        ) {

            message =
                `No ${status.toLowerCase()} departments`;

            subMessage =
                "Try selecting another status.";

        }


        tableBody.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    class="empty-state"
                >

                    <div class="empty-state-icon">
                        🔍
                    </div>

                    <h3>
                        ${escapeHTML(
                            message
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            subMessage
                        )}
                    </p>

                </td>

            </tr>
        `;

        return;

    }


    tableBody.innerHTML =
        filtered
            .map(
                department =>
                    createDepartmentRow(
                        department
                    )
            )
            .join("");

}


/* =====================================================
   DEPARTMENT ROW
===================================================== */

function createDepartmentRow(
    department
) {

    const id =
        department._id;


    const head =
        department.head;


    const headHTML =
        head
            ? `
                <div class="head-info">

                    <div class="avatar">
                        ${getInitials(
                            head.name
                        )}
                    </div>

                    <div>

                        <div class="head-name">
                            ${escapeHTML(
                                head.name
                            )}
                        </div>

                        <div class="head-designation">
                            ${escapeHTML(
                                head.designation ||
                                "Department Head"
                            )}
                        </div>

                    </div>

                </div>
            `
            : `
                <span class="muted-text">
                    No Head Assigned
                </span>
            `;


    const statusClass =
        department.status ===
        "Active"
            ? "status-active"
            : "status-inactive";


    return `
        <tr>

            <td>

                <div class="department-name">
                    ${escapeHTML(
                        department.name ||
                        "-"
                    )}
                </div>

                <div class="department-description">
                    ${escapeHTML(
                        department.description ||
                        "No description"
                    )}
                </div>

            </td>


            <td>
                ${headHTML}
            </td>


            <td>

                <button
                    type="button"
                    class="employee-count-btn"
                    onclick="openEmployeesModal('${id}')"
                >

                    ${Number(
                        department.employeeCount ||
                        0
                    )}

                    <span>
                        View Employees
                    </span>

                </button>

            </td>


            <td>
                ${formatCurrency(
                    department.totalSalary ||
                    0
                )}
            </td>


            <td>

                <span
                    class="status-badge ${statusClass}"
                >

                    ${escapeHTML(
                        department.status ||
                        "Active"
                    )}

                </span>

            </td>


            <td>
                ${formatDate(
                    department.createdAt
                )}
            </td>


            <td>

                <div class="action-buttons">

                    <button
                        type="button"
                        class="action-btn view"
                        onclick="openDepartmentDetails('${id}')"
                    >
                        👁️ View
                    </button>


                    <button
                        type="button"
                        class="action-btn edit"
                        onclick="openEditDepartmentModal('${id}')"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        type="button"
                        class="action-btn head"
                        onclick="openHeadModal('${id}')"
                    >
                        👤 Head
                    </button>


                    <button
                        type="button"
                        class="action-btn delete"
                        onclick="openDeleteModal('${id}')"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </td>

        </tr>
    `;

}


/* =====================================================
   ADD DEPARTMENT
===================================================== */

function openAddDepartmentModal() {

    setText(
        "departmentModalTitle",
        "Add Department"
    );


    setValue(
        "departmentId",
        ""
    );


    setValue(
        "departmentName",
        ""
    );


    setValue(
        "departmentDescription",
        ""
    );


    setValue(
        "departmentStatus",
        "Active"
    );


    showModal(
        "departmentModal"
    );

}


/* =====================================================
   EDIT DEPARTMENT
===================================================== */

function openEditDepartmentModal(
    id
) {

    const department =
        departments.find(
            item =>
                item._id === id
        );


    if (!department) {

        showToast(
            "error",
            "Error",
            "Department not found."
        );

        return;

    }


    setText(
        "departmentModalTitle",
        "Edit Department"
    );


    setValue(
        "departmentId",
        department._id
    );


    setValue(
        "departmentName",
        department.name ||
        ""
    );


    setValue(
        "departmentDescription",
        department.description ||
        ""
    );


    setValue(
        "departmentStatus",
        department.status ||
        "Active"
    );


    showModal(
        "departmentModal"
    );

}


/* =====================================================
   SAVE DEPARTMENT
===================================================== */

async function handleDepartmentSubmit(
    event
) {

    event.preventDefault();


    const id =
        document.getElementById(
            "departmentId"
        )?.value.trim();


    const name =
        document.getElementById(
            "departmentName"
        )?.value.trim();


    const description =
        document.getElementById(
            "departmentDescription"
        )?.value.trim();


    const status =
        document.getElementById(
            "departmentStatus"
        )?.value;


    if (!name) {

        showToast(
            "warning",
            "Validation",
            "Department name is required."
        );

        return;

    }


    const body = {
        name,
        description,
        status
    };


    try {

        const isEdit =
            Boolean(id);


        const url =
            isEdit
                ? `${API_URL}/departments/${id}`
                : `${API_URL}/departments`;


        const response =
            await fetch(
                url,
                {
                    method:
                        isEdit
                            ? "PUT"
                            : "POST",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify(
                            body
                        )
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logout();

            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to save department"
            );

        }


        closeDepartmentModal();


        await loadDepartments();


        showToast(
            "success",
            "Success",
            isEdit
                ? "Department updated successfully."
                : "Department created successfully."
        );

    }
    catch (error) {

        console.error(
            "Save Department Error:",
            error
        );


        showToast(
            "error",
            "Error",
            error.message ||
            "Unable to save department."
        );

    }

}


/* =====================================================
   DELETE
===================================================== */

function openDeleteModal(
    id
) {

    const department =
        departments.find(
            item =>
                item._id === id
        );


    if (!department) {

        showToast(
            "error",
            "Error",
            "Department not found."
        );

        return;

    }


    departmentToDelete =
        department._id;


    setText(
        "deleteDepartmentName",
        department.name
    );


    showModal(
        "deleteModal"
    );

}


function closeDeleteModal() {

    departmentToDelete =
        null;


    hideModal(
        "deleteModal"
    );

}


async function confirmDeleteDepartment() {

    if (!departmentToDelete) {

        return;

    }


    const id =
        departmentToDelete;


    try {

        const response =
            await fetch(
                `${API_URL}/departments/${id}`,
                {
                    method: "DELETE",
                    headers:
                        getAuthHeaders()
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logout();

            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete department"
            );

        }


        closeDeleteModal();


        await loadDepartments();


        showToast(
            "success",
            "Deleted",
            "Department deleted successfully."
        );

    }
    catch (error) {

        console.error(
            "Delete Department Error:",
            error
        );


        showToast(
            "error",
            "Delete Failed",
            error.message ||
            "Unable to delete department."
        );

    }

}


/* =====================================================
   HEAD MODAL
===================================================== */

function openHeadModal(
    id
) {

    const department =
        departments.find(
            item =>
                item._id === id
        );


    if (!department) {

        showToast(
            "error",
            "Error",
            "Department not found."
        );

        return;

    }


    setValue(
        "headDepartmentId",
        department._id
    );


    setText(
        "headDepartmentName",
        department.name
    );


    const select =
        document.getElementById(
            "departmentHeadSelect"
        );


    if (!select) {

        return;

    }


    const departmentEmployees =
        employees.filter(
            employee =>
                String(
                    employee.department ||
                    ""
                ).toLowerCase() ===
                String(
                    department.name ||
                    ""
                ).toLowerCase()
        );


    select.innerHTML = `
        <option value="">
            No Department Head
        </option>
    `;


    departmentEmployees.forEach(
        employee => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                employee._id;


            option.textContent =
                `${employee.name} - ${
                    employee.designation ||
                    "Employee"
                }`;


            select.appendChild(
                option
            );

        }
    );


    if (
        department.head &&
        department.head._id
    ) {

        select.value =
            department.head._id;

    }
    else {

        select.value =
            "";

    }


    updateHeadPreview();


    showModal(
        "headModal"
    );

}


function updateHeadPreview() {

    const select =
        document.getElementById(
            "departmentHeadSelect"
        );


    const preview =
        document.getElementById(
            "headPreview"
        );


    if (
        !select ||
        !preview
    ) {

        return;

    }


    const selectedId =
        select.value;


    if (!selectedId) {

        preview.textContent =
            "No department head selected.";


        preview.classList.remove(
            "active"
        );


        return;

    }


    const employee =
        employees.find(
            item =>
                item._id ===
                selectedId
        );


    if (!employee) {

        preview.textContent =
            "Employee not found.";


        preview.classList.remove(
            "active"
        );


        return;

    }


    preview.innerHTML = `
        <strong>
            ${escapeHTML(
                employee.name
            )}
        </strong>

        <br>

        <span>
            ${escapeHTML(
                employee.designation ||
                "Employee"
            )}
        </span>

        <br>

        <span>
            ${escapeHTML(
                employee.email ||
                ""
            )}
        </span>
    `;


    preview.classList.add(
        "active"
    );

}


async function saveDepartmentHead() {

    const departmentId =
        document.getElementById(
            "headDepartmentId"
        )?.value;


    const head =
        document.getElementById(
            "departmentHeadSelect"
        )?.value;


    if (!departmentId) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/departments/${departmentId}/head`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify({
                            head:
                                head || null
                        })
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logout();

            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update department head"
            );

        }


        closeHeadModal();


        await loadDepartments();


        showToast(
            "success",
            "Success",
            "Department head updated successfully."
        );

    }
    catch (error) {

        console.error(
            "Save Head Error:",
            error
        );


        showToast(
            "error",
            "Error",
            error.message ||
            "Unable to update department head."
        );

    }

}


/* =====================================================
   VIEW EMPLOYEES
===================================================== */

async function openEmployeesModal(
    id
) {

    try {

        showModal(
            "employeesModal"
        );


        setText(
            "employeesModalTitle",
            "Department Employees"
        );


        setText(
            "employeesModalSubtitle",
            "Loading..."
        );


        const response =
            await fetch(
                `${API_URL}/departments/${id}`,
                {
                    method: "GET",
                    headers:
                        getAuthHeaders()
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logout();

            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load department"
            );

        }


        const department =
            data.department;


        const departmentEmployees =
            Array.isArray(
                data.employees
            )
                ? data.employees
                : [];


        setText(
            "employeesModalTitle",
            department?.name ||
            "Department Employees"
        );


        setText(
            "employeesModalSubtitle",
            department?.description ||
            "Employees in this department"
        );


        renderEmployeesSummary(
            department,
            departmentEmployees
        );


        renderEmployeeList(
            departmentEmployees
        );

    }
    catch (error) {

        console.error(
            "Open Employees Error:",
            error
        );


        showToast(
            "error",
            "Error",
            error.message ||
            "Unable to load employees."
        );


        closeEmployeesModal();

    }

}


function renderEmployeesSummary(
    department,
    departmentEmployees
) {

    const container =
        document.getElementById(
            "employeesDepartmentSummary"
        );


    if (!container) {

        return;

    }


    const totalSalary =
        departmentEmployees.reduce(
            (
                total,
                employee
            ) => {

                return (
                    total +
                    Number(
                        employee.salary ||
                        0
                    )
                );

            },
            0
        );


    const headName =
        department?.head?.name ||
        "Not Assigned";


    container.innerHTML = `

        <div class="summary-item">

            <span>
                Department Head
            </span>

            <strong>
                ${escapeHTML(
                    headName
                )}
            </strong>

        </div>


        <div class="summary-item">

            <span>
                Employees
            </span>

            <strong>
                ${departmentEmployees.length}
            </strong>

        </div>


        <div class="summary-item">

            <span>
                Total Salary
            </span>

            <strong>
                ${formatCurrency(
                    totalSalary
                )}
            </strong>

        </div>

    `;

}


function renderEmployeeList(
    list
) {

    const tableBody =
        document.getElementById(
            "employeesTableBody"
        );


    if (!tableBody) {

        return;

    }


    if (
        list.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="empty-state"
                >

                    <div class="empty-state-icon">
                        👥
                    </div>

                    <h3>
                        No employees
                    </h3>

                    <p>
                        No employees are assigned to this department.
                    </p>

                </td>

            </tr>
        `;

        return;

    }


    tableBody.innerHTML =
        list
            .map(
                employee => {

                    return `
                        <tr>

                            <td>

                                <div class="head-info">

                                    <div class="avatar">
                                        ${getInitials(
                                            employee.name
                                        )}
                                    </div>

                                    <div>

                                        <div class="head-name">
                                            ${escapeHTML(
                                                employee.name ||
                                                "-"
                                            )}
                                        </div>

                                    </div>

                                </div>

                            </td>


                            <td>
                                ${escapeHTML(
                                    employee.email ||
                                    "-"
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    employee.designation ||
                                    "-"
                                )}
                            </td>


                            <td>
                                ${formatCurrency(
                                    employee.salary ||
                                    0
                                )}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


/* =====================================================
   DEPARTMENT DETAILS
===================================================== */

async function openDepartmentDetails(
    id
) {

    try {

        showModal(
            "departmentDetailsModal"
        );


        setText(
            "detailsDepartmentName",
            "Loading..."
        );


        setText(
            "detailsDepartmentDescription",
            "Loading department information..."
        );


        const response =
            await fetch(
                `${API_URL}/departments/${id}`,
                {
                    method: "GET",
                    headers:
                        getAuthHeaders()
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logout();

            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load department details"
            );

        }


        const department =
            data.department;


        const departmentEmployees =
            Array.isArray(
                data.employees
            )
                ? data.employees
                : [];


        const employeeCount =
            Number(
                data.employeeCount ||
                departmentEmployees.length ||
                0
            );


        const totalSalary =
            Number(
                data.totalSalary ||
                departmentEmployees.reduce(
                    (
                        total,
                        employee
                    ) => {

                        return (
                            total +
                            Number(
                                employee.salary ||
                                0
                            )
                        );

                    },
                    0
                )
            );


        const averageSalary =
            employeeCount > 0
                ? totalSalary /
                    employeeCount
                : 0;


        setText(
            "detailsDepartmentName",
            department?.name ||
            "-"
        );


        setText(
            "detailsDepartmentDescription",
            department?.description ||
            "No description available."
        );


        setText(
            "detailsHeadName",
            department?.head?.name ||
            "Not Assigned"
        );


        setText(
            "detailsHeadDesignation",
            department?.head?.designation ||
            ""
        );


        setText(
            "detailsEmployeeCount",
            employeeCount
        );


        setText(
            "detailsTotalSalary",
            formatCurrency(
                totalSalary
            )
        );


        setText(
            "detailsAverageSalary",
            formatCurrency(
                averageSalary
            )
        );


        setText(
            "detailsStatus",
            department?.status ||
            "-"
        );


        setText(
            "detailsCreated",
            formatDate(
                department?.createdAt
            )
        );

    }
    catch (error) {

        console.error(
            "Department Details Error:",
            error
        );


        showToast(
            "error",
            "Error",
            error.message ||
            "Unable to load department details."
        );


        closeDepartmentDetailsModal();

    }

}


/* =====================================================
   RESET FILTERS
===================================================== */

function resetFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    if (searchInput) {

        searchInput.value = "";

    }


    if (statusFilter) {

        statusFilter.value =
            "all";

    }


    currentSort = {
        field: null,
        direction: "asc"
    };


    updateSortArrow();

    updateSearchUI();

    renderDepartments();

}


/* =====================================================
   MODALS
===================================================== */

function showModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


function hideModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );


    const anyOpenModal =
        document.querySelector(
            ".modal-overlay.show"
        );


    if (!anyOpenModal) {

        document.body.style.overflow =
            "";

    }

}


function closeDepartmentModal() {

    hideModal(
        "departmentModal"
    );

}


function closeHeadModal() {

    hideModal(
        "headModal"
    );

}


function closeEmployeesModal() {

    hideModal(
        "employeesModal"
    );

}


function closeDepartmentDetailsModal() {

    hideModal(
        "departmentDetailsModal"
    );

}


document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {

            hideModal(
                event.target.id
            );

        }

    }
);


/* =====================================================
   TOAST
===================================================== */

function showToast(
    type,
    title,
    message
) {

    let container =
        document.getElementById(
            "toastContainer"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );


        container.id =
            "toastContainer";


        container.className =
            "toast-container";


        document.body.appendChild(
            container
        );

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type || ""}`;


    let icon = "ℹ️";


    if (
        type === "success"
    ) {

        icon = "✅";

    }
    else if (
        type === "error"
    ) {

        icon = "❌";

    }
    else if (
        type === "warning"
    ) {

        icon = "⚠️";

    }


    toast.innerHTML = `

        <div class="toast-icon">
            ${icon}
        </div>

        <div class="toast-content">

            <div class="toast-title">
                ${escapeHTML(
                    title ||
                    "Notification"
                )}
            </div>

            <div class="toast-message">
                ${escapeHTML(
                    message ||
                    ""
                )}
            </div>

        </div>

        <button
            type="button"
            class="toast-close"
        >
            ×
        </button>

    `;


    const closeButton =
        toast.querySelector(
            ".toast-close"
        );


    closeButton.addEventListener(
        "click",
        () => {

            removeToast(
                toast
            );

        }
    );


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            removeToast(
                toast
            );

        },
        4000
    );

}


function removeToast(
    toast
) {

    if (
        !toast ||
        !toast.parentNode
    ) {

        return;

    }


    toast.classList.add(
        "toast-hide"
    );


    setTimeout(
        () => {

            if (
                toast.parentNode
            ) {

                toast.parentNode.removeChild(
                    toast
                );

            }

        },
        250
    );

}


/* =====================================================
   HELPERS
===================================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ?? "";

    }

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value ?? "";

    }

}


function formatCurrency(
    value
) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    );

}


function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function getInitials(
    name
) {

    if (!name) {

        return "?";

    }


    const parts =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        parts.length === 1
    ) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[
            parts.length - 1
        ][0]
    ).toUpperCase();

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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