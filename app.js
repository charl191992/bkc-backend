import "./configs/env.js";
import express from "express";
import http from "http";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import database from "./configs/database.js";
import routers from "./routes/index.js";
import passport from "passport";
import globalErrorHandler from "./middlewares/global-error-handler.js";
import cors from "cors";
import corsConfig from "./configs/cors.js";
import cookieParser from "cookie-parser";
import { ExpressPeerServer } from "peer";
import { Server } from "socket.io";
import socket, { initializeSocket } from "./configs/socket.js";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cookieParser(process.env.COOKIE_JWT_SECRET));

app.use(cors(corsConfig));

app.use(passport.initialize());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

global.rootDir = resolve(__dirname);

app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use(express.static(join(__dirname, "./client/build")));

const server = http.createServer(app);

import("./configs/passport.js");

const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use("/peer-server", peerServer);

const io = new Server(server, { cors: corsConfig });
initializeSocket(io);
socket(io);

routers(app);

app.use(globalErrorHandler);

const port = process.env.PORT || 5000; // Dynamic port for deployment
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  database();
});
