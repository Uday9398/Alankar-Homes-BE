import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import sequelize, { connectDB } from "./config/database.js";
import "./models/index.js";
import routes from "./routes/index.js"
import { UPLOAD_ROOT } from "./middleware/uploadMiddleware.js";


dotenv.config()

const app = express();

// Render sits behind a proxy, this lets req.secure see the original https request
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

// Product photos uploaded from the admin panel
app.use("/uploads", express.static(UPLOAD_ROOT, { maxAge: "7d" }));

app.use("/api/v1", routes);

const PORT = process.env.PORT || 5000
try {
    await connectDB();

    await sequelize.sync()

    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

} catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);

}
