import User from "../models/user.model.js";
import Company from "../models/company.model.js";

import ApiResponse from "../exceptions/ApiResponse.js";
import ApiError from "../exceptions/ApiError.js";
import asyncHandler from "../exceptions/asyncHandler.js";
import env from "../config/env.js";
import jwt from "jsonwebtoken";

//--------------- login user-------------

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
 "-password -refreshToken" //and excludes the password and refreshToken fields from the result. 
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

// ------// logout user-----------// 
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
    req.user._id,
    {
        $unset: { // remove teh field from teh docc
            refreshToken: 1, //Is field ko remove karo
        },
    },
    {
        new: true,
    }
);

// cookie options for logout
const options = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
};
return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully."
        )
    );
}); 
//--------------- refrresh token---------------

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.body?.refreshToken;


if (!incomingRefreshToken) {
    throw new ApiError(
        401,
        "Refresh token is required."
    );
}
let decodedToken;

try {

    decodedToken = jwt.verify(
        incomingRefreshToken,
        env.JWT_REFRESH_SECRET
    );

} catch (error) {
    console.log(error.name);
    console.log(error.message);

    throw new ApiError(
        401,
        "Invalid or expired refresh token."
    );
}
const user = await User.findById(decodedToken._id).select(
    "+refreshToken"
);

if (!user) {
    throw new ApiError(
        401,
        "Invalid refresh token."
    );
}
if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(
        401,
        "Refresh token is expired or has been used."
    );
}
const accessToken = user.generateAccessToken(); 
const refreshToken = user.generateRefreshToken();
user.refreshToken = refreshToken;

await user.save({
    validateBeforeSave: false,
});
const options = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
};
return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                accessToken,
                refreshToken,
            },
            "Access token refreshed successfully."
        )
    );

}); 


const changeCurrentPassword = asyncHandler(async (req, res) => {
const {
    oldPassword,
    newPassword,
} = req.body;
if (!oldPassword || !newPassword) {
    throw new ApiError(
        400,
        "Old password and new password are required."
    );
}
const user = await User.findById(req.user._id).select(
    "+password"
);

const isPasswordValid = await user.isPasswordCorrect(
    oldPassword
);

if (!isPasswordValid) {
    throw new ApiError(
        400,
        "Old password is incorrect."
    );
}
user.password = newPassword;

await user.save();
return res.status(200).json(
    new ApiResponse(
        200,
        {},
        "Password changed successfully."
    )
);

});
// --------- update account details---------
const updateAccountDetails = asyncHandler(async (req, res) => {
const {
    email,
    phone,
    country,
    state,
} = req.body;
if (
    !email ||
    !phone ||
    !country ||
    !state
) {
    throw new ApiError(
        400,
        "All fields are required."
    );
}
const user = await User.findByIdAndUpdate(
    req.user._id,
    {
        email,
        phone,
        country,
        state,
    },
    {
        new: true,
        runValidators: true,
    }
).select("-password -refreshToken");
if (!user) {
    throw new ApiError(
        404,
        "User not found."
    );
}
return res.status(200).json(
    new ApiResponse(
        200,
        user,
        "Account details updated successfully."
    )
);
});


// --------- register user---------

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
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
};