const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        month: {
            type: String,
            required: true
        },

        basicSalary: {
            type: Number,
            required: true
        },

        allowances: {
            type: Number,
            default: 0
        },

        deductions: {
            type: Number,
            default: 0
        },

        netSalary: {
            type: Number,
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid"],
            default: "Pending"
        },

        paymentDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payroll", payrollSchema);