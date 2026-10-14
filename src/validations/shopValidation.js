import Joi from "joi";
import { ORDER_STATUSES } from "../models/Order.js";
import { CUSTOM_REQUEST_STATUSES } from "../models/CustomRequest.js";

const categorySchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(60)
        .required()
        .messages({
            "string.empty": "Category name is required",
            "string.min": "Category name must be at least 2 characters",
            "any.required": "Category name is required"
        }),
    description: Joi.string().trim().allow("", null).max(500),
    image: Joi.string().trim().allow("", null).max(500)
});

const productFields = {
    name: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .messages({
            "string.empty": "Product name is required",
            "string.min": "Product name must be at least 2 characters",
            "any.required": "Product name is required"
        }),
    description: Joi.string().trim().allow("", null).max(5000),
    price: Joi.number()
        .positive()
        .precision(2)
        .messages({
            "number.base": "Price must be a number",
            "number.positive": "Price must be greater than 0",
            "any.required": "Price is required"
        }),
    mrp: Joi.number()
        .positive()
        .precision(2)
        .allow(null)
        .messages({
            "number.base": "MRP must be a number",
            "number.positive": "MRP must be greater than 0"
        }),
    stock: Joi.number()
        .integer()
        .min(0)
        .messages({
            "number.base": "Stock must be a number",
            "number.min": "Stock cannot be negative"
        }),
    images: Joi.array().items(Joi.string().trim().max(500)).max(8),
    categoryId: Joi.number().integer().allow(null),
    isFeatured: Joi.boolean(),
    isActive: Joi.boolean()
};

const createProductSchema = Joi.object({
    ...productFields,
    name: productFields.name.required(),
    price: productFields.price.required()
});

const updateProductSchema = Joi.object(productFields).min(1);

// Delivery address, shared by checkout and custom requests
const shippingFields = {
    shippingName: Joi.string().trim().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name is too short",
        "any.required": "Name is required"
    }),
    shippingPhone: Joi.string().trim().pattern(/^[0-9+\-\s]{10,15}$/).required().messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Please enter a valid phone number",
        "any.required": "Phone number is required"
    }),
    shippingAddress: Joi.string().trim().min(5).max(500).required().messages({
        "string.empty": "Address is required",
        "string.min": "Please enter your full address",
        "any.required": "Address is required"
    }),
    shippingCity: Joi.string().trim().min(2).max(100).required().messages({
        "string.empty": "City is required",
        "string.min": "City is too short",
        "any.required": "City is required"
    }),
    shippingState: Joi.string().trim().min(2).max(100).required().messages({
        "string.empty": "State is required",
        "string.min": "State is too short",
        "any.required": "State is required"
    }),
    shippingPincode: Joi.string().trim().pattern(/^[0-9]{6}$/).required().messages({
        "string.empty": "Pincode is required",
        "string.pattern.base": "Pincode must be 6 digits",
        "any.required": "Pincode is required"
    })
};

const createOrderSchema = Joi.object({
    items: Joi.array()
        .items(Joi.object({
            productId: Joi.number().integer().required(),
            quantity: Joi.number().integer().min(1).max(50).required()
        }))
        .min(1)
        .required()
        .messages({
            "array.min": "Your cart is empty",
            "any.required": "Your cart is empty"
        }),
    ...shippingFields,
    notes: Joi.string().trim().allow("", null).max(500)
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid(...ORDER_STATUSES)
        .required()
        .messages({
            "any.only": `Status must be one of: ${ORDER_STATUSES.join(", ")}`,
            "any.required": "Status is required"
        })
});

const updateUserRoleSchema = Joi.object({
    role: Joi.string()
        .valid("customer", "admin")
        .required()
        .messages({
            "any.only": "Role must be customer or admin",
            "any.required": "Role is required"
        })
});

// Customers may only attach photos uploaded to our own Cloudinary account
const ownImageUrl = Joi.string().trim().max(500).custom((value, helpers) => {
    const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
    return value.startsWith(prefix) ? value : helpers.message("Please upload the photos again");
});

const createCustomRequestSchema = Joi.object({
    title: Joi.string().trim().min(3).max(150).required().messages({
        "string.empty": "Please tell us what you'd like made",
        "string.min": "Please give a few more words about what you'd like made",
        "any.required": "Please tell us what you'd like made"
    }),
    description: Joi.string().trim().min(10).max(3000).required().messages({
        "string.empty": "Please describe the piece",
        "string.min": "Please add a little more detail (at least 10 characters)",
        "any.required": "Please describe the piece"
    }),
    images: Joi.array().items(ownImageUrl).max(5).default([]).messages({
        "array.max": "You can attach up to 5 photos"
    }),
    quantity: Joi.number().integer().min(1).max(500).default(1).messages({
        "number.base": "Quantity must be a number",
        "number.min": "Quantity must be at least 1"
    }),
    budget: Joi.number().positive().precision(2).allow(null).messages({
        "number.base": "Budget must be a number",
        "number.positive": "Budget must be greater than 0"
    }),
    // A YYYY-MM-DD date that is today or later
    neededBy: Joi.string().trim().pattern(/^\d{4}-\d{2}-\d{2}$/).empty("").allow(null)
        .custom((value, helpers) => {
            if (!value) return null;
            if (Number.isNaN(Date.parse(value))) return helpers.message("Please pick a valid date");
            const today = new Date().toISOString().slice(0, 10);
            return value >= today ? value : helpers.message("The date can't be in the past");
        })
        .messages({ "string.pattern.base": "Please pick a valid date" }),
    ...shippingFields
});

const updateCustomRequestSchema = Joi.object({
    status: Joi.string().valid(...CUSTOM_REQUEST_STATUSES).messages({
        "any.only": `Status must be one of: ${CUSTOM_REQUEST_STATUSES.join(", ")}`
    }),
    quotedPrice: Joi.number().positive().precision(2).messages({
        "number.base": "Price must be a number",
        "number.positive": "Price must be greater than 0"
    }),
    adminNote: Joi.string().trim().allow("", null).max(2000)
}).min(1);

const addressSchema = Joi.object({
    label: Joi.string().trim().min(1).max(30).default("Home").messages({
        "string.empty": "Please give this address a name, like Home or Work",
        "string.max": "Address name cannot exceed 30 characters"
    }),
    ...shippingFields,
    isDefault: Joi.boolean()
});

export {
    categorySchema,
    createProductSchema,
    updateProductSchema,
    createOrderSchema,
    updateOrderStatusSchema,
    updateUserRoleSchema,
    createCustomRequestSchema,
    updateCustomRequestSchema,
    addressSchema
};
