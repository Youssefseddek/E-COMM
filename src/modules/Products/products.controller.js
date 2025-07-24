import slugify from "slugify";
import { nanoid } from "nanoid";
import { Product } from "../../../DB/models/index.js";
import {
  ErrorClass,
  uploadFile,
  calculateProductPrice,
  cloudinaryConfig,
} from "../../utils/index.js";
import { ApiFeatures } from "../../utils/api-features-utils.js";

// add a new product
export const addProduct = async (req, res, next) => {
  // destructing the required fields from the request body
  const { title, overview, specs, price, discountAmount, discountType, stock } =
    req.body;

  // req.files
  if (!req.files.length) {
    return next(new ErrorClass("Product images are required", 400));
  }

  // Ids checking
  const brandDocument = req.document;

  // specs
  console.log({ specs });

  // price and discount

  // if (discountAmount && discountType) {
  //     if (discountType === "Percentage") {
  //         appliedPrice -= (appliedPrice * discountAmount) / 100;
  //     } else if (discountType === "Fixed") {
  //         appliedPrice -= discountAmount;
  //     }
  // }

  // images
  const brandCustomId = brandDocument.customId;
  const subCategoryCustomId = brandDocument.subCategoryId.customId;
  const categoryCustomId = brandDocument.categoryId.customId;

  const customId = nanoid(4);
  const Urls = [];
  for (const file of req.files) {
    const { secure_url, public_id } = await uploadFile({
      file: file.path,
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${categoryCustomId}/subCategories/${subCategoryCustomId}/brands/${brandCustomId}/products/${customId}`,
    });
    Urls.push({ secure_url, public_id });
  }

  // create product object
  const product = {
    title,
    overview,
    specs: specs ? JSON.parse(specs) : {},
    price,
    appliedDiscount: {
      amount: discountAmount,
      type: discountType,
    },
    stock,
    Images: {
      URLS: Urls,
      customId,
    },
    categoryId: brandDocument.categoryId._id,
    subCategoryId: brandDocument.subCategoryId._id,
    brandId: brandDocument._id,
  };

  // create product in database
  const newProduct = await Product.create(product);
  // send response
  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: newProduct,
  });
};

/**
 * @api {put} /products/update/:id Update Product
 */
export const updateProduct = async (req, res, next) => {
  // id form params
  const { id } = req.params;
  // destructing the required fields from the request body
  const {
    title,
    overview,
    specs,
    price,
    discountAmount,
    discountType,
    stock,
    bage,
  } = req.body;

  // find the product
  const product = await Product.findById(id)
    .populate("categoryId")
    .populate("subCategoryId")
    .populate("brandId");

  if (!product) {
    return next(new ErrorClass("Product not found", 404));
  }

  // title
  if (title) {
    product.title = title;
    product.slug = slugify(title, {
      replacement: "_",
      lower: true,
    });
  }

  // overview
  if (overview) product.overview = overview;
  // stock
  if (stock) product.stock = stock;
  //bage
  if (bage) product.bage = bage;

  // price and discount
  if (price || discountAmount || discountType) {
    const newPrice = price || product.price;
    const discount = {};
    discount.amount = discountAmount || product.appliedDiscount.amount;
    discount.type = discountType || product.appliedDiscount.type;

    product.appliedPrice = calculateProductPrice(newPrice, discount);

    // if(discount.type === DiscountType.PERCENTAGE){
    //     product.appliedPrice = newPrice - (newPrice * discount.amount) / 100;
    // }else if(discount.type === DiscountType.FIXED){
    //     product.appliedPrice = newPrice - discount.amount;
    // }else{
    //     product.appliedPrice = newPrice;
    // }

    product.price = newPrice;
    product.appliedDiscount = discount;
  }

  // images
  console.log(req.files);

  if (req.files.length) {
    const brandCustomId = product.brandId.customId;
    const subCategoryCustomId = product.subCategoryId.customId;
    const categoryCustomId = product.categoryId.customId;
    const customId = product.Images.customId;
    const Urls = [];
    // await cloudinaryConfig().api.delete_resources_by_prefix(
    //     `${process.env.UPLOADS_FOLDER}/Categories/${categoryCustomId}/subCategories/${subCategoryCustomId}/brands/${brandCustomId}/products/${customId}`
    // );
    for (const file of req.files) {
      const { secure_url, public_id } = await uploadFile({
        file: file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Categories/${categoryCustomId}/subCategories/${subCategoryCustomId}/brands/${brandCustomId}/products/${customId}`,
      });
      Urls.push({ secure_url, public_id });
      const publicIds = product.Images.URLS.map((img) => img.public_id);
      await cloudinaryConfig().api.delete_resources(publicIds);
    }
    product.Images.URLS = Urls;
  }

  // specs
  if (specs) product.specs = specs;
  // specs = {size: {S, M, L, XL}, color: {red, blue, green, yellow},height: {100, 150, 200, 250},weight: {100, 150, 200, 250}}

  // save the product
  const updatedProduct = await product.save();

  // send response
  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: updatedProduct,
  });
};

/**
 * @api {get} /products/list List All Products
 */
// export const listProducts = async (req, res, next) => {
//   // destructing the required fields from the request body
//   const { page = 1, limit = 5, ...filters } = req.query;
//   // calculate skip
//   const skip = (page - 1) * limit;
//   // find the products
//   // const products = await Product.find().skip(skip).limit(limit).select('title');

//   const filtersAsString = JSON.stringify(filters);
//   const replacedFilters = filtersAsString.replaceAll(
//     /lt|lte|gt|gte|regex|ne|eq/g,
//     (ele) => `$${ele}`
//   );
//   const parcedFilters = JSON.parse(replacedFilters);

//   console.log(filters, filtersAsString, replacedFilters, parcedFilters);

//   /**
//    * @way 2 using paginate method from mongoose-paginate-v2 as schema plugin
//    */
//   const products = await Product.paginate(
//     // queryFilter,
//     parcedFilters,
//     {
//       page,
//       skip,
//       limit,
//       select: "title price",
//     }
//   );

//   // send response
//   res.status(200).json({
//     status: "success",
//     message: "Products listed successfully",
//     N_pro: products.length,
//     data: products,
//   });
// };

export const listProducts = async (req, res, next) => {
  
  const mongooseQuery = Product.find();
  const apiFeatures = new ApiFeatures(mongooseQuery, req.query);

  apiFeatures.filter().pagination().sort()
  const products = await apiFeatures.mongooseQuery;

  // send response
  res.status(200).json({
    status: "success",
    message: "Products listed successfully",
    data: products,
  });
};


/**
 * @api {GET} /products/:id get product by id
 */
export const getProductById = async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate([
      { path: "reviews", match: { reviewStatus: "accepted" } }
    ]);


  res.status(200).json({
    status: "success",
    message: "Product fetched successfully",
    data: product,
  });

}
