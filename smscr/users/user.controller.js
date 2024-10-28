import * as UserService from "./user.service.js";

export const createAdmin = async (req, res, next) => {
  try {
    const result = await UserService.create_admin(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
