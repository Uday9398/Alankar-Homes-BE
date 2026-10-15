import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AUTH_COOKIE } from "../controllers/authController.js";

const authMiddleware = async (req, res, next) => {
    try {
        // The website sends the httpOnly cookie, API tools like Postman can still send a Bearer header
        const authHeader = req.headers.authorization;
        const token = req.cookies?.[AUTH_COOKIE]
            || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing or invalid"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed",
            error: error.message
        });
    }
};

export default authMiddleware;
