import User from "../smscr/users/user.schema.js";
import CustomError from "./custom-error.js";

export const get_user_timezone = async user_id => {
  const user = await User.findById(user_id).exec();
  if (!user) throw new CustomError("User not found.", 404);
  return user.details.timezone;
};
