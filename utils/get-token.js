import jwt from "jsonwebtoken";
import CustomError from "./custom-error.js";

const getToken = req => {
  const authHeader = req.cookies["bkc_access"];
  if (!authHeader) throw new CustomError("Unauthorized", 401);

  const token = authHeader;
  if (!token) throw new CustomError("Unauthorized", 401);

  return jwt.decode(token);
};

export default getToken;
