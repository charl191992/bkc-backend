import mongoose from "mongoose";

const toObjID = id => new mongoose.Types.ObjectId(`${id}`);

export default toObjID;
