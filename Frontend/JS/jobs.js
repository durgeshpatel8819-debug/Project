console.log("JOBS JS LOADED");

const JOB_API = "http://localhost:5000/api/jobs";

const jobToken = localStorage.getItem("token");
const jobUserData = localStorage.getItem("user");

let jobUser = null;
let jobs = [];
let editJobId = null;

try {
    jobUser = JSON.parse(jobUserData);
} catch (error) {
    console.error("User data error:", error);
}

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function canManageJobs() {
    return (
        jobUser &&
        (
            jobUser.role === "admin" ||
            jobUser.role === "hr"
        )
    );
}

function setupRoleAccess() {
    const addJobButton = document.querySelector(
        'button[type="submit"]'
    );

    if (!canManageJobs() && addJobButton) {
        addJobButton.style.display = "none";
    }
}

async function loadJobs() {
    console.log("Loading jobs...");

    const table = document.getElementById("jobTableBody");

    if (!table) {
        console.error("jobTableBody not found");
        return;
    }

    try {
        table.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    Loading jobs...
                </td>
            </tr>
        `;

        const response = await fetch(JOB_API, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jobToken}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        console.log("Jobs API Status:", response.status);
        console.log("Jobs API Data:", data);

        if (!response.ok) {
            table.innerHTML = `
                <tr>
                    <td colspan="8" class="no-data">
                        ${escapeHTML(
                            data.message ||
                            "Unable to load jobs"
                        )}
                    </td>
                </tr>
            `;
            return;
        }

        jobs = Array.isArray(data.jobs)
            ? data.jobs
            : [];

        displayJobs(jobs);

    } catch (error) {
        console.error("Load Jobs Error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    Server connection failed
                </td>
            </tr>
        `;
    }
}

function displayJobs(jobList) {
    const table = document.getElementById("jobTableBody");

    if (!table) {
        return;
    }

    if (!jobList.length) {
        table.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    No jobs found
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = jobList.map(job => {

        const salary = Number(job.salary || 0);

        const description =
            job.description || "";

        return `
            <tr>
                <td>
                    ${escapeHTML(job.title)}
                </td>

                <td>
                    ${escapeHTML(job.department)}
                </td>

                <td>
                    ${escapeHTML(job.location)}
                </td>

                <td>
                    ${escapeHTML(job.jobType)}
                </td>

                <td>
                    ₹${salary.toLocaleString("en-IN")}
                </td>

                <td>
                    <span class="status-badge">
                        ${escapeHTML(job.status)}
                    </span>
                </td>

                <td>
                    ${escapeHTML(description)}
                </td>

                <td>
                    ${
                        canManageJobs()
                        ? `
                            <button
                                type="button"
                                onclick="editJob('${job._id}')"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onclick="deleteJob('${job._id}')"
                            >
                                Delete
                            </button>
                        `
                        : "View Only"
                    }
                </td>
            </tr>
        `;
    }).join("");
}

async function addOrUpdateJob(event) {
    event.preventDefault();

    if (!canManageJobs()) {
        alert(
            "You do not have permission to manage jobs."
        );
        return;
    }

    const title =
        document.getElementById("title").value.trim();

    const department =
        document.getElementById("department").value.trim();

    const location =
        document.getElementById("location").value.trim();

    const jobType =
        document.getElementById("jobType").value;

    const status =
        document.getElementById("status").value;

    const salary =
        document.getElementById("salary").value;

    const description =
        document.getElementById("description")
            .value.trim();

    const requirements =
        document.getElementById("requirements")
            .value.trim();

    if (
        !title ||
        !department ||
        !location ||
        !jobType ||
        !salary ||
        !description ||
        !requirements
    ) {
        alert("Please fill all job fields.");
        return;
    }

    const jobData = {
        title,
        department,
        location,
        jobType,
        status,
        salary: Number(salary),
        description,
        requirements
    };

    console.log("Sending Job Data:", jobData);

    try {
        const url = editJobId
            ? `${JOB_API}/${editJobId}`
            : JOB_API;

        const method = editJobId
            ? "PUT"
            : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Authorization": `Bearer ${jobToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jobData)
        });

        const data = await response.json();

        console.log(
            "Save Job Status:",
            response.status
        );

        console.log(
            "Save Job Response:",
            data
        );

        if (!response.ok) {
            alert(
                data.message ||
                "Operation failed"
            );
            return;
        }

        alert(
            editJobId
                ? "Job updated successfully"
                : "Job added successfully"
        );

        resetJobForm();

        await loadJobs();

    } catch (error) {
        console.error(
            "Save Job Error:",
            error
        );

        alert("Server connection failed");
    }
}

function editJob(id) {
    const job = jobs.find(
        item => item._id === id
    );

    if (!job) {
        alert("Job not found");
        return;
    }

    document.getElementById("title").value =
        job.title || "";

    document.getElementById("department").value =
        job.department || "";

    document.getElementById("location").value =
        job.location || "";

    document.getElementById("jobType").value =
        job.jobType || "Full Time";

    document.getElementById("status").value =
        job.status || "Open";

    document.getElementById("salary").value =
        job.salary || "";

    document.getElementById("description").value =
        job.description || "";

    document.getElementById("requirements").value =
        job.requirements || "";

    editJobId = id;

    const submitButton =
        document.getElementById("submitBtn");

    if (submitButton) {
        submitButton.textContent =
            "Update Job";
    }

    const cancelButton =
        document.getElementById("cancelBtn");

    if (cancelButton) {
        cancelButton.style.display =
            "inline-block";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

async function deleteJob(id) {
    if (!canManageJobs()) {
        alert(
            "You do not have permission to delete jobs."
        );
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `${JOB_API}/${id}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization":
                        `Bearer ${jobToken}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.message ||
                "Unable to delete job"
            );
            return;
        }

        alert(
            "Job deleted successfully"
        );

        await loadJobs();

    } catch (error) {
        console.error(
            "Delete Job Error:",
            error
        );

        alert(
            "Server connection failed"
        );
    }
}

function resetJobForm() {
    const form =
        document.getElementById("jobForm");

    if (form) {
        form.reset();
    }

    editJobId = null;

    const submitButton =
        document.getElementById("submitBtn");

    if (submitButton) {
        submitButton.textContent =
            "Add Job";
    }

    const cancelButton =
        document.getElementById("cancelBtn");

    if (cancelButton) {
        cancelButton.style.display =
            "none";
    }
}

function cancelEdit() {
    resetJobForm();
}

function searchJobs() {
    const searchInput =
        document.getElementById("searchJob");

    if (!searchInput) {
        return;
    }

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();

    const filteredJobs =
        jobs.filter(job =>

            String(job.title || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(job.department || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(job.location || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(job.jobType || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(job.status || "")
                .toLowerCase()
                .includes(searchText)
        );

    displayJobs(filteredJobs);
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href =
        "login.html";
}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Jobs page loaded"
        );

        setupRoleAccess();

        const form =
            document.getElementById("jobForm");

        if (form) {
            form.addEventListener(
                "submit",
                addOrUpdateJob
            );
        }

        const searchInput =
            document.getElementById("searchJob");

        if (searchInput) {
            searchInput.addEventListener(
                "input",
                searchJobs
            );
        }

        loadJobs();
    }
);