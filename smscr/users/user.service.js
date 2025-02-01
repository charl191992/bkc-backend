import User from "./user.schema.js";
import CustomError from "../../utils/custom-error.js";
import UserDetails from "../user_details/user-details.schema.js";
import setFullname from "../../utils/construct-fullname.js";

export const create_admin = async data => {
  try {
    const user = new User({
      email: data.email,
      password: data.password,
      display_image: "",
      role: data.account_role,
    });
    await user.savePassword(data.password);
    await user.save();

    if (!user) throw new CustomError("Failed to create a user", 500);

    const details = await new UserDetails({
      user: user._id,
      name: {
        firstname: data.firstname,
        middlename: "",
        lastname: data.lastname,
        extname: "",
        fullname: setFullname(data.firstname, data.lastname),
      },
    }).save();

    if (!details) {
      if (user) await User.deleteOne({ _id: user._id }).exec();
      throw new CustomError("Failed to create a user", 500);
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { details: details._id },
    }).exec();

    return {
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        display_image: user.display_image,
        status: user.status,
        createdAt: user.createdAt,
        details: {
          _id: details._id,
          name: details.name,
        },
      },
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const get_admins_by_role = async (role, limit, offset, page, search) => {
  try {
    const filter = { role };
    if (search) filter.email = new RegExp(search, "i");

    const selected = {
      email: 1,
      display_image: 1,
      role: 1,
      createdAt: 1,
      status: 1,
    };

    const countPromise = User.countDocuments(filter);
    const usersPromise = User.find(filter, selected)
      .populate({
        path: "details",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const [count, users] = await Promise.all([countPromise, usersPromise]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      users,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const change_user_status = async (user, status) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      user,
      { $set: { status } },
      { new: true }
    );
    if (!updatedUser)
      throw new CustomError("Failed to update user status", 500);

    return {
      success: true,
      status: updatedUser.status,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
