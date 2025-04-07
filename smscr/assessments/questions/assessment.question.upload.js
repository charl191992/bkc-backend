import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import CustomError from "../../../utils/custom-error.js";
import sharp from "sharp";

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

const questionUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.resolve(
      global.rootDir,
      "uploads",
      "assessments",
      "questions"
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
const questionUpload = multer({
  storage: questionUploadStorage,
  fileFilter: validateFile,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("question_image");

const questionUploadCheck = (req, res, next) => {
  questionUpload(req, res, async err => {
    if (err instanceof multer.MulterError) {
      next(
        new CustomError(
          err.message || "Failed to upload images.",
          err.statusCode || 500,
          err.validationErrors || []
        )
      );
    } else if (err) {
      next(
        new CustomError(
          err.message || "Failed to upload images.",
          err.statusCode || 500,
          err.validationErrors || []
        )
      );
    }

    if (req.file) {
      try {
        const imagePath = req.file.path;
        const filename = imagePath.split(".")[0];
        const outputPath = `${filename}.webp`;

        const image = sharp(imagePath);
        await image
          .resize({
            width: 800,
            height: 600,
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .webp({
            quality: 80,
            alphaQuality: 80,
            effort: 6,
          })
          .withMetadata()
          .toFile(outputPath);

        fs.renameSync(imagePath, outputPath);

        req.file = {
          ...req.file,
          path: outputPath,
          filename: path.basename(outputPath),
          mimetype: "image/webp",
          size: fs.statSync(outputPath).size,
        };
      } catch (error) {
        if (req.file) fs.unlink(req.file.path);
        next(
          new CustomError(
            err.message || "Failed to upload images.",
            err.statusCode || 500,
            err.validationErrors || []
          )
        );
      }
    }

    next();
  });
};

export default questionUploadCheck;
