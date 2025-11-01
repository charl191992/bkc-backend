const mongoose = require("mongoose");

const materialShareSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sharedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
    isFolder: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MaterialShare = mongoose.model("MaterialShare", materialShareSchema);

export default MaterialShare;
