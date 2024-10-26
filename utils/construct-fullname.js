const setFullname = (firstName, lastName, middleName = "", suffix = "") => {
  let fullName = `${firstName}`;

  if (middleName) {
    fullName += ` ${middleName}`;
  }

  fullName += ` ${lastName}`;

  if (suffix) {
    fullName += `, ${suffix}`;
  }

  return fullName.trim();
};

export default setFullname;
