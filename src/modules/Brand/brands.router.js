import { Router } from "express";
import * as controller from "./brands.conrollers.js";
import { getDocumentByName } from "../../middlewares/finders.middleware.js";
import { errorHandler, multerHost } from "../../middlewares/index.js";
import { Brand } from "../../../DB/models/index.js";
import { extensions } from "../../utils/index.js";
const brandRouter = Router();

// @route   POST /brands/create
brandRouter.post("/create",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(Brand),
    errorHandler(controller.createBrand)
);

// @route   GET /brand
brandRouter.get("/", errorHandler(controller.getBrand));

// @route   PUT /brand/update/:id
brandRouter.put("/update/:id",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(Brand),
    errorHandler(controller.updateBrand)
);
// @route   DELETE /brand/delete/:id
brandRouter.delete("/delete/:id", errorHandler(controller.deleteBrand));

export { brandRouter }