import { Address, User } from "../../../DB/models/index.js";
import { ErrorClass } from "../../utils/index.js";
import { compareSync } from "bcryptjs";
import jwt from "jsonwebtoken";


export const resgisterUser = async (req, res, next) => {
  const { userName, email, password, userType, age, gender, phone,country,city,postalCode,buildingNumber,floorNumber,addressLabel } = req.body;

  // email check
  const user = await User.findOne({ email });
  if (user) {
    return next(
      new ErrorClass("User already exists", 400, "User already exists")
    );
  }

  // hash password
  // const hashedPassword =  hashSync(password, +process.env.SALT_ROUND);
  // send email varification link
  // create user
  const userObject = new User ({
    userName,
    email,
    password,
    userType,
    age,
    gender,
    phone,
  });

  // create new address instance
  const address = new Address({
    userId: userObject._id,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    isDefault: true
    });

  const newUser = await userObject.save();
  // const newUser = await User.create(userObject);
  const savedAddress = await address.save();



  // send response
  res.status(201).json({
    status: "success",
    massage: "User created successfully",
    data: newUser,
    savedAddress
  });
};

export const updateAcount = async (req, res, next) => {
  const { id } = req.params;
  const { userName } = req.body;

  // const user = await User.findById(id);
  // if(!user){
  //     return next(new ErrorClass("User not found", 404, "User not found"));
  // }

  // const user = new User({_id:id})
  const updatedUser = await User.findOneAndUpdate(
    { _id: id },
    { userName },
    { new: true }
  ).select("-password");

  // if(password){
  //     user.password = password;
  // }
  // console.log({user});

  // const updatedUser = await user.save();

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: updatedUser,
  });
};

export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;

  const decoded = jwt.verify(token, process.env.tokenEmailSignature);
  if (!decoded?.id) {
    // return next(new Error("In-valid token payload", { cause: 400 }));
    return next(
      new ErrorClass("In-valid token payload", 400, "In-valid token payload")
    );
  } else {
    const user = await User.updateOne(
      { _id: decoded.id, isEmailVerified: false },
      { isEmailVerified: true },
      { new: true }
    );

    return user.modifiedCount
      ? // res.status(200).redirect({ message: 'Done email confirmed', user }) :
        res.status(200).json({ message: "Done email confirmed", user })
      // : next(new Error("Already confirmed", { cause: 400 }));
      : next(new ErrorClass("Already confirmed", 400, "Already confirmed"));
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // return next(new Error("Email Not Exist", { cause: 404 }));
    return next(
      new ErrorClass("Email Not Exist", 404, "Email Not Exist")
    );
  } else {
    //Compare Password
    const match = compareSync(password, user.password);
    if (!match) {
      // return next(new Error("In-valid Password", { cause: 404 }));
      return next(
        new ErrorClass("In-valid Password", 404, "In-valid Password")
      );
    } else {
      // if (!user.isEmailVerified) {
      //   // return next(new Error("Confirm your email first", { cause: 400 }));
      //   return next(
      //     new ErrorClass(
      //       "Confirm your email first",
      //       400,
      //       "Confirm your email first"
      //     )
      //   );
      // } else {
        // if (user.blocked) {
        //   return next(new Error("Blocked User", { cause: 400 }));
        // } else {
          const token = jwt.sign(
            { id: user._id, isLoggedIn: true },
            process.env.tokenSignature,
            { expiresIn: 60 * 60 * 24 }
          );

          return res.status(200).json({ message: "Done", token, user });
        // }
      // }
    }
  }
};
