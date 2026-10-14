import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

// pending → quoted → accepted → in_progress → shipped → delivered, or cancelled along the way
export const CUSTOM_REQUEST_STATUSES = ["pending", "quoted", "accepted", "in_progress", "shipped", "delivered", "cancelled"];

const money = (field) => ({
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    // Postgres returns DECIMAL as a string; expose it as a number
    get() {
        const value = this.getDataValue(field);
        return value === null ? null : Number(value);
    }
});

export const CustomRequest = sequelize.define(
    "CustomRequest",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // Short name for the piece, e.g. "Name plate for our new home"
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // Reference photos uploaded by the customer (Cloudinary URLs)
        images: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: []
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        budget: money("budget"),
        neededBy: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM(...CUSTOM_REQUEST_STATUSES),
            allowNull: false,
            defaultValue: "pending"
        },
        // Total price the shop offers for the whole request
        quotedPrice: money("quotedPrice"),
        // Message from the shop shown to the customer (quote details, reason for cancelling...)
        adminNote: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        shippingName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        shippingPhone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        shippingAddress: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        shippingCity: {
            type: DataTypes.STRING,
            allowNull: false
        },
        shippingState: {
            type: DataTypes.STRING,
            allowNull: false
        },
        shippingPincode: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: "custom_requests",
        timestamps: true
    }
)

export default CustomRequest
