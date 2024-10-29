export const stringEscape = str => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
