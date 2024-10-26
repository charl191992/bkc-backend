import setFullname from "../../utils/construct-fullname.js";
import CustomError from "../../utils/custom-error.js";
import UserDetails from "./user-details.schema.js";

export const createUserDetails = async (user_id, data) => {
  try {
    const fullname = setFullname(
      data.first_name,
      data.last_name,
      data.middle_name || "",
      data.suffix || ""
    );

    const userDetails = {
      user: user_id,
      name: {
        first_name: data.first_name,
        middle_name: data.middle_name || "",
        last_name: data.last_name,
        suffix: data.suffix || "",
        fullname: fullname,
        display_name: data.display_name,
      },
      gender: data.gender,
      birthdate: data.birthdate,
      contact: data.contact,
      nationality: data.nationality,
      address: {
        address_one: data.address_one,
        address_two: data.address_two,
        city: data.city,
        province: data.province,
        country: data.country,
        zip: data.zip,
      },
    };

    if (type === "student") {
      userDetails.relatives = {
        father_name: data.father_name || "",
        father_contact: data.father_contact || "",
        mother_name: data.mother_name || "",
        mother_contact: data.mother_contact || "",
        guardian_name: data.guardian_name || "",
        guardian_contact: data.contact || "",
      };
    }

    if (type !== "student") {
      userDetails.marital_status = data.marital_status;
    }

    const newUserDetails = await new UserDetails(userDetails).save();

    return { details: newUserDetails };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
