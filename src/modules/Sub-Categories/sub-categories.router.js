import { Router } from "express";
import * as controller from "./sub-categories.controller.js";
import { errorHandler, multerHost } from "../../middlewares/index.js";
import { extensions } from "../../utils/file-extenstions.utils.js";
import { getDocumentByName } from "../../middlewares/finders.middleware.js";
import { SubCategory } from "../../../DB/models/sub-category.model.js";


const subCategoryRouter = Router();

// @route   POST /sub-categories/create
subCategoryRouter.post("/create",
    multerHost({ allowedExtensions : extensions.Images }).single("image"),
    getDocumentByName(SubCategory),
    errorHandler(controller.createSubCategory)
);

// @route   GET /sub-categories
subCategoryRouter.get("/", errorHandler(controller.getSubCategory));

// @route   PUT /sub-categories/update/:id
subCategoryRouter.put("/update/:id",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(SubCategory),
    errorHandler(controller.updateSubCategory)
);

// @route   DELETE /sub-categories/delete/:id
subCategoryRouter.delete("/delete/:id", errorHandler(controller.deleteSubCategory));


export { subCategoryRouter };