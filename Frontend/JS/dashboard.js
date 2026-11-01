(function () {

    const DASHBOARD_API = "http://localhost:5000/api";

    let token = localStorage.getItem("token");
    let userData = localStorage.getItem("user");

    if (!token || !userData) {
        window.location.href = "login.html";
        return;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error("User data error:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "login.html";
        return;
    }


    function loadUserInfo() {

        const name = user?.name || "User";
        const role = user?.role || "employee";

        const profileName = document.getElementById("profileName");
        const profileRole = document.getElementById("profileRole");
        const profileAvatar = document.getElementById("profileAvatar");
        const welcomeTitle = document.getElementById("welcomeTitle");

        if (profileName) {
            profileName.textContent = name;
        }

        if (profileRole) {
            profileRole.textContent =
                role.charAt(0).toUpperCase() +
                role.slice(1);
        }

        if (profileAvatar) {
            profileAvatar.textContent =
                name.charAt(0).toUpperCase();
        }

        if (welcomeTitle) {
            const firstName = name.split(" ")[0];

            welcomeTitle.textContent =
                "Welcome back, " +
                firstName +
                "! 👋";
        }
    }


    function loadDate() {

        const dateElement =
            document.getElementById("currentDate");

        if (!dateElement) {
            return;
        }

        const today = new Date();

        dateElement.textContent =
            today.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
    }


    function formatNumber(value) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "0";
        }

        return number.toLocaleString("en-IN");
    }


    function formatCurrency(value) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "₹0";
        }

        return "₹" +
            number.toLocaleString("en-IN");
    }


    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }


    function setWidth(id, percentage) {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        let value = Number(percentage);

        if (!Number.isFinite(value)) {
            value = 0;
        }

        value = Math.min(
            Math.max(value, 0),
            100
        );

        element.style.width =
            value + "%";
    }


    async function loadDashboard() {

        const apiUrl =
            DASHBOARD_API +
            "/dashboard/stats";

        console.log(
            "Dashboard API:",
            apiUrl
        );

        console.log(
            "Dashboard Token Exists:",
            !!token
        );

        try {

            const response =
                await fetch(
                    apiUrl,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " + token,

                            "Content-Type":
                                "application/json"
                        }
                    }
                );

            console.log(
                "Dashboard HTTP Status:",
                response.status
            );

            const responseText =
                await response.text();

            let data = {};

            if (responseText) {

                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                } catch (error) {

                    console.error(
                        "Dashboard JSON Parse Error:",
                        error
                    );

                    console.error(
                        "Raw API Response:",
                        responseText
                    );

                    data = {};
                }
            }

            console.log(
                "Dashboard Response:",
                data
            );

            if (response.status === 401) {

                console.error(
                    "Dashboard authentication failed"
                );

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href =
                    "login.html";

                return;
            }

            if (!response.ok) {

                console.error(
                    "Dashboard API Error:",
                    data
                );

                clearDashboard();

                return;
            }

            if (
                !data ||
                typeof data !== "object"
            ) {

                console.error(
                    "Invalid dashboard data"
                );

                clearDashboard();

                return;
            }

            updateDashboard(data);

        } catch (error) {

            console.error(
                "Dashboard Fetch Error:",
                error
            );

            clearDashboard();

        }
    }


    function updateDashboard(data) {

        console.log(
            "Updating Dashboard with:",
            data
        );


        /*
        ==========================
        MAIN STATISTICS
        ==========================
        */

        setText(
            "totalEmployees",
            formatNumber(
                data.totalEmployees
            )
        );

        setText(
            "totalJobs",
            formatNumber(
                data.totalJobs
            )
        );

        setText(
            "totalCandidates",
            formatNumber(
                data.totalCandidates
            )
        );

        setText(
            "totalPayroll",
            formatCurrency(
                data.totalPayroll
            )
        );


        /*
        ==========================
        EMPLOYEE OVERVIEW
        ==========================
        */

        setText(
            "employeeCircle",
            formatNumber(
                data.totalEmployees
            )
        );

        setText(
            "overviewEmployees",
            formatNumber(
                data.totalEmployees
            )
        );

        const activeEmployees =
            data.activeEmployees !== undefined
                ? data.activeEmployees
                : data.totalEmployees;

        setText(
            "activeEmployees",
            formatNumber(
                activeEmployees
            )
        );

        setText(
            "overviewLeaves",
            formatNumber(
                data.pendingLeaves
            )
        );


        /*
        ==========================
        HR SUMMARY
        ==========================
        */

        setText(
            "totalInterviews",
            formatNumber(
                data.totalInterviews
            )
        );

        setText(
            "summaryLeaves",
            formatNumber(
                data.pendingLeaves
            )
        );

        setText(
            "summaryPayroll",
            formatNumber(
                data.totalPayrollRecords
            )
        );

        setText(
            "summaryNotifications",
            formatNumber(
                data.unreadNotifications
            )
        );


        /*
        ==========================
        RECRUITMENT
        ==========================
        */

        updateRecruitment(
            data.candidateStatus,
            data.analytics
        );


        /*
        ==========================
        HR ANALYTICS
        ==========================
        */

        updateAnalytics(
            data.analytics,
            data.candidateStatus
        );


        /*
        ==========================
        NOTIFICATIONS
        ==========================
        */

        updateNotificationBadge(
            data.unreadNotifications
        );


        /*
        ==========================
        RECENT ACTIVITY
        ==========================
        */

        loadActivities(
            data.recentActivity
        );
    }


    /*
    =========================================
    RECRUITMENT FIX
    =========================================
    */

    function updateRecruitment(
        candidateStatus,
        analytics
    ) {

        let applied = 0;
        let shortlisted = 0;
        let interview = 0;
        let selected = 0;


        /*
        -------------------------------------
        CASE 1:
        candidateStatus is an array
        -------------------------------------
        */

        if (Array.isArray(candidateStatus)) {

            candidateStatus.forEach(
                function (item) {

                    const status =
                        String(
                            item?._id ??
                            item?.status ??
                            ""
                        )
                            .toLowerCase()
                            .trim();

                    const count =
                        Number(
                            item?.count ??
                            item?.total ??
                            0
                        );


                    if (
                        status === "applied"
                    ) {
                        applied += count;
                    }


                    if (
                        status === "shortlisted"
                    ) {
                        shortlisted += count;
                    }


                    if (
                        status === "interview" ||
                        status === "interview scheduled"
                    ) {
                        interview += count;
                    }


                    if (
                        status === "selected" ||
                        status === "hired"
                    ) {
                        selected += count;
                    }
                }
            );
        }


        /*
        -------------------------------------
        CASE 2:
        candidateStatus is an object
        -------------------------------------
        */

        else if (
            candidateStatus &&
            typeof candidateStatus === "object"
        ) {

            applied =
                Number(
                    candidateStatus.applied ??
                    candidateStatus.Applied ??
                    0
                );

            shortlisted =
                Number(
                    candidateStatus.shortlisted ??
                    candidateStatus.Shortlisted ??
                    0
                );

            interview =
                Number(
                    candidateStatus.interview ??
                    candidateStatus.Interview ??
                    candidateStatus.interviewScheduled ??
                    0
                );

            selected =
                Number(
                    candidateStatus.selected ??
                    candidateStatus.Selected ??
                    candidateStatus.hired ??
                    0
                );
        }


        /*
        -------------------------------------
        CASE 3:
        Use analytics recruitment as fallback
        -------------------------------------
        */

        const recruitment =
            analytics?.recruitment || {};


        if (applied === 0) {

            applied =
                Number(
                    recruitment.applied ??
                    recruitment.totalApplied ??
                    0
                );
        }


        if (shortlisted === 0) {

            shortlisted =
                Number(
                    recruitment.shortlisted ??
                    recruitment.totalShortlisted ??
                    0
                );
        }


        if (interview === 0) {

            interview =
                Number(
                    recruitment.interview ??
                    recruitment.totalInterview ??
                    recruitment.interviews ??
                    0
                );
        }


        if (selected === 0) {

            selected =
                Number(
                    recruitment.selected ??
                    recruitment.totalSelected ??
                    0
                );
        }


        /*
        -------------------------------------
        UPDATE RECRUITMENT CARD
        -------------------------------------
        */

        setText(
            "appliedCount",
            formatNumber(applied)
        );

        setText(
            "shortlistedCount",
            formatNumber(shortlisted)
        );

        setText(
            "interviewCount",
            formatNumber(interview)
        );

        setText(
            "selectedCount",
            formatNumber(selected)
        );


        updateRecruitmentProgress(
            applied,
            shortlisted,
            interview,
            selected
        );
    }


    function updateRecruitmentProgress(
        applied,
        shortlisted,
        interview,
        selected
    ) {

        const values = [
            applied,
            shortlisted,
            interview,
            selected
        ];

        const maximum =
            Math.max(
                ...values,
                1
            );


        setWidth(
            "appliedBar",
            (applied / maximum) * 100
        );

        setWidth(
            "shortlistedBar",
            (shortlisted / maximum) * 100
        );

        setWidth(
            "interviewBar",
            (interview / maximum) * 100
        );

        setWidth(
            "selectedBar",
            (selected / maximum) * 100
        );
    }


    /*
    =========================================
    HR ANALYTICS
    =========================================
    */

    function updateAnalytics(
        analytics,
        candidateStatus
    ) {

        console.log(
            "Analytics Data:",
            analytics
        );


        if (
            !analytics ||
            typeof analytics !== "object"
        ) {

            console.warn(
                "No analytics data received"
            );

            clearAnalytics();

            return;
        }


        /*
        ==========================
        ATTENDANCE
        ==========================
        */

        const attendance =
            analytics.attendance || {};


        const attendanceRate =
            Number(
                attendance.rate ??
                attendance.attendanceRate ??
                0
            );


        /*
        IMPORTANT:
        Actual dashboard HTML IDs
        */

        setText(
            "analyticsAttendanceRate",
            attendanceRate.toFixed(1) +
            "%"
        );


        setWidth(
            "analyticsAttendanceBar",
            attendanceRate
        );


        const present =
            Number(
                attendance.presentThisMonth ??
                attendance.present ??
                attendance.presentToday ??
                0
            );


        const absent =
            Number(
                attendance.absentThisMonth ??
                attendance.absent ??
                attendance.absentToday ??
                0
            );


        setText(
            "analyticsPresent",
            formatNumber(present)
        );


        setText(
            "analyticsAbsent",
            formatNumber(absent)
        );


        /*
        ==========================
        PAYROLL
        ==========================
        */

        const payroll =
            analytics.payroll || {};


        const payrollAmount =
            payroll.totalAmount ??
            payroll.totalPayroll ??
            0;


        const paidPayroll =
            payroll.paidCount ??
            payroll.paid ??
            0;


        const pendingPayroll =
            payroll.pendingCount ??
            payroll.pending ??
            0;


        setText(
            "analyticsPayrollAmount",
            formatCurrency(
                payrollAmount
            )
        );


        setText(
            "analyticsPaidPayroll",
            formatNumber(
                paidPayroll
            )
        );


        setText(
            "analyticsPendingPayroll",
            formatNumber(
                pendingPayroll
            )
        );


        /*
        ==========================
        LEAVES
        ==========================
        */

        const leaves =
            analytics.leaves || {};


        const totalLeaves =
            Number(
                leaves.total ??
                0
            );


        const approvedLeaves =
            Number(
                leaves.approved ??
                0
            );


        const pendingLeaves =
            Number(
                leaves.pending ??
                0
            );


        const rejectedLeaves =
            Number(
                leaves.rejected ??
                0
            );


        setText(
            "analyticsTotalLeaves",
            formatNumber(
                totalLeaves
            )
        );


        setText(
            "analyticsApprovedLeaves",
            formatNumber(
                approvedLeaves
            )
        );


        setText(
            "analyticsPendingLeaves",
            formatNumber(
                pendingLeaves
            )
        );


        setText(
            "analyticsRejectedLeaves",
            formatNumber(
                rejectedLeaves
            )
        );


        const leavePercentage =
            totalLeaves > 0
                ? (
                    approvedLeaves /
                    totalLeaves
                ) * 100
                : 0;


        setWidth(
            "leaveProgress",
            leavePercentage
        );


        /*
        ==========================
        RECRUITMENT ANALYTICS
        ==========================
        */

        const recruitment =
            analytics.recruitment || {};


        const totalCandidates =
            Number(
                recruitment.totalCandidates ??
                recruitment.total ??
                0
            );


        const applied =
            Number(
                recruitment.applied ??
                recruitment.totalApplied ??
                0
            );


        const shortlisted =
            Number(
                recruitment.shortlisted ??
                recruitment.totalShortlisted ??
                0
            );


        const interview =
            Number(
                recruitment.interview ??
                recruitment.totalInterview ??
                recruitment.interviews ??
                0
            );


        const selected =
            Number(
                recruitment.selected ??
                recruitment.totalSelected ??
                0
            );


        /*
        If backend doesn't provide recruitment
        counts, calculate from candidateStatus.
        */

        let finalApplied = applied;
        let finalShortlisted = shortlisted;
        let finalInterview = interview;
        let finalSelected = selected;


        if (
            Array.isArray(candidateStatus)
        ) {

            let calculatedApplied = 0;
            let calculatedShortlisted = 0;
            let calculatedInterview = 0;
            let calculatedSelected = 0;


            candidateStatus.forEach(
                function (item) {

                    const status =
                        String(
                            item?._id ??
                            item?.status ??
                            ""
                        )
                            .toLowerCase()
                            .trim();

                    const count =
                        Number(
                            item?.count ??
                            item?.total ??
                            0
                        );


                    if (
                        status === "applied"
                    ) {
                        calculatedApplied += count;
                    }


                    if (
                        status === "shortlisted"
                    ) {
                        calculatedShortlisted += count;
                    }


                    if (
                        status === "interview" ||
                        status === "interview scheduled"
                    ) {
                        calculatedInterview += count;
                    }


                    if (
                        status === "selected" ||
                        status === "hired"
                    ) {
                        calculatedSelected += count;
                    }
                }
            );


            if (finalApplied === 0) {
                finalApplied =
                    calculatedApplied;
            }


            if (finalShortlisted === 0) {
                finalShortlisted =
                    calculatedShortlisted;
            }


            if (finalInterview === 0) {
                finalInterview =
                    calculatedInterview;
            }


            if (finalSelected === 0) {
                finalSelected =
                    calculatedSelected;
            }
        }


        setText(
            "analyticsCandidates",
            formatNumber(
                totalCandidates
            )
        );


        setText(
            "analyticsApplied",
            formatNumber(
                finalApplied
            )
        );


        setText(
            "analyticsShortlisted",
            formatNumber(
                finalShortlisted
            )
        );


        setText(
            "analyticsInterview",
            formatNumber(
                finalInterview
            )
        );


        setText(
            "analyticsSelected",
            formatNumber(
                finalSelected
            )
        );


        /*
        ==========================
        DEPARTMENTS
        ==========================
        */

        updateDepartments(
            analytics.departments,
            analytics.departmentDetails
        );
    }


    /*
    =========================================
    DEPARTMENT FIX
    =========================================
    */

    function updateDepartments(
        departments,
        departmentDetails
    ) {

        /*
        IMPORTANT:
        Actual dashboard HTML uses:
        departmentAnalytics
        */

        const container =
            document.getElementById(
                "departmentAnalytics"
            );


        if (!container) {

            console.warn(
                "departmentAnalytics element not found"
            );

            return;
        }


        let departmentData = [];


        /*
        -------------------------------------
        CASE 1:
        analytics.departments
        -------------------------------------
        */

        if (
            Array.isArray(departments)
        ) {

            departmentData =
                departments;
        }


        /*
        -------------------------------------
        CASE 2:
        departmentDetails
        -------------------------------------
        */

        if (
            departmentData.length === 0 &&
            Array.isArray(departmentDetails)
        ) {

            departmentData =
                departmentDetails;
        }


        if (
            departmentData.length === 0
        ) {

            container.innerHTML =
                '<div class="analytics-empty">' +
                'No department analytics available' +
                '</div>';

            return;
        }


        /*
        -------------------------------------
        FIND EMPLOYEE COUNTS
        -------------------------------------
        */

        const normalizedDepartments =
            departmentData.map(
                function (department) {

                    const employees =
                        Array.isArray(
                            department?.employees
                        )
                            ? department.employees
                            : [];


                    let employeeCount =
                        Number(
                            department?.employeeCount ??
                            department?.employeesCount ??
                            department?.count ??
                            0
                        );


                    /*
                    If employeeCount is missing,
                    calculate from employees array.
                    */

                    if (
                        employeeCount === 0 &&
                        employees.length > 0
                    ) {

                        employeeCount =
                            employees.length;
                    }


                    const totalSalary =
                        Number(
                            department?.totalSalary ??
                            department?.salary ??
                            department?.totalPayroll ??
                            0
                        );


                    return {
                        name:
                            department?.name ??
                            department?._id ??
                            "Department",

                        employeeCount:
                            employeeCount,

                        totalSalary:
                            totalSalary
                    };
                }
            );


        /*
        -------------------------------------
        MAX EMPLOYEE COUNT
        -------------------------------------
        */

        const employeeCounts =
            normalizedDepartments.map(
                function (department) {

                    return department.employeeCount;
                }
            );


        const maximumEmployees =
            Math.max(
                ...employeeCounts,
                1
            );


        /*
        -------------------------------------
        RENDER DEPARTMENTS
        -------------------------------------
        */

        container.innerHTML = "";


        normalizedDepartments.forEach(
            function (department) {

                const percentage =
                    (
                        department.employeeCount /
                        maximumEmployees
                    ) * 100;


                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "department-item";


                /*
                Department information
                */

                const nameBox =
                    document.createElement(
                        "div"
                    );

                nameBox.className =
                    "department-info";


                const departmentName =
                    document.createElement(
                        "div"
                    );

                departmentName.className =
                    "department-name";

                departmentName.textContent =
                    department.name;


                const departmentCount =
                    document.createElement(
                        "div"
                    );

                departmentCount.className =
                    "department-count";

                departmentCount.textContent =
                    formatNumber(
                        department.employeeCount
                    ) +
                    " employee" +
                    (
                        department.employeeCount === 1
                            ? ""
                            : "s"
                    );


                nameBox.appendChild(
                    departmentName
                );

                nameBox.appendChild(
                    departmentCount
                );


                /*
                Employee progress
                */

                const progressBox =
                    document.createElement(
                        "div"
                    );

                progressBox.className =
                    "department-progress";


                const progressFill =
                    document.createElement(
                        "div"
                    );

                progressFill.className =
                    "department-progress-fill";

                progressFill.style.width =
                    percentage + "%";


                progressBox.appendChild(
                    progressFill
                );


                /*
                Salary
                */

                const salaryBox =
                    document.createElement(
                        "div"
                    );

                salaryBox.className =
                    "department-salary";


                const salaryAmount =
                    document.createElement(
                        "strong"
                    );

                salaryAmount.textContent =
                    formatCurrency(
                        department.totalSalary
                    );


                const salaryLabel =
                    document.createElement(
                        "span"
                    );

                salaryLabel.textContent =
                    "Total Salary";


                salaryBox.appendChild(
                    salaryAmount
                );

                salaryBox.appendChild(
                    salaryLabel
                );


                /*
                Final department item
                */

                item.appendChild(
                    nameBox
                );

                item.appendChild(
                    progressBox
                );

                item.appendChild(
                    salaryBox
                );


                container.appendChild(
                    item
                );
            }
        );
    }


    /*
    =========================================
    NOTIFICATION BADGE
    =========================================
    */

    function updateNotificationBadge(
        unreadNotifications
    ) {

        const badge =
            document.getElementById(
                "notificationBadge"
            );

        if (!badge) {
            return;
        }

        const count =
            Number(
                unreadNotifications || 0
            );


        if (count > 0) {

            badge.textContent =
                count > 99
                    ? "99+"
                    : count;

            badge.style.display =
                "inline-block";

        } else {

            badge.style.display =
                "none";
        }
    }


    /*
    =========================================
    RECENT ACTIVITY
    =========================================
    */

    function loadActivities(
        activities
    ) {

        const activityList =
            document.getElementById(
                "activityList"
            );

        if (!activityList) {
            return;
        }


        if (
            !Array.isArray(
                activities
            ) ||
            activities.length === 0
        ) {

            activityList.innerHTML =
                '<div class="activity-item">' +
                    '<div class="activity-icon">✨</div>' +
                    '<div class="activity-content">' +
                        '<strong>HRGenius</strong>' +
                        '<span>Dashboard loaded successfully</span>' +
                    '</div>' +
                    '<small>Recently</small>' +
                '</div>';

            return;
        }


        activityList.innerHTML = "";


        activities.forEach(
            function (activity) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "activity-item";


                const icon =
                    document.createElement(
                        "div"
                    );

                icon.className =
                    "activity-icon";

                icon.textContent =
                    getActivityIcon(
                        activity?.type
                    );


                const content =
                    document.createElement(
                        "div"
                    );

                content.className =
                    "activity-content";


                const title =
                    document.createElement(
                        "strong"
                    );

                title.textContent =
                    activity?.title ||
                    "HRGenius";


                const description =
                    document.createElement(
                        "span"
                    );

                description.textContent =
                    activity?.description ||
                    "System activity";


                content.appendChild(
                    title
                );

                content.appendChild(
                    description
                );


                const time =
                    document.createElement(
                        "small"
                    );

                time.textContent =
                    formatActivityDate(
                        activity?.date
                    );


                item.appendChild(
                    icon
                );

                item.appendChild(
                    content
                );

                item.appendChild(
                    time
                );


                activityList.appendChild(
                    item
                );
            }
        );
    }


    function getActivityIcon(
        type
    ) {

        const value =
            String(type || "")
                .toLowerCase();


        if (
            value.includes("employee")
        ) {
            return "👥";
        }


        if (
            value.includes("candidate")
        ) {
            return "👤";
        }


        if (
            value.includes("payroll")
        ) {
            return "💰";
        }


        if (
            value.includes("leave")
        ) {
            return "📅";
        }


        if (
            value.includes("interview")
        ) {
            return "🎯";
        }


        if (
            value.includes("job")
        ) {
            return "💼";
        }


        if (
            value.includes("attendance")
        ) {
            return "🕒";
        }


        if (
            value.includes("performance")
        ) {
            return "📈";
        }


        return "✨";
    }


    function formatActivityDate(
        date
    ) {

        if (!date) {
            return "Recently";
        }


        const activityDate =
            new Date(date);


        if (
            Number.isNaN(
                activityDate.getTime()
            )
        ) {
            return "Recently";
        }


        const now =
            new Date();


        const difference =
            now.getTime() -
            activityDate.getTime();


        if (difference < 0) {
            return "Recently";
        }


        const minutes =
            Math.floor(
                difference /
                (1000 * 60)
            );


        if (minutes < 1) {
            return "Just now";
        }


        if (minutes < 60) {

            return (
                minutes +
                " min ago"
            );
        }


        const hours =
            Math.floor(
                minutes / 60
            );


        if (hours < 24) {

            return (
                hours +
                " hr ago"
            );
        }


        const days =
            Math.floor(
                hours / 24
            );


        if (days < 7) {

            return (
                days +
                " day" +
                (
                    days === 1
                        ? ""
                        : "s"
                ) +
                " ago"
            );
        }


        return activityDate.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }


    /*
    =========================================
    SEARCH
    =========================================
    */

    function setupSearch() {

        const searchInput =
            document.getElementById(
                "dashboardSearch"
            );

        if (!searchInput) {
            return;
        }


        searchInput.addEventListener(
            "input",
            function () {

                const value =
                    this.value
                        .toLowerCase()
                        .trim();


                const links =
                    document.querySelectorAll(
                        ".sidebar .side-link"
                    );


                links.forEach(
                    function (link) {

                        const text =
                            link.textContent
                                .toLowerCase();


                        if (!value) {

                            link.style.display =
                                "flex";

                        } else if (
                            text.includes(value)
                        ) {

                            link.style.display =
                                "flex";

                        } else {

                            link.style.display =
                                "none";
                        }
                    }
                );
            }
        );
    }


    /*
    =========================================
    LOGOUT
    =========================================
    */

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


    window.logout =
        logout;


    /*
    =========================================
    LOADER
    =========================================
    */

    function hideLoader() {

        const loader =
            document.getElementById(
                "pageLoader"
            );

        if (!loader) {
            return;
        }


        loader.style.opacity =
            "0";

        loader.style.transition =
            "opacity 0.25s ease";


        setTimeout(
            function () {

                loader.style.display =
                    "none";

            },
            250
        );
    }


    /*
    =========================================
    CLEAR ANALYTICS
    =========================================
    */

    function clearAnalytics() {

        setText(
            "analyticsAttendanceRate",
            "0.0%"
        );

        setText(
            "analyticsPresent",
            "0"
        );

        setText(
            "analyticsAbsent",
            "0"
        );

        setText(
            "analyticsPayrollAmount",
            "₹0"
        );

        setText(
            "analyticsPaidPayroll",
            "0"
        );

        setText(
            "analyticsPendingPayroll",
            "0"
        );

        setText(
            "analyticsTotalLeaves",
            "0"
        );

        setText(
            "analyticsApprovedLeaves",
            "0"
        );

        setText(
            "analyticsPendingLeaves",
            "0"
        );

        setText(
            "analyticsRejectedLeaves",
            "0"
        );

        setText(
            "analyticsCandidates",
            "0"
        );

        setText(
            "analyticsApplied",
            "0"
        );

        setText(
            "analyticsShortlisted",
            "0"
        );

        setText(
            "analyticsInterview",
            "0"
        );

        setText(
            "analyticsSelected",
            "0"
        );


        setWidth(
            "analyticsAttendanceBar",
            0
        );

        setWidth(
            "leaveProgress",
            0
        );


        updateDepartments([]);
    }


    /*
    =========================================
    CLEAR DASHBOARD
    =========================================
    */

    function clearDashboard() {

        setText(
            "totalEmployees",
            "0"
        );

        setText(
            "totalJobs",
            "0"
        );

        setText(
            "totalCandidates",
            "0"
        );

        setText(
            "totalPayroll",
            "₹0"
        );

        setText(
            "employeeCircle",
            "0"
        );

        setText(
            "overviewEmployees",
            "0"
        );

        setText(
            "activeEmployees",
            "0"
        );

        setText(
            "overviewLeaves",
            "0"
        );

        setText(
            "totalInterviews",
            "0"
        );

        setText(
            "summaryLeaves",
            "0"
        );

        setText(
            "summaryPayroll",
            "0"
        );

        setText(
            "summaryNotifications",
            "0"
        );


        updateRecruitment(
            [],
            {}
        );


        clearAnalytics();


        updateNotificationBadge(
            0
        );


        loadActivities([]);
    }


    /*
    =========================================
    PAGE INITIALIZATION
    =========================================
    */

    function initializeDashboard() {

        console.log(
            "Initializing HRGenius Dashboard..."
        );

        console.log(
            "HRGenius Dashboard Started"
        );

        console.log(
            "Dashboard API:",
            DASHBOARD_API
        );

        console.log(
            "Dashboard Token Exists:",
            !!token
        );


        loadUserInfo();

        loadDate();

        setupSearch();


        loadDashboard()
            .finally(
                function () {

                    hideLoader();

                }
            );
    }


    /*
    =========================================
    DOM READY
    =========================================
    */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeDashboard
        );

    } else {

        initializeDashboard();
    }


    /*
    =========================================
    LOADER SAFETY
    =========================================
    */

    setTimeout(
        function () {

            hideLoader();

        },
        5000
    );


    window.addEventListener(
        "load",
        function () {

            setTimeout(
                function () {

                    hideLoader();

                },
                1500
            );
        }
    );

})();