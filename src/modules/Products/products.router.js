import { Router } from "express";
import * as controller from "./products.controller.js";
import { errorHandler, multerHost } from "../../middlewares/index.js";
import { extensions } from "../../utils/index.js";
import { checkIfIdsExist } from "../../middlewares/index.js";
import { Brand } from "../../../DB/models/index.js";

const productRouter = Router();

// Create Product
productRouter.post(
    "/add",
    multerHost({ allowedExtensions: extensions.Images}).array("image", 5),
    checkIfIdsExist(Brand),
   errorHandler(controller.addProduct)
);

// Update Product
productRouter.put(
    "/update/:id",
    multerHost({ allowedExtensions: extensions.Images}).array("image", 5),
    errorHandler(controller.updateProduct)
);

// List Products
productRouter.get(
    "/list",
    errorHandler(controller.listProducts)
);

// get product by id
productRouter.get(
    "/:id",
    errorHandler(controller.getProductById)
);

export default productRouter;





export {productRouter}