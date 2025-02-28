import User from "./user.schema.js";
import CustomError from "../../utils/custom-error.js";
import UserDetails from "../user_details/user-details.schema.js";
import setFullname from "../../utils/construct-fullname.js";
import { student, teacher } from "../../utils/roles.js";

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

export const get_user_by_type = async (
  limit,
  offset,
  page,
  search,
  role,
  type = ""
) => {
  try {
    const aggregations = [
      { $match: { role } },
      {
        $lookup: {
          from: "userdetails",
          localField: "details",
          foreignField: "_id",
          as: "details",
        },
      },
      { $unwind: "$details" },
    ];

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
          $or: [
            { "details.name.fullname": new RegExp(search, "i") },
            { email: new RegExp(search, "i") },
          ],
        },
      });
    }
    const countPromise = User.aggregate([...aggregations, { $count: "count" }]);

    aggregations.push({ $sort: { createdAt: -1 } });

    const usersPromise = User.aggregate([
      ...aggregations,
      { $skip: offset },
      { $limit: limit },
    ]);

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
    throw new CustomError(
      error.message || "Failed to get the users list",
      error.statusCode || 500
    );
  }
};
