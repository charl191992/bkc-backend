import CustomError from "../../../utils/custom-error.js";
import SubjectRequested from "./subject.request.schema.js";

export const get_requested_subjects = async (limit, offset, page, search) => {
  try {
    const filter = {};
    if (search) filter.label = new RegExp(search, "i");

    const countPromise = SubjectRequested.countDocuments(filter);
    const subjectsPromise = SubjectRequested.find(filter)
      .populate({
        path: "user",
        select: "details.name.fullname",
      })
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
    throw new CustomError(
      error.message || "Failed to get the requested subjects",
      error.statusCode || 500
    );
  }
};

export const request_subject = async (requestor, data, session = null) => {
  try {
    const options = session ? { session } : {};

    const request = await new SubjectRequested({
      user: requestor._id,
      name: data.subject,
    }).save(options);

    if (!request) throw new CustomError("Failed to request a subject", 500);

    return {
      success: true,
      request,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to request a subject",
      error.statusCode || 500
    );
  }
};
