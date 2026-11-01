const Candidate = require("../models/Candidate");
const User = require("../models/User");

const {
    createNotifications
} = require("../services/notificationService");

const fs = require("fs");
const path = require("path");


// CREATE CANDIDATE
const createCandidate = async (req, res) => {
    try {

        const {
            name,
            email,
            phone,
            skills,
            experience,
            education,
            appliedJob
        } = req.body;


        if (
            !name ||
            !email ||
            !phone ||
            !skills ||
            !experience ||
            !education ||
            !appliedJob
        ) {
            return res.status(400).json({
                message: "All candidate fields are required"
            });
        }


        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required"
            });
        }


        const resume =
            `/uploads/${req.file.filename}`;


        const candidate =
            await Candidate.create({
                name,
                email,
                phone,
                resume,
                skills,
                experience,
                education,
                appliedJob
            });


        const populatedCandidate =
            await Candidate
                .findById(candidate._id)
                .populate(
                    "appliedJob",
                    "title department location"
                );


        // FIND ADMIN AND HR USERS
        const hrUsers =
            await User.find({
                role: {
                    $in: ["admin", "hr"]
                }
            }).select("_id");


        // CREATE RECRUITMENT NOTIFICATIONS
        if (hrUsers.length > 0) {

            await createNotifications(
                hrUsers.map(user => ({
                    userId: user._id,

                    title: "New Candidate Applied",

                    message:
                        `${candidate.name} has applied for a job.`,

                    type: "Recruitment",

                    priority: "Normal",

                    actionUrl: "/candidates.html",

                    relatedId: candidate._id,

                    relatedModel: "Candidate"
                }))
            );

        }


        res.status(201).json({
            message: "Candidate created successfully",
            candidate: populatedCandidate
        });


    } catch (error) {

        console.error(
            "Create Candidate Error:",
            error
        );


        res.status(500).json({
            message: "Error creating candidate",
            error: error.message
        });

    }
};



// GET ALL CANDIDATES
const getAllCandidates = async (req, res) => {
    try {

        const candidates =
            await Candidate
                .find()
                .populate(
                    "appliedJob",
                    "title department location"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json({
            count: candidates.length,
            candidates
        });


    } catch (error) {

        console.error(
            "Get Candidates Error:",
            error
        );


        res.status(500).json({
            message: "Error fetching candidates",
            error: error.message
        });

    }
};



// GET CANDIDATE BY ID
const getCandidateById = async (req, res) => {
    try {

        const candidate =
            await Candidate
                .findById(req.params.id)
                .populate(
                    "appliedJob",
                    "title department location"
                );


        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found"
            });
        }


        res.status(200).json({
            candidate
        });


    } catch (error) {

        console.error(
            "Get Candidate Error:",
            error
        );


        res.status(500).json({
            message: "Error fetching candidate",
            error: error.message
        });

    }
};



// UPDATE CANDIDATE STATUS
const updateCandidateStatus = async (req, res) => {
    try {

        const {
            status
        } = req.body;


        const allowedStatuses = [
            "Applied",
            "Shortlisted",
            "Interview",
            "Selected",
            "Rejected"
        ];


        if (
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid candidate status"
            });
        }


        const candidate =
            await Candidate
                .findByIdAndUpdate(
                    req.params.id,
                    {
                        status
                    },
                    {
                        new: true,
                        runValidators: true
                    }
                )
                .populate(
                    "appliedJob",
                    "title department location"
                );


        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found"
            });
        }


        // FIND ADMIN AND HR USERS
        const hrUsers =
            await User.find({
                role: {
                    $in: ["admin", "hr"]
                }
            }).select("_id");


        // CREATE STATUS UPDATE NOTIFICATIONS
        if (hrUsers.length > 0) {

            await createNotifications(
                hrUsers.map(user => ({
                    userId: user._id,

                    title: "Candidate Status Updated",

                    message:
                        `${candidate.name}'s status changed to ${status}.`,

                    type: "Recruitment",

                    priority:
                        status === "Selected"
                            ? "High"
                            : "Normal",

                    actionUrl: "/candidates.html",

                    relatedId: candidate._id,

                    relatedModel: "Candidate"
                }))
            );

        }


        res.status(200).json({
            message:
                "Candidate status updated successfully",

            candidate
        });


    } catch (error) {

        console.error(
            "Update Candidate Status Error:",
            error
        );


        res.status(500).json({
            message:
                "Error updating candidate status",

            error: error.message
        });

    }
};



// DELETE CANDIDATE
const deleteCandidate = async (req, res) => {
    try {

        const candidate =
            await Candidate.findById(
                req.params.id
            );


        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found"
            });
        }


        if (candidate.resume) {

            const cleanResumePath =
                candidate.resume.replace(
                    /^[\/\\]+/,
                    ""
                );


            const resumePath =
                path.join(
                    __dirname,
                    "..",
                    cleanResumePath
                );


            if (
                fs.existsSync(resumePath)
            ) {

                fs.unlinkSync(
                    resumePath
                );

            }

        }


        await Candidate.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({
            message:
                "Candidate deleted successfully"
        });


    } catch (error) {

        console.error(
            "Delete Candidate Error:",
            error
        );


        res.status(500).json({
            message:
                "Error deleting candidate",

            error: error.message
        });

    }
};



module.exports = {
    createCandidate,
    getAllCandidates,
    getCandidateById,
    updateCandidateStatus,
    deleteCandidate
};