const Employee = require("../models/Employee");
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Interview = require("../models/Interview");
const Leave = require("../models/Leave");
const Payroll = require("../models/Payroll");
const Attendance = require("../models/Attendance");
const Department = require("../models/Department");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");


// =========================
// DASHBOARD STATS
// =========================

exports.getDashboardStats = async (req, res) => {

    try {

        console.log("Loading Dashboard Statistics...");


        // =========================
        // CURRENT DATE
        // =========================

        const now = new Date();

        const currentYear =
            now.getFullYear();

        const currentMonth =
            now.getMonth();


        // =========================
        // TODAY
        // =========================

        const todayYear =
            now.getFullYear();

        const todayMonth =
            now.getMonth();

        const todayDate =
            now.getDate();


        // =========================
        // FETCH DATA
        // =========================

        const [
            employees,
            jobs,
            candidates,
            interviews,
            leaves,
            payrolls,
            attendances,
            departments,
            unreadNotifications,
            recentEmployees,
            recentCandidates,
            recentInterviews,
            recentLeaves,
            recentPayrolls,
            recentAuditLogs
        ] = await Promise.all([

            Employee
                .find()
                .select(
                    "name department designation salary joiningDate createdAt"
                ),

            Job
                .find()
                .select(
                    "title status createdAt"
                ),

            Candidate
                .find()
                .populate(
                    "appliedJob",
                    "title"
                )
                .select(
                    "name status appliedJob createdAt"
                ),

            Interview
                .find()
                .sort({
                    createdAt: -1
                }),

            Leave
                .find()
                .sort({
                    createdAt: -1
                }),

            Payroll
                .find()
                .populate(
                    "employeeId",
                    "name"
                )
                .sort({
                    createdAt: -1
                }),

            // Get ALL attendance records
            Attendance
                .find()
                .sort({
                    date: -1
                }),

            Department
                .find()
                .populate(
                    "head",
                    "name"
                ),

            Notification
                .countDocuments({
                    read: false
                }),

            Employee
                .find()
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .select(
                    "name department designation createdAt"
                ),

            Candidate
                .find()
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .select(
                    "name status createdAt"
                ),

            Interview
                .find()
                .sort({
                    createdAt: -1
                })
                .limit(5),

            Leave
                .find()
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .select(
                    "status leaveType createdAt"
                ),

            Payroll
                .find()
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .select(
                    "netSalary paymentStatus month createdAt"
                ),

            AuditLog
                .find()
                .populate(
                    "userId",
                    "name"
                )
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .select(
                    "userId action module description createdAt"
                )

        ]);


        // =========================
        // BASIC COUNTS
        // =========================

        const totalEmployees =
            employees.length;

        const totalJobs =
            jobs.length;

        const totalCandidates =
            candidates.length;

        const totalInterviews =
            interviews.length;

        const totalPayrollRecords =
            payrolls.length;


        // =========================
        // LEAVES
        // =========================

        const pendingLeaves =
            leaves.filter(
                function (leave) {

                    return (
                        String(
                            leave.status || ""
                        )
                            .toLowerCase() ===
                        "pending"
                    );

                }
            ).length;


        const approvedLeaves =
            leaves.filter(
                function (leave) {

                    return (
                        String(
                            leave.status || ""
                        )
                            .toLowerCase() ===
                        "approved"
                    );

                }
            ).length;


        const rejectedLeaves =
            leaves.filter(
                function (leave) {

                    return (
                        String(
                            leave.status || ""
                        )
                            .toLowerCase() ===
                        "rejected"
                    );

                }
            ).length;


        // =========================
        // PAYROLL
        // =========================

        const totalPayroll =
            payrolls.reduce(
                function (sum, payroll) {

                    return (
                        sum +
                        Number(
                            payroll.netSalary || 0
                        )
                    );

                },
                0
            );


        const paidPayroll =
            payrolls
                .filter(
                    function (payroll) {

                        return (
                            payroll.paymentStatus ===
                            "Paid"
                        );

                    }
                )
                .reduce(
                    function (sum, payroll) {

                        return (
                            sum +
                            Number(
                                payroll.netSalary || 0
                            )
                        );

                    },
                    0
                );


        const pendingPayrollAmount =
            payrolls
                .filter(
                    function (payroll) {

                        return (
                            payroll.paymentStatus ===
                            "Pending"
                        );

                    }
                )
                .reduce(
                    function (sum, payroll) {

                        return (
                            sum +
                            Number(
                                payroll.netSalary || 0
                            )
                        );

                    },
                    0
                );


        const paidPayrollCount =
            payrolls.filter(
                function (payroll) {

                    return (
                        payroll.paymentStatus ===
                        "Paid"
                    );

                }
            ).length;


        const pendingPayrollCount =
            payrolls.filter(
                function (payroll) {

                    return (
                        payroll.paymentStatus ===
                        "Pending"
                    );

                }
            ).length;


        // =========================
        // ATTENDANCE - CURRENT MONTH
        // =========================

        const monthAttendances =
            attendances.filter(
                function (attendance) {

                    if (!attendance.date) {
                        return false;
                    }

                    const attendanceDate =
                        new Date(
                            attendance.date
                        );

                    return (
                        attendanceDate.getFullYear() ===
                            currentYear &&
                        attendanceDate.getMonth() ===
                            currentMonth
                    );

                }
            );


        const presentThisMonth =
            monthAttendances.filter(
                function (attendance) {

                    return (
                        String(
                            attendance.status || ""
                        )
                            .toLowerCase() ===
                        "present"
                    );

                }
            ).length;


        const absentThisMonth =
            monthAttendances.filter(
                function (attendance) {

                    return (
                        String(
                            attendance.status || ""
                        )
                            .toLowerCase() ===
                        "absent"
                    );

                }
            ).length;


        const leaveThisMonth =
            monthAttendances.filter(
                function (attendance) {

                    return (
                        String(
                            attendance.status || ""
                        )
                            .toLowerCase() ===
                        "leave"
                    );

                }
            ).length;


        const attendanceTotal =
            presentThisMonth +
            absentThisMonth;


        const attendanceRate =
            attendanceTotal > 0
                ? Math.round(
                    (
                        presentThisMonth /
                        attendanceTotal
                    ) * 100
                )
                : 0;


        // =========================
        // ATTENDANCE - TODAY
        // =========================

        const todayAttendances =
            attendances.filter(
                function (attendance) {

                    if (!attendance.date) {
                        return false;
                    }

                    const attendanceDate =
                        new Date(
                            attendance.date
                        );

                    return (
                        attendanceDate.getFullYear() ===
                            todayYear &&
                        attendanceDate.getMonth() ===
                            todayMonth &&
                        attendanceDate.getDate() ===
                            todayDate
                    );

                }
            );


        const presentToday =
            todayAttendances.filter(
                function (attendance) {

                    return (
                        String(
                            attendance.status || ""
                        )
                            .toLowerCase() ===
                        "present"
                    );

                }
            ).length;


        const absentToday =
            todayAttendances.filter(
                function (attendance) {

                    return (
                        String(
                            attendance.status || ""
                        )
                            .toLowerCase() ===
                        "absent"
                    );

                }
            ).length;


        const leaveToday =
            todayAttendances.filter(
                function (attendance) {

                    return (
                        String(
                            attendance.status || ""
                        )
                            .toLowerCase() ===
                        "leave"
                    );

                }
            ).length;


        console.log(
            "Attendance Current Month:",
            {
                total: monthAttendances.length,
                present: presentThisMonth,
                absent: absentThisMonth,
                leave: leaveThisMonth,
                rate: attendanceRate
            }
        );


        console.log(
            "Attendance Today:",
            {
                total: todayAttendances.length,
                present: presentToday,
                absent: absentToday,
                leave: leaveToday
            }
        );


        // =========================
        // RECRUITMENT
        // =========================

        const appliedCandidates =
            candidates.filter(
                function (candidate) {

                    return (
                        String(
                            candidate.status || ""
                        )
                            .toLowerCase() ===
                        "applied"
                    );

                }
            ).length;


        const shortlistedCandidates =
            candidates.filter(
                function (candidate) {

                    return (
                        String(
                            candidate.status || ""
                        )
                            .toLowerCase() ===
                        "shortlisted"
                    );

                }
            ).length;


        const interviewCandidates =
            candidates.filter(
                function (candidate) {

                    return (
                        String(
                            candidate.status || ""
                        )
                            .toLowerCase() ===
                        "interview"
                    );

                }
            ).length;


        const selectedCandidates =
            candidates.filter(
                function (candidate) {

                    return (
                        String(
                            candidate.status || ""
                        )
                            .toLowerCase() ===
                        "selected"
                    );

                }
            ).length;


        const rejectedCandidates =
            candidates.filter(
                function (candidate) {

                    return (
                        String(
                            candidate.status || ""
                        )
                            .toLowerCase() ===
                        "rejected"
                    );

                }
            ).length;


        const candidateStatus = {

            applied:
                appliedCandidates,

            shortlisted:
                shortlistedCandidates,

            interview:
                interviewCandidates,

            selected:
                selectedCandidates,

            rejected:
                rejectedCandidates

        };


        // =========================
        // INTERVIEW STATUS
        // =========================

        const interviewStatus = {

            scheduled:
                interviews.filter(
                    function (interview) {

                        return (
                            String(
                                interview.status || ""
                            )
                                .toLowerCase() ===
                            "scheduled"
                        );

                    }
                ).length,

            completed:
                interviews.filter(
                    function (interview) {

                        return (
                            String(
                                interview.status || ""
                            )
                                .toLowerCase() ===
                            "completed"
                        );

                    }
                ).length,

            cancelled:
                interviews.filter(
                    function (interview) {

                        return (
                            String(
                                interview.status || ""
                            )
                                .toLowerCase() ===
                            "cancelled"
                        );

                    }
                ).length

        };


        // =========================
        // DEPARTMENT ANALYTICS
        // =========================

        const departmentMap = {};


        employees.forEach(
            function (employee) {

                const departmentName =
                    employee.department ||
                    "Other";


                if (
                    !departmentMap[
                        departmentName
                    ]
                ) {

                    departmentMap[
                        departmentName
                    ] = {

                        name:
                            departmentName,

                        employees:
                            0,

                        totalSalary:
                            0

                    };

                }


                departmentMap[
                    departmentName
                ].employees += 1;


                departmentMap[
                    departmentName
                ].totalSalary +=
                    Number(
                        employee.salary || 0
                    );

            }
        );


        const departmentAnalytics =
            Object.values(
                departmentMap
            );


        // =========================
        // DEPARTMENT DETAILS
        // =========================

        const departmentDetails =
            departments.map(
                function (department) {

                    const departmentEmployees =
                        employees.filter(
                            function (employee) {

                                return (
                                    employee.department ===
                                    department.name
                                );

                            }
                        );


                    const departmentSalary =
                        departmentEmployees.reduce(
                            function (
                                sum,
                                employee
                            ) {

                                return (
                                    sum +
                                    Number(
                                        employee.salary ||
                                        0
                                    )
                                );

                            },
                            0
                        );


                    return {

                        id:
                            department._id,

                        name:
                            department.name,

                        head:
                            department.head
                                ? department.head.name
                                : "Not Assigned",

                        description:
                            department.description ||
                            "",

                        status:
                            department.status ||
                            "Active",

                        employeeCount:
                            departmentEmployees.length,

                        totalSalary:
                            departmentSalary

                    };

                }
            );


        // =========================
        // RECENT ACTIVITY
        // =========================

        const recentActivity = [];


        recentEmployees.forEach(
            function (employee) {

                recentActivity.push({

                    type:
                        "employee",

                    title:
                        "New Employee Added",

                    description:
                        `${employee.name} joined ${employee.department || "the company"}`,

                    date:
                        employee.createdAt

                });

            }
        );


        recentCandidates.forEach(
            function (candidate) {

                recentActivity.push({

                    type:
                        "candidate",

                    title:
                        "Candidate Updated",

                    description:
                        `${candidate.name} - ${candidate.status}`,

                    date:
                        candidate.createdAt

                });

            }
        );


        recentInterviews.forEach(
            function (interview) {

                recentActivity.push({

                    type:
                        "interview",

                    title:
                        "Interview Activity",

                    description:
                        `Interview status: ${interview.status || "Scheduled"}`,

                    date:
                        interview.createdAt

                });

            }
        );


        recentLeaves.forEach(
            function (leave) {

                recentActivity.push({

                    type:
                        "leave",

                    title:
                        "Leave Request",

                    description:
                        `Leave request is ${leave.status || "Pending"}`,

                    date:
                        leave.createdAt

                });

            }
        );


        recentPayrolls.forEach(
            function (payroll) {

                recentActivity.push({

                    type:
                        "payroll",

                    title:
                        "Payroll Activity",

                    description:
                        `Payroll ${payroll.paymentStatus || "created"} - ₹${Number(
                            payroll.netSalary || 0
                        ).toLocaleString("en-IN")}`,

                    date:
                        payroll.createdAt

                });

            }
        );


        recentAuditLogs.forEach(
            function (log) {

                recentActivity.push({

                    type:
                        "audit",

                    title:
                        log.action ||
                        "System Activity",

                    description:
                        log.description ||
                        log.module ||
                        "HR system activity",

                    date:
                        log.createdAt

                });

            }
        );


        recentActivity.sort(
            function (a, b) {

                return (
                    new Date(b.date) -
                    new Date(a.date)
                );

            }
        );


        const finalRecentActivity =
            recentActivity.slice(
                0,
                10
            );


        // =========================
        // TOTAL SALARY
        // =========================

        const totalSalary =
            employees.reduce(
                function (sum, employee) {

                    return (
                        sum +
                        Number(
                            employee.salary || 0
                        )
                    );

                },
                0
            );


        // =========================
        // FINAL RESPONSE
        // =========================

        res.status(200).json({

            success:
                true,

            totalEmployees:
                totalEmployees,

            totalJobs:
                totalJobs,

            totalCandidates:
                totalCandidates,

            totalInterviews:
                totalInterviews,

            pendingLeaves:
                pendingLeaves,

            totalPayroll:
                totalPayroll,

            totalPayrollRecords:
                totalPayrollRecords,

            unreadNotifications:
                unreadNotifications,

            totalSalary:
                totalSalary,

            candidateStatus:
                candidateStatus,

            interviewStatus:
                interviewStatus,

            recentActivity:
                finalRecentActivity,


            // =========================
            // ANALYTICS
            // =========================

            analytics: {

                // =========================
                // DEPARTMENTS
                // =========================

                departments:
                    departmentAnalytics,

                departmentDetails:
                    departmentDetails,


                // =========================
                // ATTENDANCE
                // =========================

                attendance: {

                    present:
                        presentThisMonth,

                    absent:
                        absentThisMonth,

                    leave:
                        leaveThisMonth,

                    total:
                        attendanceTotal,

                    rate:
                        attendanceRate,

                    presentToday:
                        presentToday,

                    absentToday:
                        absentToday,

                    leaveToday:
                        leaveToday,

                    presentThisMonth:
                        presentThisMonth,

                    absentThisMonth:
                        absentThisMonth,

                    leaveThisMonth:
                        leaveThisMonth

                },


                // =========================
                // LEAVES
                // =========================

                leaves: {

                    total:
                        leaves.length,

                    pending:
                        pendingLeaves,

                    approved:
                        approvedLeaves,

                    rejected:
                        rejectedLeaves

                },


                // =========================
                // PAYROLL
                // =========================

                payroll: {

                    totalRecords:
                        payrolls.length,

                    totalAmount:
                        totalPayroll,

                    paid:
                        paidPayroll,

                    pending:
                        pendingPayrollAmount,

                    paidCount:
                        paidPayrollCount,

                    pendingCount:
                        pendingPayrollCount,

                    paidAmount:
                        paidPayroll,

                    pendingAmount:
                        pendingPayrollAmount

                },


                // =========================
                // RECRUITMENT
                // =========================

                recruitment: {

                    totalCandidates:
                        candidates.length,

                    totalJobs:
                        jobs.length,

                    totalInterviews:
                        interviews.length,

                    applied:
                        appliedCandidates,

                    shortlisted:
                        shortlistedCandidates,

                    interview:
                        interviewCandidates,

                    selected:
                        selectedCandidates,

                    rejected:
                        rejectedCandidates

                }

            }

        });


    }

    catch (error) {

        console.error(
            "Dashboard Stats Error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Failed to load dashboard statistics",

            error:
                error.message

        });

    }

};