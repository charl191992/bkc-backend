import multer from "multer";
import CustomError from "../../utils/custom-error.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const validateFile = async (req, file, cb) => {
  const type = file.mimetype.split("/")[0];
  if (type !== "image") {
    cb(
      new CustomError("Invalid image. Please select an image.", 400, [
        {
          path: file.fieldname,
          msgs: ["Invalid image. Please select an image."],
        },
      ])
    );
    return;
  }

  cb(null, true);
};

const enrollmentUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.resolve(global.rootDir, "uploads", "enrollments");
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const format = file.originalname.split(".")[file.originalname.split(".").length - 1];
    const filename = `${crypto.randomUUID().split("-").join("")}.${format}`;
    cb(null, filename);
  },
});

const enrollmentUpload = multer({
  storage: enrollmentUploadStorage,
  fileFilter: validateFile,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "report_card", maxCount: 1 },
  { name: "proof_of_payment", maxCount: 1 },
]);

const enrollmentUploadCheck = (req, res, next) => {
  enrollmentUpload(req, res, async err => {
    if (err instanceof multer.MulterError) {
      next(new CustomError(err.message || "Failed to upload images.", err.statusCode || 500, err.validationErrors || []));
    } else if (err) {
      next(new CustomError(err.message || "Failed to upload images.", err.statusCode || 500, err.validationErrors || []));
    }

    next();
  });
};

export default enrollmentUploadCheck;
