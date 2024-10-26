import jwt from "jsonwebtoken";
import CustomError from "./custom-error.js";

const getToken = req => {
  const authHeader = req.cookies["pom_access"];
  if (!authHeader) throw new CustomError("Unauthorized", 401);

  const token = authHeader.split(" ")[1];
  if (!token) throw new CustomError("Unauthorized", 401);

  return jwt.decode(token);
};

export default getToken;
