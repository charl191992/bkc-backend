import { body, param } from "express-validator";
import Review from "./review.schema.js";

export const reviewIdRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Review id is required")
    .isMongoId()
    .withMessage("Invalid review id")
    .custom(async value => {
      const exists = await Review.exists({ _id: value });
      if (!exists) throw Error("Review not found");
      return true;
    }),
];

export const createPublicReviewRules = [
  body("review").trim().notEmpty().withMessage("Review is required").isLength({ min: 1, max: 1000 }).withMessage("Review must only consist of 1 to 1000 characters."),
  body("reviewer").trim().notEmpty().withMessage("Reviewer is required").isLength({ min: 1, max: 100 }).withMessage("Reviewer must only consist of 1 to 100 characters."),
  body("ratings").isNumeric().withMessage("Ratings must be a number").toInt().isInt({ min: 0, max: 5 }).withMessage("Ratings must be between 0 to 5"),
];
