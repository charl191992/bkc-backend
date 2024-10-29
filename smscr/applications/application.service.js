import { countries } from "../../constants/countries.js";
import setFullname from "../../utils/construct-fullname.js";
import CustomError from "../../utils/custom-error.js";
import Application from "./application.schema.js";

export const createApplication = async data => {
  try {
    const fullname = setFullname(
      data.firstname,
      data.lastname,
      data.middlename || "",
      data.extname || ""
    );

    const country = countries.find(item => item.value === data.country);

    const applicationData = {
      email: data.email,
      name: {
        firstname: data.firstname,
        middlename: data.middlename || "",
        lastname: data.lastname,
        extname: data.extname || "",
        fullname: fullname,
        status: "for-review",
      },
      country: country,
      subjects: data.subjects,
      days: data.days,
      session_per_day: data.session_per_day,
      hours_per_session: data.hours_per_session,
      equipment: {
        stable_internet: data.stable_internet,
        noise_cancelling_headphones: data.noise_cancelling_headphones,
        microphone: data.has_microphone,
      },
      cv_link: data.cv_link,
      introduction_link: data.introduction_link,
    };

    const application = await new Application(applicationData).save();
    if (!application)
      throw new CustomError("Failed to send an application", 500);

    return { success: true };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
