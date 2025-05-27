import express from "express";
import { createPublicReviewRules, reviewIdRules } from "./review.validation.js";
import validateData from "../../validators/validate-data.js";
import * as reviewCtrl from "./review.controller.js";
import isAuthorized from "../../middlewares/authorized.js";
import { stAdmin, suAdmin, teAdmin } from "../../utils/roles.js";

const reviewRoutes = express.Router();

reviewRoutes
  .get("/", reviewCtrl.getReviews)
  .post("/", createPublicReviewRules, validateData, reviewCtrl.createPublicReview)
  .put("/:id", isAuthorized(suAdmin, teAdmin, stAdmin), reviewIdRules, createPublicReviewRules, validateData, reviewCtrl.updateReview)
  .patch("/pin/:id", isAuthorized(suAdmin, teAdmin, stAdmin), reviewIdRules, reviewCtrl.pinReview)
  .patch("/unpin/:id", isAuthorized(suAdmin, teAdmin, stAdmin), reviewIdRules, reviewCtrl.unpinnedReview)
  .patch("/approve/:id", isAuthorized(suAdmin, teAdmin, stAdmin), reviewIdRules, reviewCtrl.approveReview)
  .delete("/:id", isAuthorized(suAdmin, teAdmin, stAdmin), reviewIdRules, reviewCtrl.deleteReview);

export default reviewRoutes;
