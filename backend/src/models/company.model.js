import mongoose from "mongoose";
const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true, // important field 
      trim: true, // remove whitespaces 
      unique: true, 
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields automatically
  }
);

const Company = mongoose.model("Company", companySchema); // creates a model named "Company" based on the companySchema, allowing interaction with the "companies" collection in the MongoDB database

export default Company; 