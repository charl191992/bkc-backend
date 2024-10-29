import { body, param } from "express-validator";
import User from "../../smscr/users/user.schema.js";

const userChangeStatusRules = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user id")
    .custom(async value => {
      const user = await User.exists({ _id: value });
      if (user) return true;
      throw new Error("User not found.");
    }),
];

export default userChangeStatusRules;
