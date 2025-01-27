import express from "express";
import * as OptionController from "./options.controller.js";

const optionRoutes = express.Router();

optionRoutes.get("/", OptionController.getOptions);

export default optionRoutes;
