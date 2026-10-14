import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

// A customer's saved delivery address. Field names match the order's shipping
// fields so a saved address can be copied straight onto an order.
export const Address = sequelize.define(
    "Address",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // "Home", "Work", or any name the customer picks
        label: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "Home"
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
        },
        // Picked automatically at checkout; each customer has at most one
        isDefault: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: "addresses",
        timestamps: true
    }
)

export default Address
