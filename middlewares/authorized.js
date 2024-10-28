import User from "../smscr/users/user.schema.js";
import isIdValid from "../utils/check-id.js";
import getToken from "../utils/get-token.js";

const isAuthorized = (roles = []) => {
  if (typeof roles === "string") roles = [roles];
  return async (req, res, next) => {
    const token = getToken(req);

    if (!isIdValid(token._id))
      return res.status(403).json({ msg: "Forbidden" });

    const user = await User.findById(token._id).exec();

    if (!user) return res.status(403).json({ msg: "Forbidden" });

    if (!roles.includes(user.role))
      return res.status(403).json({ msg: "Forbidden" });

    next();
  };
};

export default isAuthorized;
