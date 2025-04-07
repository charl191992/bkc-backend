import mongoose from "mongoose";
import CustomError from "../../../utils/custom-error.js";
import AssessmentQuestion from "./assessment.question.schema.js";
import { sanitizeHTML } from "../../../utils/sanitize-html.js";

export const add_assessment_question = async (data, file) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const questionData = {
      assessment: data.assessmentId,
      section: data.sectionId,
      question: {},
    };

    if (file) {
      questionData.question.image = {
        filename: file.filename,
        original_name: file.originalname,
        path: `uploads/assessments/questions/${file.filename}`,
        size: file.size,
      };
    }

    if (data.textQuestion) {
      questionData.question.text = sanitizeHTML(data.textQuestion);
    }

    const question = await new AssessmentQuestion(questionData).save({
      session,
    });
    if (!question) {
      throw new CustomError("Failed to add a new question", 500);
    }

    await session.commitTransaction();

    return {
      success: true,
      question: {
        assessment: question.assessment,
        section: question.section,
        _id: question._id,
        choices: question.choices,
        question: question.question,
      },
    };
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    throw new CustomError(
      error.message || "Failed to add a new question",
      error.statusCode || 500
    );
  } finally {
    session.endSession();
  }
};

export const update_assessment_question = async (id, data, file) => {
  try {
    const filter = {
      _id: id,
      section: data.sectionId,
      assessment: data.assessmentId,
    };
    const updates = { $set: {}, $unset: {} };
    const options = { new: true };

    if (!file && data.removeOldImage === "true") {
      updates.$unset = { "question.image": "" };
    }

    if (file) {
      updates.$set = {
        ...updates.$set,
        "question.image": {
          filename: file.filename,
          original_name: file.originalname,
          path: `uploads/assessments/questions/${file.filename}`,
          size: file.size,
        },
      };
    }

    if (data.textQuestion) {
      updates.$set = {
        ...updates.$set,
        "question.text": sanitizeHTML(data.textQuestion),
      };
    }

    console.log(updates);

    const updated = await AssessmentQuestion.findOneAndUpdate(
      filter,
      updates,
      options
    ).exec();
    if (!updated) {
      throw new CustomError("Failed to update the question", 500);
    }

    const rtnQuestion = {
      assessment: updated.assessment,
      section: updated.section,
      _id: updated._id,
      choices: updated.choices,
      question: {},
    };

    if (updated.question?.image?.path) {
      rtnQuestion.question.image = updated.question.image;
    }

    if (updated.question?.text) {
      rtnQuestion.question.text = updated.question.text;
    }

    return {
      success: true,
      question: rtnQuestion,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to add a new question",
      error.statusCode || 500
    );
  }
};

export const delete_assessment_question = async id => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const deleted = await AssessmentQuestion.deleteOne(
      { _id: id },
      { session }
    ).exec();
    if (deleted.deletedCount < 1) {
      throw new CustomError("Failed to delete the question", 500);
    }

    await session.commitTransaction();

    return {
      success: true,
      question: id,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(
      error.message || "Failed to delete the question",
      error.statusCode || 500
    );
  } finally {
    session.endSession();
  }
};
