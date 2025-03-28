import EducationLevel from "./education-level.schema.js";
import CustomError from "../../utils/custom-error.js";
import { DateTime } from "luxon";

export const get_levels = async (limit, offset, page, search) => {
  try {
    const filter = {};
    if (search) filter.label = new RegExp(search, "i");

    const countPromise = EducationLevel.countDocuments(filter);
    const levelsPromise = EducationLevel.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .exec();

    const [count, levels] = await Promise.all([countPromise, levelsPromise]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      levels,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError("Failed to get the levels", 500);
  }
};

export const create_level = async (user, data) => {
  try {
    const { level } = data;

    const newLevel = await new EducationLevel({
      label: level.toLocaleUpperCase(),
      createdBy: user._id,
    }).save();

    if (!newLevel) throw new CustomError("Failed to create a new level", 500);

    return {
      success: true,
      level: newLevel,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const update_level = async (user, id, data) => {
  try {
    const { level } = data;

    const updatedLevel = await EducationLevel.findByIdAndUpdate(
      id,
      {
        $set: {
          label: level.toLocaleUpperCase(),
          lastUpdatedBy: user._id,
        },
      },
      { new: true }
    ).exec();

    if (!updatedLevel) throw new CustomError("Failed to update the level", 500);

    return {
      success: true,
      level: updatedLevel,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const delete_level = async (user, id) => {
  try {
    const deleted = await EducationLevel.updateOne(
      { _id: id },
      {
        deletedAt: DateTime.now().setZone("Asia/Manila").toJSDate(),
        deletedBy: user._id,
      }
    ).exec();

    if (!deleted.acknowledged) {
      throw new CustomError("Failed to delete the level", 500);
    }

    return {
      success: true,
      deletedId: id,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
