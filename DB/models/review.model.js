import mongoose from "mongoose";
import { ReviewStatus } from "../../src/utils/index.js";
const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    reviewRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: String,
    reviewStatus: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.Pending,
    },
    actionDoneBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Review = mongoose.models.Review || model("Review", reviewSchema);
