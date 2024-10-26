import jwt from "jsonwebtoken";

const generate_access = (user, sessionId) => {
  const expiresIn = "10m";
  const access = jwt.sign(
    {
      sub: sessionId,
      _id: user._id,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
    },
    process.env.ACCESS_JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: expiresIn,
    }
  );

  const expiration = Date.now() + 10 * 60 * 1000;

  return {
    access,
    expiration,
  };
};

const generate_refresh = user => {
  const expiresIn = "1d";
  const refresh = jwt.sign({ _id: user._id }, process.env.REFRESH_JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: expiresIn,
  });
  const expiration = Date.now() + 24 * 60 * 60 * 1000;

  return {
    refresh,
    expiration,
  };
};

const jwtUtils = {
  generate_access,
  generate_refresh,
};

export default jwtUtils;
