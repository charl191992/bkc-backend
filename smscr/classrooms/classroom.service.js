import CustomError from "../../utils/custom-error.js";
import Classroom from "./classroom.schema.js";

export const create_classroom = async (teacher, student, data) => {
  try {
    const classroom = await new Classroom({
      teacher: teacher,
      students: [student],
      startTime: data.start,
      endTime: data.end,
      description: data?.description || "",
      status: "pending",
    }).save();

    return {
      success: true,
      classroom,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to create a room",
      error.statusCode || 500
    );
  }
};
