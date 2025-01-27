import Level from "./level.schema.js";
import CustomError from "../../utils/custom-error.js";
import { DateTime } from "luxon";

export const get_levels = async (limit, offset, page, search) => {
  try {
    const filter = {};
    if (search) filter.label = new RegExp(search, "i");

    const countPromise = Level.countDocuments(filter);
    const levelsPromise = Level.find(filter)
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

export const create_level = async data => {
  try {
    const { level } = data;

    const newLevel = await new Level({
      label: level.toLocaleUpperCase(),
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

export const update_level = async (id, data) => {
  try {
    const { level } = data;

    const updatedLevel = await Level.findByIdAndUpdate(
      id,
      {
        $set: {
          label: level.toLocaleUpperCase(),
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

export const delete_level = async id => {
  try {
    const deleted = await Level.updateOne(
      { _id: id },
      { deletedAt: DateTime.now().setZone("Asia/Manila").toJSDate() }
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
