import mongoose from "mongoose";

const db_connection = async () => {
  try {
    await mongoose.connect('mongodb+srv://youssef:222001@cluster0.4jkqi.mongodb.net/E-comm-app');
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error in database connection: ", error.message);
  }
};


export default db_connection;