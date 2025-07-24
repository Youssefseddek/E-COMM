import { Router } from "express";
import * as controller from "./categories.controller.js"
import { errorHandler } from "../../middlewares/error-handling.middleware.js";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { extensions } from "../../utils/file-extenstions.utils.js";
import { getDocumentByName } from "../../middlewares/finders.middleware.js";
import { Category } from "../../../DB/models/category.model.js";

const categoryRouter = Router();

// routes
//add category
categoryRouter.post(
    "/create",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(Category),
    errorHandler(controller.createCategory)
)

// get category
categoryRouter.get("/",errorHandler(controller.getCategory))   

// update category
categoryRouter.put(
    "/update/:id",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(Category),
    errorHandler(controller.updateCategory)
)

// delete category
categoryRouter.delete(
    "/delete/:id",
    errorHandler(controller.deleteCategory)
);


// list categories
categoryRouter.get(
    "/list",
    errorHandler(controller.listCategories)
);



export { categoryRouter}