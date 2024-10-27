import isIdValid from "../../utils/check-id.js";
import CustomError from "../../utils/custom-error.js";
import Session from "../sessions/session.schema.js";

export const logoutUser = async (req, res) => {
  try {
    const sessionId = req.cookies["bkc_session"];
    if (!isIdValid(sessionId)) throw new CustomError("Invalid session", 400);
    await Session.deleteOne({ _id: sessionId }).exec();

    res.clearCookie("bkc_access");
    res.clearCookie("bkc_session");

    return { success: true, message: "Logged Out successfully." };
  } catch (error) {
    console.log("LOGOUT", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
