import mongoose from "mongoose";

const isIdValid = id => mongoose.Types.ObjectId.isValid(id);

export default isIdValid;
