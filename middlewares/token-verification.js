import passport from "passport";
import Session from "../smscr/sessions/session.schema.js";
import isIdValid from "../utils/check-id.js";
import generate_cookies, { clear_cookies } from "../utils/generate-cookies.js";
import getToken from "../utils/get-token.js";
import User from "../smscr/users/user.schema.js";
import jwtUtils from "../configs/token.js";

const verifyToken = async (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async err => {
    const token = getToken(req);

    if (err && !token) {
      clear_cookies(res);
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!token) {
      clear_cookies(res);
      return res.status(401).json({ code: "Unauthorized" });
    }

    const user = await User.findOne({ _id: token._id }).exec();

    if (!user) {
      clear_cookies(res);
      return res.status(401).json({ code: "Unauthorized" });
    }

    const sessionId = req.cookies["bkc_session"];
    if (!isIdValid(sessionId)) {
      clear_cookies(res);
      return res.status(401).json({ code: "Unauthorized" });
    }

    const session = await Session.findOne({
      _id: sessionId,
      user: user._id,
    }).exec();

    if (!session) {
      clear_cookies(res);
      return res.status(401).json({ code: "Unauthorized" });
    }

    if (new Date() >= new Date(session.expiresIn)) {
      await Session.deleteOne({ _id: session._id });
      clear_cookies(res);
      return res.status(401).json({ success: false, code: "Token Expired" });
    }

    clear_cookies(res);
    let newAccessToken = jwtUtils.generate_access(user, session._id);
    let newRefreshToken = jwtUtils.generate_refresh(user);

    await Session.updateOne(
      { _id: session._id },
      {
        $set: {
          refresh: newRefreshToken.refresh,
          expiresIn: newRefreshToken.expiration,
        },
      }
    );

    generate_cookies(res, newAccessToken.access, session._id);
    next();
  })(req, res, next);
};

export default verifyToken;
