import mongoose from "mongoose";
import { DB_Name } from "../constant.js";

const connectDB = async () => {
  try {
    const createdInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_Name}`
    );
    console.log(
      "DB CONNECTED SUCCESSFULLY: \nDB HOST: ",
      createdInstance.connection.host
    );
  } catch (error) {
    "DB Connection Failed: ", error;
    process.exit(1);
  }
};

export default connectDB;
