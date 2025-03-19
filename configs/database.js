import mongoose from "mongoose";
import User from "../smscr/users/user.schema.js";
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
        details: {
          name: {
            firstname: process.env.SU_FIRSTNAME,
            lastname: process.env.SU_LASTNAME,
            middlename: "",
            extname: "",
            status: "active",
            fullname: setFullname(
              process.env.SU_FIRSTNAME,
              process.env.SU_LASTNAME
            ),
          },
          timezone: process.env.SU_TIMEZONE,
        },
      });
      await suUserQuery.savePassword(process.env.SU_PASSWORD);
      await suUserQuery.save();
    }
    console.log("connection to database has been established.");
  });
};
