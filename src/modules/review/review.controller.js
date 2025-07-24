import { Order, Product, Review } from "../../../DB/models/index.js";
import { ErrorClass, ReviewStatus } from "../../utils/index.js";

/**
 * @api {POST} /reviews/add/:id add review
 */
export const addReview = async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const { reviewRating, reviewText } = req.body;

  // check if user already reviewd this product
  const isAlradyReviewd = await Review.findOne({ userId, productId });
  if (isAlradyReviewd) {
    return next(
      new ErrorClass(
        "You already reviewd this product",
        400,
        "You already reviewd this product"
      )
    );
  }

  // check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorClass("Product not found", 404, "Product not found"));
  }

  // check if user bought this product
  console.log({ userId, productId });

  const isBought = await Order.find({
    userId,
    "porducts.productId": productId,
    orderStatus: "delivered"
    ,
  });
  console.log({ isBought });

  if (!isBought) {
    return next(
      new ErrorClass(
        "You have not bought this product",
        400,
        "You have not bought this product"
      )
    );
  }

  const review = new Review({
    userId,
    productId,
    reviewRating,
    reviewText,
  });
  await review.save();

  // update product rating
  product.rating = (product.rating + reviewRating) / 2;
  await product.save();

  res.status(201).json({ message: "Review added successfully", data: review });

};

/**
 * @api {GET} /reviews/ list review
 */
export const listReview = async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const { page, limit } = req.query;
  const skip = (page - 1) * limit;


  const reviews = await Review.find().skip(skip).limit(limit).populate([
    {
      path: "userId",
      select: "userName email age gender phone"
    },
    {
      path: "productId",
      select: "titel price stock"
    }
  ])
  res.status(200).json({ message: "Reviews fetched successfully", data: reviews });
}

/**
 * @api {PUT} /reviews/approve-reject/:id approve or reject review
 */
export const approveRejectReview = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // check if review exists
  const review = await Review.findById(id);
  if (!review) {
    return next(new ErrorClass("Review not found", 404, "Review not found"));
  }

  if (status === ReviewStatus.Accepted) {
    review.reviewStatus = ReviewStatus.Accepted;
  } else if (status === ReviewStatus.Rejected) {
    review.reviewStatus = ReviewStatus.Rejected;
  } else {
    return next(
      new ErrorClass("Invalid status", 400, "Invalid status")
    );
  }
  await review.save();

  res.status(200).json({ message: "Review status updated successfully", data: review });

}