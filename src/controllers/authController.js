import jwt from "jsonwebtoken";
import { registerUser, loginUser } from "../services/authService.js";
import { notifyNewUser } from "../services/notificationService.js";

export const AUTH_COOKIE = "token";

// httpOnly keeps the token away from page scripts, sameSite blocks cross-site requests from using it
const authCookieOptions = (req) => ({
    httpOnly: true,
    secure: req.secure,
    sameSite: "strict",
    path: "/",
});

const register = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword } = req.body;

        const user = await registerUser({
            name,
            email,
            phone,
            password,
            confirmPassword
        })

        notifyNewUser(user);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        })

    } catch (error) {
        console.error("Register error:", error);
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};



const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { token, user } = await loginUser({
            email,
            password
        })

        // The cookie expires together with the token inside it
        const { exp } = jwt.decode(token);
        res.cookie(AUTH_COOKIE, token, { ...authCookieOptions(req), expires: new Date(exp * 1000) });

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            data: { user }
        })
    } catch (error) {
        console.error("Login error:", error);
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

}

const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: req.user
        });
    } catch (error) {
        console.error("GetMe error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Page scripts can't read the httpOnly cookie, so only the server can remove it
const logout = (req, res) => {
    res.clearCookie(AUTH_COOKIE, authCookieOptions(req));
    return res.status(200).json({
        success: true,
        message: "Logged out"
    });
};

export { register, login, logout, getMe }