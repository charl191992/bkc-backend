import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

const logDir = path.resolve(__dirname, "../logs");

if (!fs.existsSync(logDir)) {
  await fs.promises.mkdir(logDir, { recursive: true });
}

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "info",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d", // Keep logs for 14 days
    }),
    new transports.Console(), // Log to console as well
  ],
});

export const logRequest = (controller, fnName, desc, code) => {
  const info = code ? `${code} - ${desc}` : desc;
  const logMessage = {
    timestamp: new Date().toISOString(),
    controller,
    function: fnName,
    code: code || "N/A",
    info,
  };
  logger.info(logMessage);
};

export default logger;
