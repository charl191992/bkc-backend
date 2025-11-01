import getToken from "../../utils/get-token.js";
import * as RecommendationService from "./recommendation.service.js";

export const sendRecommendation = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await RecommendationService.create_recommendation(req.body, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
