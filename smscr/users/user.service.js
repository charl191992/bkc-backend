import User from "./user.schema.js";
import CustomError from "../../utils/custom-error.js";
import setFullname from "../../utils/construct-fullname.js";
import { student, teacher } from "../../utils/roles.js";
import Application from "../applications/application.schema.js";

export const create_admin = async data => {
  try {
    const user = new User({
      email: data.email,
      password: data.password,
      display_image: "",
      role: data.account_role,
      details: {
        name: {
          firstname: data.firstname,
          middlename: "",
          lastname: data.lastname,
          extname: "",
          fullname: setFullname(data.firstname, data.lastname),
        },
      },
    });
    await user.savePassword(data.password);
    await user.save();

    if (!user) throw new CustomError("Failed to create a user", 500);

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
    const usersPromise = User.find(filter, selected).sort({ createdAt: -1 }).skip(offset).limit(limit);

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
    const updatedUser = await User.findByIdAndUpdate(user, { $set: { status } }, { new: true });
    if (!updatedUser) throw new CustomError("Failed to update user status", 500);

    return {
      success: true,
      status: updatedUser.status,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const get_user_by_type = async (limit, offset, page, search, role, type = "") => {
  try {
    const aggregations = [{ $match: { role } }];

    if (role === student && type === "enrolled") {
      aggregations.push(
        {
          $lookup: {
            from: "enrollments",
            localField: "enrollment",
            foreignField: "_id",
            as: "enrollment",
          },
        },
        { $unwind: "$enrollment" },
        {
          $match: { "enrollment.status": "approved" },
        }
      );
    }

    if (role === teacher && type === "approved") {
      aggregations.push(
        {
          $lookup: {
            from: "applications",
            localField: "application",
            foreignField: "_id",
            as: "application",
          },
        },
        { $unwind: "$application" },
        {
          $match: { "application.status": "approved" },
        }
      );
    }

    if (search) {
      aggregations.push({
        $match: {
          $or: [{ "details.name.fullname": new RegExp(search, "i") }, { email: new RegExp(search, "i") }],
        },
      });
    }
    const countPromise = User.aggregate([...aggregations, { $count: "count" }]);

    aggregations.push({ $sort: { createdAt: -1 } });

    const usersPromise = User.aggregate([...aggregations, { $skip: offset }, { $limit: limit }]);

    const [tempCount, users] = await Promise.all([countPromise, usersPromise]);
    const count = tempCount.length > 0 ? tempCount[0].count : 0;

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
    throw new CustomError(error.message || "Failed to get the users list", error.statusCode || 500);
  }
};

export const get_educators_availability = async (limit, offset, page, search) => {
  const filter = { status: "approved" };
  if (search) filter.$or = [{ "name.fullname": new RegExp(search, "i"), email: new RegExp(search, "i") }];
  const selected = { name: 1, teacher: 1, email: 1, subjects: 1, days: 1, _id: 0 };

  const countPromise = Application.countDocuments(filter);
  const educatorsPromise = Application.find(filter, selected).sort({ createdAt: -1 }).skip(offset).limit(limit);

  const [count, educators] = await Promise.all([countPromise, educatorsPromise]);

  const hasNextPage = count > offset + limit;
  const hasPrevPage = page > 1;
  const totalPages = Math.ceil(count / limit);

  return {
    success: true,
    educators,
    hasNextPage,
    hasPrevPage,
    totalPages,
  };
};
