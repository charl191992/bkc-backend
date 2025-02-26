import Session from "../smscr/sessions/session.schema";
import jwt from "jsonwebtoken";
import isIdValid from "../utils/check-id";

const verifyAssessmentAccess = async (req, res, next) => {
  const enrollee = req.headers["x-assessment-token"];

  if (!isIdValid(enrollee)) {
    return res
      .status(401)
      .json({ success: false, message: "Assessment not yet scheduled." });
  }

  const session = await Session.findById({ _id: enrollee }).exec();

  if (!session) {
    return res
      .status(401)
      .json({ success: false, message: "Assessment not yet scheduled." });
  }

  if (new Date() >= new Date(session.expiresIn)) {
    await Session.deleteOne({ _id: session._id });
    return res
      .status(401)
      .json({ success: false, message: "Assessment already expired." });
  }

  try {
    const decoded = jwt.verify(
      session.access,
      process.env.ASSESSMENT_JWT_SECRET
    );
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Assessment not yet scheduled." });
  }
};

export default verifyAssessmentAccess;
