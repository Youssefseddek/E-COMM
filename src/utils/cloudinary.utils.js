import { v2 as cloudinary } from "cloudinary";

export const cloudinaryConfig = () => {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
  });

  return cloudinary;
};

/**
 * @param {File} file
 * @param {String} folder
 * @returns {Object}
 * @description Uploads a file to cloudinary
 */

export const uploadFile = async ({ file, folder = "General", publicId }) => {
//  return async (req, res, next) => {
    if (!file) {
      return next(
        new ErrorClass("Please upload an image", 400, "Please upload an image")
      );
    }

    let options = { folder };
    if (publicId) {
      options.public_id = publicId;
    }

    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
      file,
      options
    );

    return { secure_url, public_id };
  // };
};
