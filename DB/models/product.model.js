import mongoose from "../global-setup.js";
import slugify from "slugify";
import { Badges, calculateProductPrice, DiscountType } from "../../src/utils/index.js";
const { Schema, model } = mongoose
const productSchema = new Schema({

    // Strings section
    title: {
        type: String,
        required: [true, "Product title is required"],
        trim: true
    },
    slug: {
        type: String,
        required: [true, "Product slug is required"],
        lowercase: true,
        default: function () {
            return slugify(this.title, {
                replacement: "_",
                lower: true,
            });
        }
    },
    overview: String,
    specs: Object, // Map of strings
    badge: {
        type: String,
        enum: Object.values(Badges),
    },

    // Numbers section
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [10, "Product price must be at least 10"],
    },
    appliedDiscount: {
        amount: {
            type: Number,
            min: 0,
           default: 0
        },
        type: {
            type: String,
            enum: Object.values(DiscountType),
            default: "Fixed",
        },
    },
    appliedPrice: {
        type: Number,
        required: [true, "Applied price is required"],
         default: function () {
                return calculateProductPrice(this.price, this.appliedDiscount);
            }
    }, // price , price - discount
    stock: {
        type: Number,
        required: [true, "Product stock is required"],
        min: [5, "Product stock cannot be less than 0"],
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be less than 0"],
        max: [5, "Rating cannot be more than 5"],
    },

    // Images Section
    Images: {
        URLS: [
            {
                secure_url: {
                    type: String,
                    required: [true, "Image URL is required"]
                },
                public_id: {
                    type: String,
                    required: [true, "Image public ID is required"],
                    unique: true
                }
            }
        ],
        customId: {
            type: String,
            required: [true, "Custom ID is required"],
            unique: true
        }

    },

    // Ids section
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category ID is required"]
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: [true, "Sub-Category ID is required"]
    },
    brandId: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        required: [true, "Brand ID is required"]
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        // required: [true, "Created by user ID is required"]
    },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.virtual("reviews", {
    ref: "Review",
    localField: "_id",
    foreignField: "productId",
});




export const Product =
    mongoose.models.Product || model("Product", productSchema);

