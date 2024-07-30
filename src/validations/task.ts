import { Joi } from "express-validation";
import { TaskCategories, Users } from "../utils/enum";

export const filterValidation = {
  body: Joi.object({
    users: Joi.array()
      .items(Joi.string().valid(...Object.values(Users)))
      .optional(),
    categories: Joi.array()
      .items(Joi.string().valid(...Object.values(TaskCategories)))
      .optional(),
    columnId: Joi.number().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }),
};
