import { DateTime } from "luxon";
import CustomError from "../../utils/custom-error.js";
import Subject from "./subject.schema.js";

export const get_subjects = async (limit, offset, page, search) => {
  try {
    const filter = {};
    if (search) filter.label = new RegExp(search, "i");

    const countPromise = Subject.countDocuments(filter);
    const subjectsPromise = Subject.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .exec();

    const [count, subjects] = await Promise.all([
      countPromise,
      subjectsPromise,
    ]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      subjects,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError("Failed to get the subjects", 500);
  }
};

export const create_subject = async (user, data) => {
  try {
    const { subject } = data;

    const newSubject = await new Subject({
      label: subject.toLocaleUpperCase(),
      status: "active",
      createdBy: user._id,
    }).save();

    if (!newSubject)
      throw new CustomError("Failed to create a new subject", 500);

    return {
      success: true,
      subject: newSubject,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const update_subject = async (user, id, data) => {
  try {
    const { subject } = data;

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      {
        $set: {
          label: subject.toLocaleUpperCase(),
          lastUpdatedBy: user._id,
        },
      },
      { new: true }
    ).exec();

    if (!updatedSubject)
      throw new CustomError("Failed to update the subject", 500);

    return {
      success: true,
      subject: updatedSubject,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const delete_subject = async (user, id) => {
  try {
    const deleted = await Subject.updateOne(
      { _id: id },
      {
        deletedAt: DateTime.now().setZone("Asia/Manila").toJSDate(),
        deletedBy: user._id,
      }
    ).exec();

    if (!deleted.acknowledged) {
      throw new CustomError("Failed to delete the subject", 500);
    }

    return {
      success: true,
      deletedId: id,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const change_subject_status = async (id, status) => {
  try {
    const updates = { $set: { status } };
    const options = { new: true };
    const updated = await Subject.findByIdAndUpdate(
      id,
      updates,
      options
    ).exec();

    return {
      success: true,
      subject: updated,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to change the subject status",
      error.statusCode || 500
    );
  }
};
