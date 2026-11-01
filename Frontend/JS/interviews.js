const INTERVIEW_API = "http://localhost:5000/api";


/* =========================
   AUTH
========================= */

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


/* =========================
   ELEMENTS
========================= */

const interviewForm =
    document.getElementById("interviewForm");

const candidateSelect =
    document.getElementById("candidateId");

const jobSelect =
    document.getElementById("jobId");

const modeSelect =
    document.getElementById("mode");

const meetingLinkGroup =
    document.getElementById("meetingLinkGroup");

const locationGroup =
    document.getElementById("locationGroup");

const meetingLinkInput =
    document.getElementById("meetingLink");

const locationInput =
    document.getElementById("location");

const tableBody =
    document.getElementById("interviewsTableBody");

const refreshBtn =
    document.getElementById("refreshBtn");

const resetBtn =
    document.getElementById("resetBtn");


/* =========================
   HTML ESCAPE
========================= */

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


/* =========================
   AUTH HEADER
========================= */

function getHeaders() {

    return {
        "Content-Type": "application/json",

        "Authorization":
            `Bearer ${token}`
    };
}


/* =========================
   LOAD CANDIDATES
========================= */

async function loadCandidates() {

    try {

        const response = await fetch(
            `${INTERVIEW_API}/candidates`,
            {
                method: "GET",

                headers: getHeaders()
            }
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load candidates"
            );
        }


        const data =
            await response.json();


        candidateSelect.innerHTML = `
            <option value="">
                Select Candidate
            </option>
        `;


        const candidates =
            (data.candidates || [])
                .filter(
                    candidate =>
                        candidate.status === "Interview"
                );


        candidates.forEach(candidate => {

            const option =
                document.createElement("option");


            option.value =
                candidate._id;


            option.textContent =
                `${candidate.name} - ${candidate.email}`;


            candidateSelect.appendChild(
                option
            );

        });


    } catch (error) {

        console.error(
            "Load Candidates Error:",
            error
        );

    }
}


/* =========================
   LOAD JOBS
========================= */

async function loadJobs() {

    try {

        const response = await fetch(
            `${INTERVIEW_API}/jobs`,
            {
                method: "GET",

                headers: getHeaders()
            }
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load jobs"
            );
        }


        const data =
            await response.json();


        jobSelect.innerHTML = `
            <option value="">
                Select Job
            </option>
        `;


        const jobs =
            data.jobs || [];


        jobs.forEach(job => {

            const option =
                document.createElement("option");


            option.value =
                job._id;


            option.textContent =
                job.title;


            jobSelect.appendChild(
                option
            );

        });


    } catch (error) {

        console.error(
            "Load Jobs Error:",
            error
        );

    }
}


/* =========================
   MODE CHANGE
========================= */

modeSelect.addEventListener(
    "change",
    function () {

        const mode =
            modeSelect.value;


        if (mode === "Online") {

            meetingLinkGroup.style.display =
                "flex";

            locationGroup.style.display =
                "none";


            meetingLinkInput.required =
                true;

            locationInput.required =
                false;

            locationInput.value =
                "";

        }

        else if (mode === "Offline") {

            meetingLinkGroup.style.display =
                "none";

            locationGroup.style.display =
                "flex";


            meetingLinkInput.required =
                false;

            locationInput.required =
                true;

            meetingLinkInput.value =
                "";

        }

        else {

            meetingLinkGroup.style.display =
                "none";

            locationGroup.style.display =
                "none";


            meetingLinkInput.required =
                false;

            locationInput.required =
                false;

        }

    }
);


/* =========================
   SCHEDULE INTERVIEW
========================= */

interviewForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const candidateId =
            candidateSelect.value;


        const jobId =
            jobSelect.value;


        const interviewer =
            document
                .getElementById("interviewer")
                .value
                .trim();


        const interviewDate =
            document
                .getElementById("interviewDate")
                .value;


        const mode =
            modeSelect.value;


        const meetingLink =
            meetingLinkInput.value
                .trim();


        const location =
            locationInput.value
                .trim();


        if (
            !candidateId ||
            !jobId ||
            !interviewer ||
            !interviewDate ||
            !mode
        ) {

            alert(
                "Please fill all required fields"
            );

            return;
        }


        if (
            mode === "Online" &&
            !meetingLink
        ) {

            alert(
                "Meeting link is required for online interview"
            );

            return;
        }


        if (
            mode === "Offline" &&
            !location
        ) {

            alert(
                "Location is required for offline interview"
            );

            return;
        }


        const requestBody = {

            candidateId,

            jobId,

            interviewer,

            interviewDate,

            mode,

            meetingLink:
                mode === "Online"
                    ? meetingLink
                    : "",

            location:
                mode === "Offline"
                    ? location
                    : ""

        };


        try {

            const response =
                await fetch(
                    `${INTERVIEW_API}/interviews`,
                    {
                        method: "POST",

                        headers:
                            getHeaders(),

                        body:
                            JSON.stringify(
                                requestBody
                            )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Unable to schedule interview"
                );

                return;
            }


            alert(
                "Interview scheduled successfully"
            );


            interviewForm.reset();


            meetingLinkGroup.style.display =
                "none";

            locationGroup.style.display =
                "none";


            meetingLinkInput.required =
                false;

            locationInput.required =
                false;


            await loadInterviews();


        } catch (error) {

            console.error(
                "Schedule Interview Error:",
                error
            );


            alert(
                "Server connection error"
            );

        }

    }
);


/* =========================
   LOAD INTERVIEWS
========================= */

async function loadInterviews() {

    try {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-state"
                >
                    Loading interviews...
                </td>
            </tr>
        `;


        const response =
            await fetch(
                `${INTERVIEW_API}/interviews`,
                {
                    method: "GET",

                    headers:
                        getHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load interviews"
            );
        }


        const data =
            await response.json();


        const interviews =
            data.interviews || [];


        updateStats(interviews);


        if (interviews.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="empty-state"
                    >
                        No interviews found
                    </td>
                </tr>
            `;

            return;
        }


        tableBody.innerHTML = "";


        interviews.forEach(
            interview => {

                const row =
                    document.createElement("tr");


                const candidate =
                    interview.candidateId;


                const job =
                    interview.jobId;


                const candidateName =
                    candidate?.name ||
                    "Unknown Candidate";


                const jobTitle =
                    job?.title ||
                    "Unknown Job";


                const interviewer =
                    interview.interviewer ||
                    "-";


                const date =
                    formatDate(
                        interview.interviewDate
                    );


                const mode =
                    interview.mode ||
                    "-";


                const status =
                    interview.status ||
                    "Scheduled";


                const result =
                    interview.result ||
                    "Pending";


                const meetingLink =
                    interview.meetingLink ||
                    "";


                const location =
                    interview.location ||
                    "";


                let meetingButton =
                    "";


                if (
                    mode === "Online" &&
                    meetingLink
                ) {

                    meetingButton = `
                        <a
                            href="${escapeHTML(meetingLink)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="action-btn join-btn"
                        >
                            Join Meeting
                        </a>
                    `;

                }


                let modeDetails =
                    "";


                if (
                    mode === "Offline" &&
                    location
                ) {

                    modeDetails = `
                        <div class="location-text">
                            ${escapeHTML(location)}
                        </div>
                    `;

                }


                row.innerHTML = `

                    <td>
                        <strong>
                            ${escapeHTML(candidateName)}
                        </strong>
                    </td>


                    <td>
                        ${escapeHTML(jobTitle)}
                    </td>


                    <td>
                        ${escapeHTML(interviewer)}
                    </td>


                    <td>
                        ${escapeHTML(date)}
                    </td>


                    <td>

                        <div
                            class="${
                                mode === "Online"
                                    ? "mode-online"
                                    : "mode-offline"
                            }"
                        >
                            ${escapeHTML(mode)}
                        </div>

                        ${modeDetails}

                    </td>


                    <td>

                        <span
                            class="status-badge
                            ${
                                status === "Scheduled"
                                    ? "status-scheduled"
                                    : status === "Completed"
                                        ? "status-completed"
                                        : "status-cancelled"
                            }"
                        >
                            ${escapeHTML(status)}
                        </span>

                    </td>


                    <td>

                        <span
                            class="result-badge
                            ${
                                result === "Pending"
                                    ? "result-pending"
                                    : result === "Selected"
                                        ? "result-selected"
                                        : "result-rejected"
                            }"
                        >
                            ${escapeHTML(result)}
                        </span>

                    </td>


                    <td>

                        <div class="actions-container">

                            ${
                                meetingButton
                            }


                            <div class="action-row">

                                <select
                                    class="action-select"
                                    onchange="
                                        updateInterviewStatus(
                                            '${interview._id}',
                                            this.value
                                        )
                                    "
                                >

                                    <option value="">
                                        Status
                                    </option>

                                    <option
                                        value="Scheduled"
                                        ${
                                            status === "Scheduled"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Scheduled
                                    </option>

                                    <option
                                        value="Completed"
                                        ${
                                            status === "Completed"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Completed
                                    </option>

                                    <option
                                        value="Cancelled"
                                        ${
                                            status === "Cancelled"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Cancelled
                                    </option>

                                </select>


                                <select
                                    class="action-select"
                                    onchange="
                                        updateInterviewResult(
                                            '${interview._id}',
                                            this.value
                                        )
                                    "
                                >

                                    <option value="">
                                        Result
                                    </option>

                                    <option
                                        value="Pending"
                                        ${
                                            result === "Pending"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Pending
                                    </option>

                                    <option
                                        value="Selected"
                                        ${
                                            result === "Selected"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Selected
                                    </option>

                                    <option
                                        value="Rejected"
                                        ${
                                            result === "Rejected"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Rejected
                                    </option>

                                </select>

                            </div>


                            <div class="action-row">

                                <button
                                    type="button"
                                    class="action-btn feedback-btn"
                                    onclick="
                                        addFeedback(
                                            '${interview._id}'
                                        )
                                    "
                                >
                                    Feedback
                                </button>


                                <button
                                    type="button"
                                    class="action-btn delete-btn"
                                    onclick="
                                        deleteInterview(
                                            '${interview._id}'
                                        )
                                    "
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Load Interviews Error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-state"
                >
                    Unable to load interviews
                </td>
            </tr>
        `;

    }
}


/* =========================
   DATE FORMAT
========================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return "-";
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit",

            hour12: true
        }
    );

}


/* =========================
   UPDATE STATUS
========================= */

async function updateInterviewStatus(
    interviewId,
    status
) {

    if (!status) {
        return;
    }


    try {

        const response =
            await fetch(
                `${INTERVIEW_API}/interviews/${interviewId}/status`,
                {
                    method: "PUT",

                    headers:
                        getHeaders(),

                    body:
                        JSON.stringify({
                            status
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to update status"
            );

            return;
        }


        await loadInterviews();


    } catch (error) {

        console.error(
            "Update Status Error:",
            error
        );


        alert(
            "Server connection error"
        );

    }
}


/* =========================
   UPDATE RESULT
========================= */

async function updateInterviewResult(
    interviewId,
    result
) {

    if (!result) {
        return;
    }


    try {

        const response =
            await fetch(
                `${INTERVIEW_API}/interviews/${interviewId}/result`,
                {
                    method: "PUT",

                    headers:
                        getHeaders(),

                    body:
                        JSON.stringify({
                            result
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to update result"
            );

            return;
        }


        await loadInterviews();


    } catch (error) {

        console.error(
            "Update Result Error:",
            error
        );


        alert(
            "Server connection error"
        );

    }
}


/* =========================
   FEEDBACK
========================= */

async function addFeedback(
    interviewId
) {

    const feedback =
        prompt(
            "Enter interview feedback:"
        );


    if (
        feedback === null
    ) {
        return;
    }


    const cleanFeedback =
        feedback.trim();


    if (!cleanFeedback) {

        alert(
            "Feedback cannot be empty"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${INTERVIEW_API}/interviews/${interviewId}/result`,
                {
                    method: "PUT",

                    headers:
                        getHeaders(),

                    body:
                        JSON.stringify({
                            feedback:
                                cleanFeedback
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to save feedback"
            );

            return;
        }


        alert(
            "Feedback saved successfully"
        );


        await loadInterviews();


    } catch (error) {

        console.error(
            "Feedback Error:",
            error
        );


        alert(
            "Server connection error"
        );

    }
}


/* =========================
   DELETE INTERVIEW
========================= */

async function deleteInterview(
    interviewId
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this interview?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${INTERVIEW_API}/interviews/${interviewId}`,
                {
                    method: "DELETE",

                    headers:
                        getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to delete interview"
            );

            return;
        }


        alert(
            "Interview deleted successfully"
        );


        await loadInterviews();


    } catch (error) {

        console.error(
            "Delete Interview Error:",
            error
        );


        alert(
            "Server connection error"
        );

    }
}


/* =========================
   UPDATE STATS
========================= */

function updateStats(
    interviews
) {

    const total =
        interviews.length;


    const scheduled =
        interviews.filter(
            interview =>
                interview.status === "Scheduled"
        ).length;


    const completed =
        interviews.filter(
            interview =>
                interview.status === "Completed"
        ).length;


    const selected =
        interviews.filter(
            interview =>
                interview.result === "Selected"
        ).length;


    document.getElementById(
        "totalInterviews"
    ).textContent =
        total;


    document.getElementById(
        "scheduledInterviews"
    ).textContent =
        scheduled;


    document.getElementById(
        "completedInterviews"
    ).textContent =
        completed;


    document.getElementById(
        "selectedInterviews"
    ).textContent =
        selected;

}


/* =========================
   RESET FORM
========================= */

resetBtn.addEventListener(
    "click",
    function () {

        interviewForm.reset();


        meetingLinkGroup.style.display =
            "none";


        locationGroup.style.display =
            "none";


        meetingLinkInput.required =
            false;


        locationInput.required =
            false;

    }
);


/* =========================
   REFRESH
========================= */

refreshBtn.addEventListener(
    "click",
    async function () {

        await loadCandidates();

        await loadJobs();

        await loadInterviews();

    }
);


/* =========================
   INITIAL LOAD
========================= */

async function initializePage() {

    await loadCandidates();

    await loadJobs();

    await loadInterviews();

}


initializePage();