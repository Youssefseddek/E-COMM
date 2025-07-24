import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // TODO: Change to true after adding authentication
    },
    Image: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
        unique: true,
      },
    },
    customId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

categorySchema.post("findByIdAndDelete", async function () {
    const id = this.getQuery()._id
    console.log(id);
    
  // delete all sub-categories and brands associated with this category
  const relatedSubCategories = await mongoose.models.SubCategory.deleteMany({
    categoryId: id,
  });
  console.log("subCategories are deleted",relatedSubCategories);
  
  if (relatedSubCategories.deletedCount) {
    const deletedBrands = await mongoose.models.Brand.deleteMany({
      categoryId: id,
    });
console.log("brands are deleted",deletedBrands);
    // delete releated products
    if (deletedBrands.deletedCount) {
       const deletedProducts = await mongoose.models.Products.deleteMany({
            categoryId: id
        })
        console.log("Products are deleted",deletedProducts);
    }
  }
});

export const Category =
  mongoose.models.Category || model("Category", categorySchema);
