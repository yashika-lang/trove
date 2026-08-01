import User from "../models/user.model.js";
import Company from "../models/company.model.js";

import ApiResponse from "../exceptions/ApiResponse.js";
import ApiError from "../exceptions/ApiError.js";
import asyncHandler from "../exceptions/asyncHandler.js";
import env from "../config/env.js";

const loginUser = asyncHandler(async (req, res) => {

const { email, password } = req.body;

    // Check if email and password are provided
    if (!email?.trim() || !password?.trim()) {
        throw new ApiError(
            400,
            "Email and Password are required."
        );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
    throw new ApiError(
        400,
        "Please enter a valid email address."
    );
}
// Find user by email
const user = await User.findOne({
    email,
}).select("+password");

if (!user) {
    throw new ApiError(
        401,
        "Invalid email or password."
    );
} 
// password validation
const isPasswordValid = await user.isPasswordCorrect(password); // the isPasswordCorrect method is called on the user instance to compare the provided password with the hashed password stored in the database. It returns true if the passwords match and false otherwise.

if (!isPasswordValid) {
    throw new ApiError(
        401,
        "Invalid email or password."
    );
}
 
// Generate Access Token and Refresh Token
const accessToken = user.generateAccessToken();  //User, apna Access Token bana do
const refreshToken = user.generateRefreshToken(); //User, apna Refresh Token bana do

user.refreshToken = refreshToken;

await user.save({ // user.save() is used for saving the updated user document to the database
  validateBeforeSave: false,
});
const options = { // options for setting cookies in the response
  httpOnly: true,
  secure: env.NODE_ENV === "production",
};

const loggedInUser = await User.findById(user._id).select( // this query retrieves the user document from the database by its unique identifier (_id) a
 "-password -refreshToken" //and excludes the password and refreshToken fields from the result. This is done to ensure that sensitive information like the password and refresh token are not exposed in the response sent back to the client.
);
if (!loggedInUser) {
  throw new ApiError(
    500,
    "Something went wrong while fetching user details."
  );
}

return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "User logged in successfully."
    )
  );
});
const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully."
        )
    );

});


const registerUser = asyncHandler(async (req, res) => {

    const {
        email,
        phone,
        password,
        role,
        country,
        state,
        companyName,
    } = req.body;

    // Check if all required fields are provided
    if (
        !email ||
        !phone ||
        !password ||
        !role ||
        !country ||
        !state ||
        !companyName
    ) {
        throw new ApiError(
            400,
            "All fields are required."
        );
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        throw new ApiError(
            400,
            "Please enter a valid email address."
        );
    }

    // Password Validation
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
        throw new ApiError(
            400,
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
        );
    }

    // Phone Validation
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
        throw new ApiError(
            400,
            "Please enter a valid 10-digit phone number."
        );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        email,
    });

    if (existingUser) {
        throw new ApiError(
            409,
            "User already exists with this email."
        );
    }

    // Find existing company
    let company = await Company.findOne({
        companyName,
    });

    // Create company if it doesn't exist
    if (!company) {
        company = await Company.create({
            companyName,
        });
    }

    // Create user
    const user = await User.create({
        email,
        phone,
        password,
        role,
        country,
        state,
        company: company._id,
    });

    // Remove password from response
    const createdUser = await User.findById(user._id)
        .select("-password");

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user."
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully."
        )
    );

});

export {
    registerUser,
    loginUser,
    getCurrentUser,
};