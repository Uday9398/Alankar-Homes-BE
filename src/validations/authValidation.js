import Joi from "joi";

const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Name is required",
            "string.min": "Name must be at least 2 characters",
            "string.max": "Name cannot exceed 100 characters",
            "any.required": "Name is required"
        }),
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email",
            "any.required": "Email is required"
        }),
    phone: Joi.string()
        .trim()
        .min(10)
        .max(15)
        .required()
        .messages({
            "string.empty": "Phone number is required",
            "string.min": "Phone number must be at least 10 characters",
            "string.max": "Phone number cannot exceed 15 characters",
            "any.required": "Phone number is required"
        }),
    password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters",
            "string.max": "Password cannot exceed 128 characters",
            "any.required": "Password is required"
        }),
    confirmPassword: Joi.any()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Confirm password is required"
        })
});

const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email",
            "any.required": "Email is required"
        }),
    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required",
            "any.required": "Password is required"
        })
});

const updateProfileSchema = Joi.object({
    name: registerSchema.extract("name"),
    phone: registerSchema.extract("phone")
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        "string.empty": "Please enter your current password",
        "any.required": "Please enter your current password"
    }),
    newPassword: registerSchema.extract("password"),
    confirmPassword: Joi.any()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Confirm password is required"
        })
});

export { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema };
