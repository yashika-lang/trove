import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

const userSchema = new mongoose.Schema(
  {

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["Admin", "Sales", "Accountant"],
      required: true,
    },
     country: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId, // 
      ref: "Company",
      required: true,
    },
    refreshToken: { // refresh token is stored in the database for eah user that is why only one refresh token is valid for a user at a time. If a new refresh token is generated, the old one becomes invalid. This helps in maintaining security and control over user sessions.
  type: String,
},
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {

  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);

});


userSchema.methods.isPasswordCorrect = async function (password) { // this method is used to compare a provided password with the hashed password stored in the database. It returns true if the passwords match and false otherwise. This is typically used during the login process to verify that the user has entered the correct password.
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () { // this method generates a JSON Web Token (JWT) for the user, which can be used for authentication and authorization purposes. The token contains the user's ID, email, and role, and is signed with a secret key. The token has an expiration time defined in the environment variables, after which it will no longer be valid.
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () { // this method generates a refresh token for the user, which can be used to obtain a new access token when the current one expires. The refresh token contains only the user's ID and is signed with a different secret key. It also has an expiration time defined in the environment variables. Refresh tokens are typically stored securely on the client side and sent to the server when requesting a new access token.
  return jwt.sign(
    {
      _id: this._id,//this is the payload of the token, which contains the user's unique identifier (_id) from the database. This allows the server to identify the user when the refresh token is used to request a new access token.
    }, 
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRY, 
    }
  );
};
const User = mongoose.model("User", userSchema); // creates a model named "User" based on the userSchema, allowing interaction with the "users" collection in the MongoDB database

export default User;