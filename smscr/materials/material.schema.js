import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["global", "personal"] },
    filePath: { type: String },
    meta: {
      size: { type: Number },
      originalname: { type: String },
      filename: { type: String },
      mimeType: { type: String },
    },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

materialSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

const Material = mongoose.model("Material", materialSchema);

export default Material;
