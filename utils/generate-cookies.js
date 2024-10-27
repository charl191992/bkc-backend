const generate_cookies = (res, access, sessionId) => {
  res.cookie("bkc_access", access, {
    domain: process.env.COOKIE_DOMAIN,
    path: "/api/v1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
    sameSite: "Lax",
    // signed: process.env.NODE_ENV === "production",
  });

  res.cookie("bkc_session", sessionId, {
    domain: process.env.COOKIE_DOMAIN,
    path: "/api/v1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "Lax",
    // signed: process.env.NODE_ENV === "production",
  });
};

export const clear_cookies = res => {
  res.clearCookie("pom_session");
  res.clearCookie("pom_access");
};

export default generate_cookies;
