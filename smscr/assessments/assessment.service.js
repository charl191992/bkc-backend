import { DateTime } from "luxon";
import CustomError from "../../utils/custom-error.js";
import Assessment from "./assessment.schema.js";
import fs from "fs";
import path from "path";
import isIdValid from "../../utils/check-id.js";

export const assessment_exists = async id => {
  try {
    const exists = await Assessment.exists({ _id: id });
    if (!exists) {
      throw new CustomError("Assessment does not exists", 404);
    }
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to check assessment",
      error.statusCode || 500
    );
  }
};

export const get_assessments = async (limit, offset, page, search) => {
  try {
    const filter = { deletedAt: null };
    if (search) filter.title = new RegExp(search, "i");

    const countPromise = Assessment.countDocuments(filter);
    const assessmentsPromise = Assessment.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("country", "label _id")
      .populate("level", "label _id")
      .populate("subject", "label _id")
      .exec();

    const [count, assessments] = await Promise.all([
      countPromise,
      assessmentsPromise,
    ]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      assessments,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const get_assessment_by_country_and_level = async (
  country,
  level,
  subjects
) => {
  try {
    const filter = {
      country,
      level,
      status: "completed",
      subjects: { $in: subjects },
      deleted: null,
    };

    const assessments = await Assessment.find(filter)
      .select("title subject level country")
      .sort({ createdAt: -1 })
      .populate("country", "label _id")
      .populate("level", "label _id")
      .populate("subject", "label _id")
      .exec();

    return {
      success: true,
      assessments,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const get_assessment_by_id = async id => {
  try {
    if (!isIdValid(id)) throw new CustomError("Assessment not found.", 400);

    const assessment = await Assessment.findById(id)
      .populate({
        path: "level",
        select: "label _id",
      })
      .populate({
        path: "subject",
        select: "label _id",
      })
      .populate({
        path: "sections",
        select: "-createdAt -updatedAt -__v",
        populate: {
          path: "questions",
          select: "-createdAt -updatedAt -__v",
        },
      })
      .exec();

    return {
      success: true,
      assessment,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const create_assessment = async data => {
  try {
    const assessment = await new Assessment({
      title: data.title,
      country: data.country,
      subject: data.subject,
      level: data.level,
      type: data.type,
      status: "draft",
    }).save();

    if (!assessment)
      throw new CustomError("Failed to create an assessment", 500);

    const rtnAssessment = await Assessment.findById(assessment._id)
      .populate("level", "label _id")
      .populate("subject", "label _id");

    return {
      success: true,
      assessment: rtnAssessment,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const update_assessment_details = async (id, data) => {
  try {
    const updated = await Assessment.findByIdAndUpdate(
      id,
      {
        $set: {
          title: data.title,
          country: data.country,
          subject: data.subject,
          level: data.level,
        },
      },
      { new: true }
    )
      .populate("country", "label _id")
      .populate("subject", "label _id")
      .populate("level", "label _id");

    if (!updated)
      throw new CustomError("Failed to update the assessment.", 500);

    return {
      success: true,
      assessment: updated,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const change_assessment_status = async (id, status) => {
  try {
    const updates = { $set: { status } };
    const options = { new: true };

    const assessment = await Assessment.findByIdAndUpdate(
      id,
      updates,
      options
    ).exec();

    if (!assessment)
      throw new CustomError("Failed to update the assessment", 500);

    return {
      assessment,
      success: true,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const delete_assessment = async (id, user) => {
  try {
    const assessment = await Assessment.findById(id).exec();

    if (!assessment) {
      throw new CustomError("Assessment not found", 404);
    }

    await assessment.sofDelete(user._id);

    return {
      success: true,
      assessment: id,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to delete the assessment",
      error.statusCode || 500
    );
  }
};
