import { stringEscape } from "../../utils/escape-string.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as CountryService from "./country.service.js";

export const getCountries = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search || "";
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await CountryService.get_countries(
      validatedLimit,
      validatedOffset,
      validatedPage,
      stringEscape(search)
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createCountry = async (req, res, next) => {
  try {
    const result = await CountryService.create_country(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateCountry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await CountryService.update_country(id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await CountryService.delete_country(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
