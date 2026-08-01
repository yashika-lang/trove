import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async ()=> { 
    try {
        const connectionInstance = await mongoose.connect(env.MONGO_URI);

        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } 
    catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1); // 0 indicates succes , 1 indicates failure 
    }
};
export default connectDB; 

