import { Router } from "express";
import { auth } from "../../middlewares/index.js";
import * as controller from "./review.controller.js";
import { errorHandler } from "../../middlewares/index.js";

const reviewRouter = Router();

// add Review
reviewRouter.post("/add/:productId",auth(), errorHandler(controller.addReview));

// list review
reviewRouter.get("/list/:productId",auth('Admin'), errorHandler(controller.listReview));

// approve or reject review
reviewRouter.put("/approve-reject/:id",auth('Admin'), errorHandler(controller.approveRejectReview));

export default reviewRouter;




export { reviewRouter }