export const stringEscape = str => {
  return str ? str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
};
