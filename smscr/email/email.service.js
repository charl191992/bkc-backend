import sgMail from "@sendgrid/mail";
import CustomError from "../../utils/custom-error.js";
import fs from "fs";

const emailFrom = process.env.EMAIL_FROM;
const sendGridAPI = process.env.EMAIL_API_KEY;

const loadTemplate = (filePath, replacements) => {
  let template = fs.readFileSync(filePath, "utf8");

  for (const key in replacements) {
    template = template.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
  }
  return template;
};

export const sendAssessmentEmail = async (emailTo, subject, template, replacements) => {
  try {
    const htmlContent = loadTemplate(template, replacements);

    sgMail.setApiKey(sendGridAPI);
    sgMail.send({
      to: emailTo,
      from: emailFrom,
      subject: subject,
      html: htmlContent,
    });
  } catch (error) {
    throw new CustomError("Failed to send the assessment email");
  }
};

export const sendApplicationApprovalEmail = async (emailTo, subject, template, replacements) => {
  try {
    const htmlContent = loadTemplate(template, replacements);
    sgMail.setApiKey(sendGridAPI);
    sgMail.send({
      to: emailTo,
      from: emailFrom,
      subject: subject,
      html: htmlContent,
    });
  } catch (error) {
    throw new CustomError("Failed to send the application approval email");
  }
};

export const sendEnrollmentApprovalEmail = async (emailTo, subject, template, replacements) => {
  try {
    const htmlContent = loadTemplate(template, replacements);
    sgMail.setApiKey(sendGridAPI);
    sgMail.send({
      to: emailTo,
      from: emailFrom,
      subject: subject,
      html: htmlContent,
    });
  } catch (error) {
    throw new CustomError("Failed to send the enrollment approval email");
  }
};

export const sendRecommendation = async (emailTo, subject, template, replacements) => {
  try {
    const htmlContent = loadTemplate(template, replacements);
    sgMail.setApiKey(sendGridAPI);
    sgMail.send({
      to: emailTo,
      from: emailFrom,
      subject: subject,
      html: htmlContent,
    });
  } catch (error) {
    throw new CustomError("Failed to send the recommendation email");
  }
};
