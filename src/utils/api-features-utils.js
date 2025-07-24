// export class ApiFeatures {

//     constructor(query, queryStr) {
//         this.query = query;
//         this.queryStr = queryStr;
//     }

//     search() {
//         const keyword = this.queryStr.keyword
//             ? {
//                 title: {
//                     $regex: this.queryStr.keyword,
//                     $options: "i",
//                 },
//             }
//             : {};

//         this.query = this.query.find({ ...keyword });
//         return this;
//     }

//     filter() {
//         const queryCopy = { ...this.queryStr };

//         //   Removing some fields for category
//         const removeFields = ["keyword", "page", "limit"];

//         removeFields.forEach((key) => delete queryCopy[key]);

//         // Filter For Price and Rating

//         let queryStr = JSON.stringify(queryCopy);
//         queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

//         this.query = this.query.find(JSON.parse(queryStr));
//         return this;
//     }

//     pagination(resultPerPage) {
//         const currentPage = Number(this.queryStr.page) || 1;

//         const skip = resultPerPage * (currentPage - 1);

//         this.query = this.query.limit(resultPerPage).skip(skip);
//         return this;
//     }

// }
// export class ApiFeatures {
//   constructor(mongooseQuery, query) {
//     this.query = query;
//     this.mongooseQuery = mongooseQuery;
//   }

//   // sort
//   sort() {
//     console.log(this.query.sort);
//     // const sort = {price: 1};
//     if (this.query.sort){
//     this.mongooseQuery.sort(this.query.sort);
//     return this;
//     }

//   }

//   // filter
//   filter() {
//     const { page, limit ,sort,...filters } = this.query;
//     const skip = (page - 1) * limit;

//     const filtersAsString = JSON.stringify(filters);
//     const replacedFilters = filtersAsString.replaceAll(
//       /lt|lte|gt|gte|regex|ne|eq/g,
//       (ele) => `$${ele}`
//     );
//     const parcedFilters = JSON.parse(replacedFilters);
//     console.log(parcedFilters);


//     this.mongooseQuery.find(parcedFilters);

//     return this;
//   }

//   //paination
//   pagination() {
//     const { page, limit } = this.query;
//     const skip = (page - 1) * limit;
//     this.mongooseQuery.skip(skip).limit(limit);
//     return this;
//   }
// }
export class ApiFeatures {
  constructor(mongooseQuery, query) {
    this.query = query;
    this.mongooseQuery = mongooseQuery;
  }

  // sort
  sort() {
    console.log(this.query.sort);
    // const sort = {price: 1};
    if (this.query.sort){
    this.mongooseQuery.sort(this.query.sort);
    return this;
    }

  }

  // filter
  filter() {
    const { page, limit ,sort,...filters } = this.query;
    const skip = (page - 1) * limit;

    const filtersAsString = JSON.stringify(filters);
    const replacedFilters = filtersAsString.replaceAll(
      /lt|lte|gt|gte|regex|ne|eq/g,
      (ele) => `$${ele}`
    );
    const parcedFilters = JSON.parse(replacedFilters);
    console.log(parcedFilters);


    this.mongooseQuery.find(parcedFilters).populate([
      { path: "reviews", match: { reviewStatus: "accepted" } }
    ]);

    return this;
  }

  //paination
  pagination() {
    const { page, limit } = this.query;
    const skip = (page - 1) * limit;
    this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }
}
