import CustomError from "../../utils/custom-error.js";
import { stringEscape } from "../../utils/escape-string.js";
import getToken from "../../utils/get-token.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as materialServ from "./material.service.js";

export const getGlobalMaterials = async (req, res, next) => {
  try {
    const { page, limit, keyword: search } = req.query;
    const { validatedLimit, validatedOffset, validatedPage } = validatePaginationParams(limit, page);
    const result = await materialServ.get_global_materials(validatedLimit, validatedOffset, validatedPage, stringEscape(search));
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPersonalMaterials = async (req, res, next) => {
  try {
    const token = getToken(req);
    const { page, limit, search } = req.query;
    const { validatedLimit, validatedOffset, validatedPage } = validatePaginationParams(limit, page);
    const result = await materialServ.get_personal_materials(token._id, validatedLimit, validatedOffset, validatedPage, stringEscape(search));
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getGlobalMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await materialServ.get_global_material(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPersonalMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await materialServ.get_personal_material(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const addGlobalMaterial = async (req, res, next) => {
  try {
    if (!req.file) {
      const errorData = { path: "material", msgs: ["File is required"] };
      new CustomError("File is required", 400, [errorData]);
    }

    const token = getToken(req);
    const result = await materialServ.add_global_file(token._id, req.file);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const addPersonalMaterial = async (req, res, next) => {
  try {
    if (!req?.file) {
      const errorData = { path: "material", msgs: ["File is required"] };
      new CustomError("File is required", 400, [errorData]);
    }

    const token = getToken(req);
    const result = await materialServ.add_personal_file(token._id, req.file);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateGlobalMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      const errorData = { path: "material", msgs: ["File is required"] };
      new CustomError("File is required", 400, [errorData]);
    }
    const result = await materialServ.update_global_file(id, req.file);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updatePersonalMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      const errorData = { path: "material", msgs: ["File is required"] };
      new CustomError("File is required", 400, [errorData]);
    }
    const token = getToken(req);
    const result = await materialServ.update_personal_file(id, token._id, req.file);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteGlobalMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await materialServ.delete_global_file(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deletePersonalMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const token = getToken(req);
    const result = await materialServ.delete_personal_file(id, token._id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const downloadMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const token = getToken(req);
    await materialServ.download_material(req, res, id, token._id);
  } catch (error) {
    next(error);
  }
};
