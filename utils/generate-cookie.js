export const generate_access_cookie = (res, access) => {
  res.cookie("bkc_access", access, {
    domain: process.env.COOKIE_DOMAIN,
    path: "/api/v1",
    httpOnly: true,
    secure: false,
    maxAge: 12 * 60 * 60 * 1000,
    // signed: true,
  });
};

export const generate_session_cookie = (res, sessionId) => {
  res.cookie("bkc_session", sessionId, {
    domain: process.env.COOKIE_DOMAIN,
    path: "/api/v1",
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // signed: true,
  });
};
