import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export const Order = sequelize.define(
    "Order",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: DataTypes.ENUM(...ORDER_STATUSES),
            allowNull: false,
            defaultValue: "pending"
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get() {
                return Number(this.getDataValue("totalAmount"));
            }
        },
        paymentMethod: {
            type: DataTypes.ENUM("cod"),
            allowNull: false,
            defaultValue: "cod"
        },
        // Shipping details are copied onto the order so they never change later
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
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        tableName: "orders",
        timestamps: true
    }
)

export default Order
