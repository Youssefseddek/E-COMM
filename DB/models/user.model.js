import { hashSync } from "bcryptjs";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userShema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ["Buyer", "Admin"],
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    phone: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMarkedAsDeleted: {
      type: Boolean,
      default: false,
    },
    role:{
      type:String,
      enum:["User","Admin","HR"],
      default:"User"
    }
  },
  { timestamps: true }
);

userShema.pre("save", function (next) {
  console.log("======================== Pre Hook  =======================");
  console.log(this);

  if (this.isModified("password")) {
    this.password = hashSync(this.password, +process.env.SALT_ROUND);
  }
  console.log(this);
  next();
});

// userShema.post("save", function (doc, next) {
//   console.log("======================== Post Hook  =======================");
//   console.log(doc);
//   next();
// });

// // ======================= update ==============
// userShema.pre(
//   "updateOne",
//   { document: true, query: false },
//   function (next) {
//     console.log("======================== pre updateOne Hook  =======================");
//     console.log(this);
    
//     next();
//   }
// );

// userShema.post("updateOne", { document: true, query: false }, function (doc, next) {
//     console.log("======================== post updateOne Hook  =======================");
//     console.log(doc);
//     next();
    
// }) 


// ================================= query middleware =============
// userShema.pre(
//  ["updateOne","findOneAndUpdate"],
//   function (next) {
//     console.log("======================== pre updateOne Hook  =======================");
//     // console.log(this);
//     console.log(this.getQuery());
//     console.log(this.getFilter());
//     console.log(this.getOptions());
//     console.log(this.getUpdate());
//     console.log(this.projection());
    
    
//     next();
//   }
// );

export const User = mongoose.models.User || model("User", userShema);
