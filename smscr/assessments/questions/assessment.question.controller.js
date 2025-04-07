import CustomError from "../../../utils/custom-error.js";
import AssessmentQuestion from "./assessment.question.schema.js";
import * as assessmentQuestionService from "./assessment.question.service.js";

export const addQuestion = async (req, res, next) => {
  try {
    if (!req.body.textQuestion && !req.file) {
      throw new CustomError(
        "Must have a atleast an image question or text question",
        400
      );
    }

    const result = await assessmentQuestionService.add_assessment_question(
      req.body,
      req.file
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!req.body.textQuestion && !req.file) {
      throw new CustomError(
        "Must have a atleast an image question or text question",
        400
      );
    }

    const result = await assessmentQuestionService.update_assessment_question(
      id,
      req.body,
      req.file
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const exists = await AssessmentQuestion.exists({ _id: req.params.id });
    if (!exists) {
      throw new CustomError("Question not found", 404);
    }

    const result = await assessmentQuestionService.delete_assessment_question(
      req.params.id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
