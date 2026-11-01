const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config();


const authRoutes =
    require("./routes/authRoutes");

const employeeRoutes =
    require("./routes/employeeRoutes");

const attendanceRoutes =
    require("./routes/attendanceRoutes");

const leaveRoutes =
    require("./routes/leaveRoutes");

const payrollRoutes =
    require("./routes/payrollRoutes");

const performanceRoutes =
    require("./routes/performanceRoutes");

const jobRoutes =
    require("./routes/jobRoutes");

const candidateRoutes =
    require("./routes/candidateRoutes");

const interviewRoutes =
    require("./routes/interviewRoutes");

const dashboardRoutes =
    require("./routes/dashboardRoutes");

const departmentRoutes =
    require("./routes/departmentRoutes");

const auditLogRoutes =
    require("./routes/auditLogRoutes");

const notificationRoutes =
    require("./routes/notificationRoutes");

const userRoutes =
    require("./routes/userRoutes");


const authMiddleware =
    require("./middleware/authMiddleware");


const app = express();


/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================
   UPLOADS
========================= */

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);


/* =========================
   API ROUTES
========================= */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/employees",
    employeeRoutes
);

app.use(
    "/api/attendance",
    attendanceRoutes
);

app.use(
    "/api/leaves",
    leaveRoutes
);

app.use(
    "/api/payroll",
    payrollRoutes
);

app.use(
    "/api/performance",
    performanceRoutes
);

app.use(
    "/api/jobs",
    jobRoutes
);

app.use(
    "/api/candidates",
    candidateRoutes
);

app.use(
    "/api/interviews",
    interviewRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/departments",
    departmentRoutes
);

app.use(
    "/api/audit-logs",
    auditLogRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use(
    "/api/users",
    userRoutes
);


/* =========================
   ROOT ROUTE
========================= */

app.get(
    "/",
    (req, res) => {

        res.send(
            "HRGenius Backend is Running!"
        );

    }
);


/* =========================
   PROTECTED TEST ROUTE
========================= */

app.get(
    "/api/protected",

    authMiddleware,

    (req, res) => {

        res.status(200).json({

            message:
                "You have access to protected API",

            user:
                req.user

        });

    }
);


/* =========================
   MONGODB
========================= */

mongoose
    .connect(
        process.env.MONGO_URI
    )

    .then(() => {

        console.log(
            "MongoDB Connected Successfully"
        );

    })

    .catch(
        (error) => {

            console.log(
                "MongoDB Connection Error:",
                error
            );

        }
    );


/* =========================
   SERVER
========================= */

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);