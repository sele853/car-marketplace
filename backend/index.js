import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads',express.static('uploads'));

app.use('/api/auth',authRoutes);
app.use('/api/cars',carRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT , () => console.log(`Server running on port ${PORT}`));