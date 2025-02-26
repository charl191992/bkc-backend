import passport from "passport";
import jwtUtils from "../../configs/token.js";
import Session from "../sessions/session.schema.js";
import generate_cookies, {
  clear_cookies,
} from "../../utils/generate-cookies.js";
import User from "../../smscr/users/user.schema.js";
import isIdValid from "../../utils/check-id.js";
import * as authService from "./auth.service.js";

export const login = (req, res) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err)
      return res.status(500).json({ success: false, msg: info, data: err });

    if (!user)
      return res.status(401).json({ success: false, msg: info.message });

    const refresh = jwtUtils.generate_refresh(user);

    const session = await new Session({
      user: user._id,
      refresh: refresh.refresh,
      expiresIn: refresh.expiration,
      type: "user",
    }).save();

    const access = jwtUtils.generate_access(user, session._id);
    generate_cookies(res, access.access, session._id);

    let rtnData = {
      success: true,
      msg: "ok",
      user: {
        _id: user._id,
        email: user.email,
        display_image: user.display_image,
        role: user.role,
        details: user?.details,
      },
    };

    return res.status(200).json(rtnData);
  })(req, res);
};

export const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req, res);
    return res.status(200).json({
      success: true,
      msg: "Successfully logout.",
    });
  } catch (error) {
    next(error);
  }
};

export const checkStatus = async (req, res, next) => {
  const sessionId = req.cookies["bkc_session"] || null;

  if (!sessionId || !isIdValid(sessionId)) {
    clear_cookies(res);
    return res.status(200).json({
      success: false,
    });
  }

  const session = await Session.findOne({
    _id: sessionId,
  }).exec();

  if (!session) {
    clear_cookies(res);
    return res.status(200).json({
      success: false,
    });
  }

  try {
    const user = await User.findOne({ _id: session.user })
      .populate({ path: "details", select: "name" })
      .exec();
    if (!user) {
      clear_cookies(res);
      return res.status(200).json({
        success: false,
      });
    }

    if (new Date() >= new Date(session.expiresIn)) {
      await Session.deleteOne({ _id: session._id });
      clear_cookies(res);
      return res.status(200).json({
        success: false,
      });
    }

    let newAccessToken = jwtUtils.generate_access(user, session._id);
    let newRefreshToken = jwtUtils.generate_refresh(user);

    await Session.updateOne(
      { _id: session._id },
      {
        $set: {
          refreshToken: newRefreshToken.refresh,
          expresIn: newRefreshToken.expiration,
        },
      }
    );

    generate_cookies(res, newAccessToken.access, session._id);

    let rtnData = {
      success: true,
      msg: "ok",
      user: {
        _id: user._id,
        email: user.email,
        display_image: user.display_image,
        role: user.role,
        details: user?.details,
      },
    };

    return res.status(200).json(rtnData);
  } catch (error) {
    if (session) {
      await Session.deleteOne({ _id: session._id });
      clear_cookies(res);
    }
    return res.status(200).json({
      success: false,
    });
  }
};
