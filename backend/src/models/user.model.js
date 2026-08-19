import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // PROFILE INFORMATION
    // ==========================================

    fullName: {
      type: String,
      trim: true,
      default: null,
    },

    department: {
      type: String,
      trim: true,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },


    // ==========================================
    // AUTHENTICATION
    // ==========================================

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
      enum: [
        "Admin",
        "Sales",
        "Accountant",
      ],
      required: true,
    },


    // ==========================================
    // LOCATION
    // ==========================================

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


    // ==========================================
    // COMPANY
    // ==========================================

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },


    // ==========================================
    // USER PREFERENCES
    // ==========================================
    // These are user-level preferences.
    // They should not affect other users
    // belonging to the same company.
    // ==========================================

    preferences: {

      theme: {
        type: String,
        enum: [
          "light",
          "dark",
          "system",
        ],
        default: "light",
      },

      language: {
        type: String,
        default: "en",
        trim: true,
      },

      currency: {
        type: String,
        default: "INR",
        uppercase: true,
        trim: true,
      },

      dateFormat: {
        type: String,
        enum: [
          "DD/MM/YYYY",
          "MM/DD/YYYY",
          "YYYY-MM-DD",
        ],
        default: "DD/MM/YYYY",
      },

      numberFormat: {
        type: String,
        enum: [
          "1,000.00",
          "1.000,00",
          "1 000.00",
        ],
        default: "1,000.00",
      },

      timeFormat: {
        type: String,
        enum: [
          "12",
          "24",
        ],
        default: "24",
      },

    },


    // ==========================================
    // REFRESH TOKEN
    // ==========================================

    refreshToken: {
      type: String,
      select: false,
    },

  },

  {
    timestamps: true,
  }
);


// ==========================================
// HASH PASSWORD
// ==========================================

userSchema.pre(
  "save",
  async function () {

    if (!this.isModified("password")) {
      return;
    }

    this.password =
      await bcrypt.hash(
        this.password,
        10
      );

  }
);


// ==========================================
// CHECK PASSWORD
// ==========================================

userSchema.methods.isPasswordCorrect =
  async function (password) {

    return await bcrypt.compare(
      password,
      this.password
    );

  };


// ==========================================
// GENERATE ACCESS TOKEN
// ==========================================

userSchema.methods.generateAccessToken =
  function () {

    return jwt.sign(

      {
        _id: this._id,
        email: this.email,
        role: this.role,
      },

      env.JWT_ACCESS_SECRET,

      {
        expiresIn:
          env.JWT_ACCESS_EXPIRY,
      }

    );

  };


// ==========================================
// GENERATE REFRESH TOKEN
// ==========================================

userSchema.methods.generateRefreshToken =
  function () {

    return jwt.sign(

      {
        _id: this._id,
      },

      env.JWT_REFRESH_SECRET,

      {
        expiresIn:
          env.JWT_REFRESH_EXPIRY,
      }

    );

  };


const User = mongoose.model(
  "User",
  userSchema
);

export default User;