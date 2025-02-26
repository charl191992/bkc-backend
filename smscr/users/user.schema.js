import mongoose from "mongoose";
import CustomError from "../../utils/custom-error.js";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    display_name: { type: String, required: false },
    display_image: { type: String, required: false },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "enrolling", "rejected"],
      required: false,
      default: "enrolling",
    },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    details: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetails" },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new CustomError("Password comparison failed", 500);
  }
};

userSchema.methods.savePassword = async function (pw) {
  try {
    this.password = await bcrypt.hash(pw, 10);
  } catch (error) {
    throw new CustomError("Password hashing failed", 500);
  }
};

const User = mongoose.model("User", userSchema);

export default User;
