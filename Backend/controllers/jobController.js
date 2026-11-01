const Job = require("../models/Job");


/* =========================
   CREATE JOB
========================= */

const createJob = async (req, res) => {

    try {

        const {
            title,
            department,
            location,
            jobType,
            salary,
            description,
            requirements,
            status
        } = req.body;


        if (
            !title ||
            !department ||
            !location ||
            !jobType ||
            !salary ||
            !description ||
            !requirements
        ) {

            return res.status(400).json({
                message:
                    "All job fields are required"
            });

        }


        const job =
            await Job.create({

                title,
                department,
                location,
                jobType,
                salary,
                description,
                requirements,
                status:
                    status || "Open",

                postedBy:
                    req.user
                        ? req.user.id
                        : undefined

            });


        res.status(201).json({

            message:
                "Job created successfully",

            job

        });


    } catch (error) {

        console.error(
            "Create Job Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


/* =========================
   GET ALL JOBS
========================= */

const getJobs = async (req, res) => {

    try {

        const jobs =
            await Job.find()
                .populate(
                    "postedBy",
                    "name email"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            count:
                jobs.length,

            jobs

        });


    } catch (error) {

        console.error(
            "Get Jobs Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


/* =========================
   GET JOB BY ID
========================= */

const getJobById = async (req, res) => {

    try {

        const jobId =
            req.params.id;


        if (
            !jobId.match(
                /^[0-9a-fA-F]{24}$/
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid job ID"

            });

        }


        const job =
            await Job.findById(
                jobId
            ).populate(
                "postedBy",
                "name email"
            );


        if (!job) {

            return res.status(404).json({

                message:
                    "Job not found"

            });

        }


        res.status(200).json({

            job

        });


    } catch (error) {

        console.error(
            "Get Job Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


/* =========================
   UPDATE JOB
========================= */

const updateJob = async (req, res) => {

    try {

        const jobId =
            req.params.id;


        if (
            !jobId.match(
                /^[0-9a-fA-F]{24}$/
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid job ID"

            });

        }


        const job =
            await Job.findByIdAndUpdate(

                jobId,

                req.body,

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!job) {

            return res.status(404).json({

                message:
                    "Job not found"

            });

        }


        res.status(200).json({

            message:
                "Job updated successfully",

            job

        });


    } catch (error) {

        console.error(
            "Update Job Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


/* =========================
   DELETE JOB
========================= */

const deleteJob = async (req, res) => {

    try {

        const jobId =
            req.params.id;


        if (
            !jobId.match(
                /^[0-9a-fA-F]{24}$/
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid job ID"

            });

        }


        const job =
            await Job.findByIdAndDelete(
                jobId
            );


        if (!job) {

            return res.status(404).json({

                message:
                    "Job not found"

            });

        }


        res.status(200).json({

            message:
                "Job deleted successfully"

        });


    } catch (error) {

        console.error(
            "Delete Job Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


module.exports = {

    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob

};