import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import express from "express";
import http from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import database from "./configs/database.js";
import routers from "./routes/index.js";
import passport from "passport";
import globalErrorHandler from "./middlewares/global-error-handler.js";
import cors from "cors";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(
  cors({
    origin: (origin, cb) => {
      const allowedOrigins = process.env.ALLOWED_CORS.split(" ");
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("CORS ERROR"));
      }
    },
    methods: process.env.ALLOWED_METHODS.split(" "), // List only` available methods
    credentials: true, // Must be set to true
    allowedHeaders: [
      "Origin",
      "Content-Type",
      "X-Requested-With",
      "Accept",
      "Authorization",
      "Access-Control-Allow-Credentials",
    ],
  })
);

app.use(passport.initialize());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/assets", express.static(join(__dirname, "assets")));
app.use(express.static(join(__dirname, "./client/build")));

const server = http.createServer(app);

import("./configs/passport.js");
routers(app);

app.use(globalErrorHandler);

const port = process.env.PORT || 5000; // Dynamic port for deployment
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  database();
});
