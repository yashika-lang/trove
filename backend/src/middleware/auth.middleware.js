import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../exceptions/ApiError.js";
import asyncHandler from "../exceptions/asyncHandler.js";
import env from "../config/env.js";

const verifyJWT = asyncHandler(async (req, res, next) => {

    const authHeader = req.header("Authorization");

    const token =
        req.cookies?.accessToken ||
        (
            authHeader?.startsWith("Bearer ")
                ? authHeader.substring(7)
                : null
        );

    if (!token) {
        throw new ApiError(
            401,
            "Unauthorized request."
        );
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(
            token,
            env.JWT_ACCESS_SECRET
        );
    } catch (error) {
        throw new ApiError(
            401,
            "Invalid or expired access token."
        );
    }

    const user = await User.findById(decodedToken._id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(
            401,
            "Invalid Access Token."
        );
    }

    req.user = user;

    next();

});

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                "You are not authorized to access this resource."
            );
        }

        next();
    };
};

export {
    verifyJWT,
    authorizeRoles,
};