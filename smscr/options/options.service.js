import Country from "../countries/country.schema.js";
import Subject from "../subjects/subject.schema.js";
import Level from "../levels/level.schema.js";
import CustomError from "../../utils/custom-error.js";

export const get_options = async () => {
  try {
    const countryPromise = Country.find({ deletedAt: null })
      .select({ label: 1 })
      .sort({ label: -1 });
    const subjectPromise = Subject.find({ deletedAt: null, status: "approved" })
      .sort({ label: -1 })
      .select({ label: 1 });
    const levelPromise = Level.find({ deletedAt: null })
      .sort({ createdAt: 1 })
      .select({ label: 1 });

    const [countries, subjects, levels] = await Promise.all([
      countryPromise,
      subjectPromise,
      levelPromise,
    ]);

    return {
      success: true,
      countries,
      subjects,
      levels,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
