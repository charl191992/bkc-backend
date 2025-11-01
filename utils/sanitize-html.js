import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

const dom = new JSDOM("<!DOCTYPE html>");
const { window } = dom;
const { document } = window;
const DOMPurify = createDOMPurify(window);

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["p", "strong", "em", "u", "s", "blockquote", "ol", "ul", "li", "h1", "h2", "h3", "a", "img"],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "class"],
  FORBID_ATTR: ["style", "onerror"],
  FORBID_TAGS: ["script", "iframe", "style"],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ["target"],
};

export const sanitizeHTML = dirty => {
  try {
    return DOMPurify.sanitize(dirty, SANITIZE_CONFIG);
  } catch (error) {
    console.error("Sanitization failed:", error);
    return "";
  }
};

export const getTextLength = html => {
  if (typeof html !== "string") return 0;
  return html.replace(/<[^>]*>/g, "").length;
};

export const getAccurateTextLength = html => {
  if (typeof html !== "string") return 0;
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent.length;
};

export const validateHTMLContent = (html, maxLength) => {
  const cleanHTML = sanitizeHTML(html);
  const length = getAccurateTextLength(cleanHTML);

  return {
    cleanHTML,
    length,
    isValid: length <= maxLength,
    isTruncated: length > maxLength,
  };
};

export const cleanupDom = () => {
  window.close();
};

if (typeof process !== "undefined") {
  process.on("SIGTERM", cleanupDom);
  process.on("SIGINT", cleanupDom);
}
