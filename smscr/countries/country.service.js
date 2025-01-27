import Country from "./country.schema.js";
import CustomError from "../../utils/custom-error.js";
import { DateTime } from "luxon";

export const get_countries = async (limit, offset, page, search) => {
  try {
    const filter = {};
    if (search) filter.label = new RegExp(search, "i");

    const countPromise = Country.countDocuments(filter);
    const countriesPromise = Country.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .exec();

    const [count, countries] = await Promise.all([
      countPromise,
      countriesPromise,
    ]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      countries,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError("Failed to get the levels", 500);
  }
};

export const create_country = async data => {
  try {
    const { country, timezone } = data;

    const newCountry = await new Country({
      label: country.toLocaleUpperCase(),
      timezone: timezone,
    }).save();

    if (!newCountry)
      throw new CustomError("Failed to create a new country", 500);

    return {
      success: true,
      country: newCountry,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const update_country = async (id, data) => {
  try {
    const { country, timezone } = data;

    const updatedCountry = await Country.findByIdAndUpdate(
      id,
      {
        $set: {
          label: country.toLocaleUpperCase(),
          timezone: timezone,
        },
      },
      { new: true }
    ).exec();

    if (!updatedCountry)
      throw new CustomError("Failed to update the country", 500);

    return {
      success: true,
      country: updatedCountry,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const delete_country = async id => {
  try {
    const deleted = await Country.updateOne(
      { _id: id },
      { deletedAt: DateTime.now().setZone("Asia/Manila").toJSDate() }
    ).exec();

    if (!deleted.acknowledged) {
      throw new CustomError("Failed to delete the country", 500);
    }

    return {
      success: true,
      deletedId: id,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
