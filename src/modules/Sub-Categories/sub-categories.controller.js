import slugify from "slugify";
import { Category } from "../../../DB/models/category.model.js";
import { nanoid } from "nanoid";
import { cloudinaryConfig, uploadFile } from "../../utils/cloudinary.utils.js";
import { SubCategory } from "../../../DB/models/sub-category.model.js";
import { Brand } from "../../../DB/models/brand.model.js";


/** 
  @api {post} /sub-categories/create Create Sub-Category
*/
export const createSubCategory = async (req, res, next) => {
    
    const { categoryId } = req.query;
    const category = await Category.findById(categoryId);
    if (!category) {
        return next(new Error("Category not found", 404, "Please provide a valid category ID"));
    }
    // destructure the request body
    const { name } = req.body;
    console.log({name});
    
    const slug = slugify(name, {
        replacement: "_",
        lower: true,
    });

    // Image
    if (!req.file) {
        return next(new Error("Image is required", 400, "Please upload an image"));
    }
    
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}/subCategories/${customId}`
    })
    console.log({ secure_url, public_id });

    // create sub-category object
    const subCategory = {
        name,
        slug,
        image: {
            secure_url,
            public_id
        },
        customId,
        categoryId: category._id
    }
    // create sub-category in database
    const newSubCategory = await SubCategory.create(subCategory);
    // send response
    res.status(201).json({
        status: "success",
        message: "Sub-Category created successfully",
        data: newSubCategory,
    });
}


/** 
  @api {get} /sub-categories get Sub-Category by id or name or slug
*/
export const getSubCategory = async (req, res, next) => {
    const { id, name, slug } = req.query;
    

    const queryFilter = {};
    if (id) queryFilter._id = id;
    if (name) queryFilter.name = name;
    if (slug) queryFilter.slug = slug;
    console.log( queryFilter );
    

    const subCategory = await SubCategory.findOne(queryFilter);
    if (!subCategory) {
        return next(new Error("Sub-Category not found", 404, "Please provide a valid Sub-Category ID, name or slug"));
    }

    res.status(200).json({
        status: "success",
        data: subCategory,
    });
}


/** 
  @api {put} /sub-categories/update/:id update Sub-Category by id
*/
export const updateSubCategory = async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    // Find the sub-category by id
    const subCategory = await SubCategory.findById(id).populate("categoryId") ;
    if (!subCategory) {
        return next(new Error("Sub-Category not found", 404, "Please provide a valid Sub-Category ID"));
    }
    // Update the sub-category name
    if (name) {
        subCategory.name = name;
        subCategory.slug = slugify(name, {
            replacement: "_",
            lower: true,
        });
    }

    if (req.file) {
        const splitedPublicId = subCategory.image.public_id.split(
            `${subCategory.customId}/`
        )[1];
        // Upload the new image
        const { secure_url } = await uploadFile({
            file: req.file.path,
            folder: `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.categoryId.customId}/subCategories/${subCategory.customId}`,
            publicId: splitedPublicId,
        });
        subCategory.image.secure_url = secure_url;

    }

    // Save the updated sub-category
    await subCategory.save();
    res.status(200).json({
        status: "success",
        message: "Sub-Category updated successfully",
        data: subCategory,
    });
}

/** 
  @api {delete} /sub-categories/delete/:id delete Sub-Category by id
*/
export const deleteSubCategory = async (req, res, next) => {
    const { id } = req.params;

    const subCategory = await SubCategory.findByIdAndDelete(id).populate("categoryId");
    if (!subCategory) {
        return next(new Error("Sub-Category not found", 404, "Please provide a valid Sub-Category ID"));
    }

    // delete image from cloudinary
    const subCategoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.categoryId.customId}/subCategories/${subCategory.customId}`;
    await cloudinaryConfig().api.delete_resources_by_prefix(subCategoryPath);
    await cloudinaryConfig().api.delete_folder(subCategoryPath);

    // delete all brands associated with this sub-category
    await Brand.deleteMany({ subCategoryId: subCategory._id });

    res.status(200).json({
        status: "success",
        message: "Sub-Category deleted successfully",
    });
}
