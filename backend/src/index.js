import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

// to be able to extract the json data from express
app.use(express.json());
app.use(cookieParser());

// route for authentication
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.listen(5001, () => {
  console.log("server is running on port:" + PORT);
  connectDB();
});
