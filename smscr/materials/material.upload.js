import multer from "multer";
import CustomError from "../../utils/custom-error.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const validateFile = async (req, file, cb) => {
  const type = file.mimetype.split("/")[0];
  const validMaterials = ["image", "application", "text"];
  if (!validMaterials.includes(type)) {
    const errorData = { path: file.fieldname, msgs: ["Invalid file. Only image and documents are allowed."] };
    cb(new CustomError("Invalid file. Only image and documents are allowed.", 400, [errorData]));
    return;
  }
  cb(null, true);
};

const materialUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.resolve(global.rootDir, "material-uploads");
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const format = file.originalname.split(".")[file.originalname.split(".").length - 1];
    const filename = `${crypto.randomUUID().split("-").join("")}.${format}`;
    cb(null, filename);
  },
});

const materialUpload = multer({
  storage: materialUploadStorage,
  fileFilter: validateFile,
  limits: { fileSize: 20 * 1024 * 1024 },
}).single("material");

const materialUploadCheck = (req, res, next) => {
  materialUpload(req, res, async err => {
    if (err instanceof multer.MulterError) {
      let message = "File upload error.";
      let statusCode = 400;

      if (err.code === "LIMIT_FILE_SIZE") {
        message = "File too large. Maximum size is 20MB.";
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        message = "Unexpected field name. Use 'material' as the field name.";
      }

      next(new CustomError(message, statusCode, []));
    } else if (err) {
      next(new CustomError(err.message || "Failed to upload images.", err.statusCode || 500, err.validationErrors || []));
    }
    next();
  });
};

export default materialUploadCheck;
