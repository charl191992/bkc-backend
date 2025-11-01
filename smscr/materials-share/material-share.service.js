import CustomError from "../../utils/custom-error.js";
import MaterialShare from "./materials-share.schema.js";

export const get_shared_materials = async (sharedTo, limit, page, offset, keyword) => {
  const filter = { sharedTo };
  const materialFilter = { "material.meta.originalname": new RegExp(keyword, "i") };

  const pipelines = [];

  pipelines.push({ $match: filter });
  pipelines.push({ $lookup: { from: "materials", localField: "material", foreignField: "_id", as: "material" } });
  pipelines.push({ $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } });
  pipelines.push({ $addFields: { material: { $arrayElemAt: ["$material", 0] }, author: { $arrayElemAt: ["$author", 0] }, authorName: "$author.details.name" } });
  keyword && pipelines.push({ $match: materialFilter });
  pipelines.push({ $sort: { createdAt: -1 } });
  pipelines.push({ $skip: offset });
  pipelines.push({ $limit: limit });
  pipelines.push({
    $project: { __v: 0, updatedAt: 0, "material.__v": 0, "material.updatedAt": 0, sharedTo: 0, author: 0 },
  });

  const [count, materials] = await Promise.all([MaterialShare.countDocuments(filter), MaterialShare.aggregate(pipelines).exec()]);

  const hasNextPage = count > offset + limit;
  const hasPrevPage = page > 1;
  const totalPages = Math.ceil(count / limit);

  return {
    success: true,
    materials,
    hasNextPage,
    hasPrevPage,
    totalPages,
  };
};

export const share_material = async (author, sharedTo, material) => {
  const share = await new MaterialShare({ author, sharedTo, material }).save();
  if (!share) throw new CustomError("Sharing the material failed", 400);
  return { success: true };
};

export const unshare_material = async (id, author) => {
  const filter = { _id: id, author };
  const removeSharing = await MaterialShare.findOneAndDelete(filter).exec();
  if (!removeSharing) throw new CustomError("Unsharing the material failed", 400);
  return { success: true };
};
