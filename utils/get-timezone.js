import UserDetails from "../smscr/user_details/user-details.schema";
import CustomError from "./custom-error";

export const get_timezone = async user_details_id => {
  const details = await UserDetails.findById(user_details_id).exec();
  if (!details) throw new CustomError("User not found.", 404);
  return details.timezone;
};
