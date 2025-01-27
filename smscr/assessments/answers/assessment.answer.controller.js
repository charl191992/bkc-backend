import * as AssessmentAnswerService from "./assessment.answer.service.js";

export const createAnswer = async (req, res, next) => {
  try {
    const result = await AssessmentAnswerService.create_answer(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAnswer = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await AssessmentAnswerService.update_answer(id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteAnswer = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await AssessmentAnswerService.delete_answer(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
