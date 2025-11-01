import mongoose from "mongoose";
import CustomError from "../../utils/custom-error.js";
import fs from "fs";
import path from "path";
import Material from "./material.schema.js";

export const get_global_materials = async (limit, offset, page, keyword) => {
  let filter = { type: "global" };
  if (keyword) filter = { ...filter, "meta.originalname": new RegExp(keyword, "i") };

  const materialsPromise = Material.find(filter).select("-__v -updatedAt").sort("-createdAt").skip(offset).limit(limit).lean().exec();
  const countPromise = Material.countDocuments(filter);

  const [count, materials] = await Promise.all([countPromise, materialsPromise]);

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

export const get_personal_materials = async (author, limit, offset, page, keyword) => {
  let filter = { type: "personal", author };
  if (keyword) filter = { ...filter, "meta.originalname": new RegExp(keyword, "i") };

  console.log(keyword, filter);

  const materialsPromise = Material.find(filter).select("-__v -updatedAt").sort("-createdAt").skip(offset).limit(limit).lean().exec();
  const countPromise = Material.countDocuments(filter);

  const [count, materials] = await Promise.all([countPromise, materialsPromise]);

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

export const get_global_material = async id => {
  const material = await Material.findOne({ _id: id, type: "global" }).select("-__v -updatedAt").lean().exec();
  return { success: true, material };
};

export const get_personal_material = async id => {
  const material = await Material.findOne({ _id: id, type: "personal" }).select("-__v -updatedAt").lean().exec();
  return { success: true, material };
};

export const add_personal_file = async (user, file) => {
  try {
    const material = await new Material({
      author: user,
      type: "personal",
      filePath: `material-uploads/${file.filename}`,
      meta: {
        size: file.size,
        originalname: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
      },
    }).save();

    if (!material) throw new CustomError("Failed to add new material", 400);

    return { success: true, material };
  } catch (error) {
    fs.unlink(file.path);
    throw new CustomError("Failed to add new material", 400);
  }
};

export const add_global_file = async (user, file) => {
  try {
    const material = await new Material({
      author: user,
      type: "global",
      filePath: `material-uploads/${file.filename}`,
      meta: {
        size: file.size,
        originalname: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
      },
    }).save();

    if (!material) throw new CustomError("Failed to add new material", 400);

    return { success: true, material };
  } catch (error) {
    fs.unlink(file.path);
    throw new CustomError("Failed to add new material", 400);
  }
};

export const update_personal_file = async (id, user, file) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const filter = { _id: id, author: user, deletedAt: null };
    const options = { new: true, session };
    const updates = {
      $set: {
        filePath: `material-uploads/${file.filename}`,
        meta: {
          size: file.size,
          originalname: file.originalname,
          filename: file.filename,
          mimeType: file.mimetype,
        },
      },
    };

    const oldMaterial = await Material.findOne(filter).session(session).exec();
    if (!oldMaterial) throw new CustomError("Material you want to update does not exists.", 400);

    const material = await Material.findOneAndUpdate(filter, updates, options).exec();
    if (!material) throw new CustomError("Material you want to update does not exists.", 400);

    await fs.promises.unlink(path.resolve(global.rootDir, oldMaterial.filePath));
    await session.commitTransaction();

    return { success: true, material };
  } catch (error) {
    fs.unlink(file.path);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
};

export const update_global_file = async (id, file) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const filter = { _id: id, deletedAt: null };
    const options = { new: true, session };
    const updates = {
      $set: {
        filePath: `material-uploads/${file.filename}`,
        meta: {
          size: file.size,
          originalname: file.originalname,
          filename: file.filename,
          mimeType: file.mimetype,
        },
      },
    };

    const oldMaterial = await Material.findOne(filter).session(session).exec();
    if (!oldMaterial) throw new CustomError("Material you want to update does not exists.", 400);

    const material = await Material.findOneAndUpdate(filter, updates, options).exec();
    if (!material) throw new CustomError("Material you want to update does not exists.", 400);

    await fs.promises.unlink(path.resolve(global.rootDir, oldMaterial.filePath));
    await session.commitTransaction();

    return { success: true, material };
  } catch (error) {
    fs.unlink(file.path);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
};

export const delete_personal_file = async (id, user) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const filter = { _id: id, author: user };

    const material = await Material.findOne(filter).exec();
    if (!material) throw new CustomError("Material not found", 400);

    const deleted = await Material.deleteOne(filter).exec();
    if (deleted.deletedCount < 1) throw new CustomError("Material not found", 400);

    await fs.promises.unlink(path.resolve(global.rootDir, material.filePath));
    await session.commitTransaction();

    return { success: true, material: material._id };
  } catch (error) {
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
};

export const delete_global_file = async id => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const filter = { _id: id };

    const material = await Material.findOne(filter).exec();
    if (!material) throw new CustomError("Material not found", 400);

    const deleted = await Material.deleteOne(filter).exec();
    if (deleted.deletedCount < 1) throw new CustomError("Material not found", 400);

    await fs.promises.unlink(path.resolve(global.rootDir, material.filePath));
    await session.commitTransaction();

    return { success: true, material: material._id };
  } catch (error) {
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
};

export const download_material = async (req, res, id, downloader) => {
  try {
    const file = await Material.findById(id).exec();

    if (file.type !== "global" && !file.author.equals(downloader)) {
      return res.status(403).json({ success: false, message: "You don't have permission to download this file" });
    }

    const filePath = path.join(global.rootDir, file.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }

    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Set headers
    res.set({
      "Content-Type": file.meta.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.meta.originalname)}"`,
      "Content-Length": fileSize,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
    });

    // Handle range requests for large files
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.set({
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": chunksize,
        Status: 206,
      });

      const fileStream = fs.createReadStream(filePath, { start, end });
      fileStream.pipe(res);
    } else {
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    }
  } catch (error) {
    console.error("Download Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to download file. Please try again",
      });
    }
  }
};
