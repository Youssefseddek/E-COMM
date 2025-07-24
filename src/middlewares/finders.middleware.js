import { ErrorClass } from "../utils/error-class.utils.js";

export const getDocumentByName = (model) => {
  return async (req, res, next) => {
    console.log(req.body);

    const { name } = req.body;
    if (name) {
      const document = await model.findOne({ name });
      if (document) {
        return next(
          new ErrorClass(
            `this name already exists`,
            400,
            `this name already exists`
          )
        );
      }
    }
    next();
  };
};

export const checkIfIdsExist = (model) => {
  return async (req, res, next) => {
    // destructuring Ids from  request query
    const { category, subCategory, brand } = req.query;
    const document = await model.findOne({
      _id: brand,
      categoryId: category,
      subCategoryId: subCategory,
    }).populate([
      { path: "categoryId", select: "customId" },
      { path: "subCategoryId", select: "customId" },
    ]);

    if (!document) {
      return next(
        new ErrorClass(
          "Brand not found",
          404,
          "Please provide a valid brand ID"
        )
      );
    }

    req.document = document;
    next();
  };
};
