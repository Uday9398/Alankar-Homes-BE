import { registerUser, loginUser } from "../services/authService.js";
import { notifyNewUser } from "../services/notificationService.js";

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

        const result = await loginUser({
            email,
            password
        })

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            data: result
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

export { register, login, getMe }