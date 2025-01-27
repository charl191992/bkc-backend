import { DateTime } from "luxon";
import CustomError from "../../utils/custom-error.js";
import Assessment from "./assessment.schema.js";
import fs from "fs";
import path from "path";
import isIdValid from "../../utils/check-id.js";
import AssessmentSection from "./sections/assessment.section.schema.js";
import AssessmentAnswer from "./answers/assessment.answer.schema.js";

export const get_assessments = async (limit, offset, page, search) => {
  try {
    const filter = {};
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

export const get_assessment_by_id = async id => {
  try {
    if (!isIdValid(id)) throw new CustomError("Assessment not found.", 400);

    const assessment = await Assessment.findById(id)
      .populate("country", "label _id")
      .populate("level", "label _id")
      .populate("subject", "label _id")
      .exec();

    let sections = [];

    if (assessment) {
      sections = await AssessmentSection.find({
        assessment: assessment._id,
      }).exec();
    }

    if (sections.length > 0) {
      sections = await Promise.all(
        sections.map(async section => {
          const answers = await AssessmentAnswer.find({
            assessment_section: section._id,
          })
            .select("answer assessment_section")
            .sort({ createdAt: 1 })
            .exec();

          return {
            ...section._doc,
            answers,
          };
        })
      );
    }

    return {
      success: true,
      assessment,
      sections,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const create_assessment = async (data, file) => {
  try {
    const filename = file.originalname;
    const fileSplit = filename.split(".");

    const assessment = await new Assessment({
      title: data.title,
      country: data.country,
      subject: data.subject,
      level: data.level,
      document: {
        path: `uploads/assessments/${file.filename}`,
        original_name: file.originalname,
        name: file.filename,
        type: fileSplit[fileSplit.length - 1],
      },
      status: "draft",
    }).save();

    if (!assessment)
      throw new CustomError("Failed to create an assessment", 500);

    const rtnAssessment = await Assessment.findById(assessment._id)
      .populate("country", "label _id")
      .populate("level", "label _id")
      .populate("subject", "label _id");

    return {
      success: true,
      assessment: rtnAssessment,
    };
  } catch (error) {
    if (file) {
      try {
        await fs.promises.unlink(file.path);
      } catch {
        console.log("Failed to delete the file.");
      }
    }
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

export const change_assessment_question = async (id, file, old_file) => {
  try {
    if (old_file) {
      try {
        await fs.promises.unlink(
          path.resolve(`${global.rootDir}/${old_file.path}`)
        );
      } catch (error) {
        console.log("Failed to delete the old file.");
      }
    }

    const filename = file.originalname;
    const fileSplit = filename.split(".");

    const updated = await Assessment.findByIdAndUpdate(
      id,
      {
        $set: {
          document: {
            path: `uploads/assessments/${file.filename}`,
            original_name: file.originalname,
            name: file.filename,
            type: fileSplit[fileSplit.length - 1],
          },
        },
      },
      { new: true }
    )
      .populate("country", "label _id")
      .populate("subject", "label _id")
      .populate("level", "label _id");

    if (!updated) throw new CustomError("Failed to change the questions.", 500);

    return {
      success: true,
      assessment: updated,
    };
  } catch (error) {
    if (file) {
      try {
        await fs.promises.unlink(file.path);
      } catch {
        console.log("Failed to delete the file.");
      }
    }
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

export const temp_delete_assessment = async id => {
  try {
    const deleted = await Assessment.updateOne(
      id,
      {
        $set: { deletedAt: DateTime.now().setZone("Asia/Manila").toJSDate() },
      },
      { new: true }
    ).exec();

    if (!deleted.acknowledged)
      throw new CustomError("Failed to delete the assessment", 500);

    return {
      success: true,
      assessment: id,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const delete_assessment = async (id, old_file) => {
  try {
    const deleted = await Assessment.deleteOne({ _id: id }).exec();

    if (deleted.deletedCount < 1)
      throw new CustomError("Failed to delete the assessment", 500);

    if (old_file) {
      try {
        await fs.promises.unlink(
          path.resolve(`${global.rootDir}/${old_file.path}`)
        );
      } catch (error) {
        console.log("Failed to delete the old file.");
      }
    }

    return {
      success: true,
      assessment: id,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
