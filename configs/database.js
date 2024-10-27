import mongoose from "mongoose";
import User from "../smscr/users/user.schema.js";
import UserDetails from "../smscr/user_details/user-details.schema.js";
import setFullname from "../utils/construct-fullname.js";

export default () => {
  mongoose.set("strictQuery", true);
  mongoose.connect(process.env.ATLAS_URI, {});
  mongoose.connection.once("open", async () => {
    const su = await User.countDocuments({ role: "superadmin" });
    if (su < 1) {
      const suUserQuery = new User({
        email: process.env.SU_EMAIL,
        role: process.env.SU_ROLE,
        password: process.env.SU_PASSWORD,
        display_image: "",
      });
      await suUserQuery.savePassword(process.env.SU_PASSWORD);
      await suUserQuery.save();

      const details = await new UserDetails({
        user: suUserQuery._id,
        name: {
          firstname: process.env.SU_FIRSTNAME,
          lastname: process.env.SU_LASTNAME,
          middlename: "",
          extname: "",
          fullname: setFullname(
            process.env.SU_FIRSTNAME,
            process.env.SU_LASTNAME
          ),
        },
      }).save();

      await User.findByIdAndUpdate(suUserQuery._id, {
        $set: {
          details: details._id,
        },
      }).exec();
    }

    console.log("connection to database has been established.");
  });
};
