const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadFolder = path.join(
    __dirname,
    "../uploads"
);

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, {
        recursive: true
    });
}

const storage = multer.diskStorage({

    destination: function (
        req,
        file,
        cb
    ) {
        cb(
            null,
            uploadFolder
        );
    },

    filename: function (
        req,
        file,
        cb
    ) {

        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        const fileName =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1000000000
            ) +
            extension;

        cb(
            null,
            fileName
        );
    }
});

const fileFilter = function (
    req,
    file,
    cb
) {

    const allowedExtensions = [
        ".pdf",
        ".doc",
        ".docx"
    ];

    const extension =
        path.extname(
            file.originalname
        ).toLowerCase();

    if (
        allowedExtensions.includes(
            extension
        )
    ) {
        cb(
            null,
            true
        );
    } else {
        cb(
            new Error(
                "Only PDF, DOC and DOCX files are allowed"
            ),
            false
        );
    }
};

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize:
            5 * 1024 * 1024
    }
});

module.exports = upload;