import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import User from "../smscr/users/user.schema.js";

passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        let user = await User.findOne({
          email,
        })
          .populate({
            path: "details",
            select: "name",
          })
          .exec();

        if (!user)
          return done(null, false, {
            path: "root",
            message: "Invalid Credentials",
          });

        const didMatch = await user.matchPassword(password);

        if (!didMatch)
          return done(null, false, {
            path: "root",
            message: "Invalid Credentials",
          });

        return done(null, user);
      } catch (error) {
        return done(error, null, {
          message: "Failed to login.\nInternal error.",
        });
      }
    }
  )
);

let jwtOptions = {
  secretOrKey: process.env.ACCESS_JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  "jwt",
  new JwtStrategy(jwtOptions, (payload, done) => {
    User.findById(payload._id)
      .then(res => {
        if (!res) return done(null, false);
        return done(null, res);
      })
      .catch(err => {
        return done(err, null);
      });
  })
);
