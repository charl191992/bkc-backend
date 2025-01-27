import * as AssessmentSectionService from "./assessment.section.service.js";

export const createAssessmentSection = async (req, res, next) => {
  try {
    const result = await AssessmentSectionService.create_assessment_section(
      req.body
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAssessmentSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await AssessmentSectionService.update_assessment_section(
      id,
      req.body
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteAssessmentSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await AssessmentSectionService.delete_assessment_section(id);
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
