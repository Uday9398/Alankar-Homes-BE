import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from '../models/User.js'
import dotenv from "dotenv"

const registerUser = async ({ name, email, phone, password, confirmPassword }) => {
    if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
    }

    const existingUser = await User.findOne({
        where: {
            email,
        },
    });

    if (existingUser) {
        throw new Error("Email is already registered")
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: "customer"
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
    }

}


const loginUser = async ({ email, password }) => {


    const user = await User.findOne({
        where: {
            email
        }
    })
    if (!user) {
        throw new Error("Invalid email or password")
    }

    const checkPassword = await bcrypt.compare(password,
        user.password
    );

    if (!checkPassword) {
        throw new Error("Invalid email or password")
    }

    const token = jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    }
}
export { registerUser, loginUser };
export default { registerUser, loginUser };