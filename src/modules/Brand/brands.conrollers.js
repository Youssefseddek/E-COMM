import slugify from "slugify";
import { Brand, SubCategory } from "../../../DB/models/index.js";
import { cloudinaryConfig, uploadFile } from "../../utils/cloudinary.utils.js";
import { nanoid } from "nanoid";


/** 
  @api {post} /brand/create Create Brand
*/
export const createBrand = async (req, res, next) => {

    const { categoryId, subCategoryId } = req.query;

    const isSubCategoryExists = await SubCategory.findOne({ _id: subCategoryId, categoryId }).populate("categoryId");
    if (!isSubCategoryExists) {
        return next(new Error("Sub-Category not found", 404, "Please provide a valid sub-category ID"));
    }

    const { name } = req.body;
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
        folder: `${process.env.UPLOADS_FOLDER}/Categories/${isSubCategoryExists.categoryId.customId}/subCategories/${isSubCategoryExists.customId}/brands/${customId}`
    });

    const brand = {
        name,
        slug,
        logo: {
            secure_url,
            public_id
        },
        customId,
        categoryId: isSubCategoryExists.categoryId._id,
        subCategoryId: isSubCategoryExists._id
    };

    const newBrand = await Brand.create(brand);
    // send response
    res.status(201).json({
        status: "success",
        message: "Brand created successfully",
        data: newBrand,
    });
}

/** 
  @api {get} /brand/ Get Brand
*/
export const getBrand = async (req, res, next) => {
    const { id, name, slug } = req.query;

    let queryFilter = {};

    if (id) queryFilter._id = id;
    if (name) queryFilter.name = name;
    if (slug) queryFilter.slug = slug;

    const brand = await Brand.findOne(queryFilter)

    if (!brand) {
        return next(new Error("Brand not found", 404, "Please provide a valid brand ID, name or slug"));
    }

    res.status(200).json({
        status: "success",
        message: "Brand fetched successfully",
        data: brand,
    });

}

/** 
  @api {PUT} /brand/update Update Brand
*/
export const updateBrand = async (req, res, next) => {
    const { id } = req.params;

    const brand = await Brand.findById(id)
        .populate("categoryId subCategoryId");
    if (!brand) {
        return next(new Error("Brand not found", 404, "Please provide a valid brand ID"));
    }
    console.log(brand);

    // Update brand details
    const { name } = req.body;
    if (name) {
        brand.name = name;
        brand.slug = slugify(name, {
            replacement: "_",
            lower: true,
        });
    }

    // Update logo if provided
    if (req.file) {
        const splitedPublicId = brand.logo.public_id.split(`${brand.customId}/`)[1];
        const { secure_url } = await uploadFile({
            file: req.file.path,
            folder: `${process.env.UPLOADS_FOLDER}/Categories/${brand.categoryId.customId}/subCategories/${brand.subCategoryId.customId}/brands/${brand.customId}`,
            publicId: splitedPublicId
        });
        brand.logo.secure_url = secure_url;
    }

    // Save updated brand
    await brand.save();
    // send response
    res.status(200).json({
        status: "success",
        message: "Brand updated successfully",
        data: brand,
    });

}

/** 
  @api {delete} /brand/delete/:id Delete Brand
*/
export const deleteBrand = async (req, res, next) => {
    const { id } = req.params;

    const brand = await Brand.findByIdAndDelete(id)
        .populate("categoryId subCategoryId");
    if (!brand) {
        return next(new Error("Brand not found", 404, "Please provide a valid brand ID"));
    }

    const brandPath = `${process.env.UPLOADS_FOLDER}/Categories/${brand.categoryId.customId}/subCategories/${brand.subCategoryId.customId}/brands/${brand.customId}`
    await cloudinaryConfig().api.delete_resources_by_prefix(brandPath)
    await cloudinaryConfig().api.delete_folder(brandPath);

    /**
* @todo  delete the related products from db
*/
    res.status(200).json({
        status: "success",
        message: "Brand deleted successfully",
        data: brand,
    });
}



