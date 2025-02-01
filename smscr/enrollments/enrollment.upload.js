import multer from "multer";
import CustomError from "../../utils/custom-error.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const validateFile = async (req, file, cb) => {
  console.log(file);
  const filename = file.originalname;
  const format = filename.split(".")[filename.split(".").length - 1];
  if (!["docx"].includes(format.toLowerCase())) {
    cb(new CustomError("Invalid file format. Only (docx) is accepted.", 400));
    return;
  }
  cb(null, true);
};

const enrollmentUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.resolve(
      global.rootDir,
      "uploads",
      "enrollments",
      req.body.email
    );
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const format =
      file.originalname.split(".")[file.originalname.split(".").length - 1];
    const filename = `${crypto.randomUUID().split("-").join("")}.${format}`;
    cb(null, filename);
  },
});
const enrollmentUpload = multer({
  storage: enrollmentUploadStorage,
  fileFilter: validateFile,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "", maxCount: 1 },
  { name: "", maxCount: 1 },
  { name: "", maxCount: 1 },
]);

const enrollmentUploadCheck = (req, res, next) => {
  enrollmentUpload(req, res, async err => {
    if (err instanceof multer.MulterError) {
      next(
        new CustomError(
          err.message || "Failed to upload images.",
          err.statusCode || 500
        )
      );
    } else if (err) {
      next(
        new CustomError(
          err.message || "Failed to upload images.",
          err.statusCode || 500
        )
      );
    }

    next();
  });
};

export default enrollmentUploadCheck;
