import slugify from "slugify";
import { ErrorClass } from "../../utils/error-class.utils.js";
import { cloudinaryConfig, uploadFile } from "../../utils/cloudinary.utils.js";
import { nanoid } from "nanoid";
import { Category } from "../../../DB/models/category.model.js";
import { SubCategory } from "../../../DB/models/sub-category.model.js";
import { Brand } from "../../../DB/models/brand.model.js";
import { ApiFeatures } from "../../utils/api-features-utils.js";

/**
 * @api {post} /categories Create Category
 */
export const createCategory = async (req, res, next) => {
    // destructure the request body

    const { name } = req.body;

    // generate slug from name
    const slug = slugify(name, {
        replacement: "_",
        lower: true
    });

    // Image
    if (!req.file) {
        return next(new ErrorClass("Image is required", 400, "Please upload an image"));
    }

    const customId = nanoid(4);
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
        req.file.path,
        {
            folder: `${process.env.UPLOADS_FOLDER}/Categories/${customId}`
        }
    )

    // create category object
    const category = {
        name,
        slug,
        Image: {
            secure_url,
            public_id
        },
        customId,

    }

    // create category in database
    const newCategory = await Category.create(category);

    // send response
    res.status(201).json({
        status: "success",
        message: "Category created successfully",
        data: newCategory,
    });

}


/** * @api {get} /categories Get Category
 */
export const getCategory = async (req, res, next) => {
    
 const {id,name,slug} = req.query;

 const queryFilter = {};

 if (id) queryFilter._id = id;
 if (name) queryFilter.name = name //{ $regex: name, $options: "i" };
 if (slug) queryFilter.slug = slug //{ $regex: slug, $options: "i" };

    const category = await Category.findOne(queryFilter)
    
    if (!category) {
        return next(new ErrorClass("Category not found", 404, "Category not found"));
    }

    res.status(200).json({
        status: "success",
        message: "Category retrieved successfully", 
        data: category,
    });
}


/** * @api {PUT} /categories/update/:_id update Category
 */
export const updateCategory = async (req, res, next) => {
    const { id } = req.params;

    // find category by id
    const category = await Category.findById(id);

    if (!category) {
        return next(new ErrorClass("Category not found", 404, "Category not found"));
    }

    // destructure the request body
    const { name } = req.body;
    if (name) {
        // generate slug from name
        const slug = slugify(name, {
            replacement: "_",
            lower: true
        });
        category.name = name;
        category.slug = slug;
    }

    // check if image is provided
    // if (req.file) {
    //     // delete old image from cloudinary
    //     await cloudinaryConfig().uploader.destroy(category.Image.public_id);
    //     // upload new image to cloudinary
    //     const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    //         req.file.path,
    //         {
    //             folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`
    //         }
    //     );
    //     // update image in category
    //     category.Image.secure_url = secure_url;
    //     category.Image.public_id = public_id;
    // }

    if (req.file) {
    const splitedPublicId = category.Image.public_id.split(
      `${category.customId}/`
    )[1];


    const { secure_url} = await uploadFile({
      file: req.file.path,
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`,
      publicId: splitedPublicId,
    });
    // const { secure_url } = await cloudinaryConfig().uploader.upload(
    //   req.file.path,
    //   {
    //     folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`,
    //     public_id: splitedPublicId,
    //   }
    // );
    category.Image.secure_url = secure_url;
  }
    // save category
    const updatedCategory = await category.save();
    // send response
    res.status(200).json({
        status: "success",
        message: "Category updated successfully",
        data: updatedCategory,
    });
}

/** * @api {delete} /categories/delete/:_id delete Category
 */
export const deleteCategory = async (req, res, next) => {
    const { id } = req.params;

    // find category by id
    const category = await Category.findById(id);

    if (!category) {
        return next(new ErrorClass("Category not found", 404, "Category not found"));
    }

    // delete image from cloudinary
    // await cloudinaryConfig().uploader.destroy(category.Image.public_id);
    await cloudinaryConfig().api.delete_resources_by_prefix(
        `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`
    );
    await cloudinaryConfig().api.delete_folder(
        `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`
    );

    // delete category from database
    await Category.findByIdAndDelete(id);

    // // delete all sub-categories and brands associated with this category
    // const relatedSubCategories = await SubCategory.deleteMany({ categoryId: id });
    // if (relatedSubCategories.deletedCount) {
    //     await Brand.deleteMany({ categoryId: id });

    //     // delete releated products
    // }
        
    // send response
    res.status(200).json({
        status: "success",
        message: "Category deleted successfully",
    });
}

/** 
 * @api {list} /categories/list list Categories
 */
export const listCategories = async (req, res, next) => {
    const mongooseQuery = Category.find();
    const apiFeatures = new ApiFeatures(mongooseQuery, req.query);

    apiFeatures.filter().pagination().sort()
    const categories = await apiFeatures.mongooseQuery
    
    // send response
    res.status(200).json({
        status: "success",
        message: "Categories listed successfully",
        data: categories,
    });
}
