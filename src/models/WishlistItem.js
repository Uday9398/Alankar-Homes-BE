import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

// One row per (user, product) a customer has hearted
export const WishlistItem = sequelize.define(
    "WishlistItem",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    },
    {
        tableName: "wishlist_items",
        timestamps: true,
        updatedAt: false,
        indexes: [
            { unique: true, fields: ["userId", "productId"] }
        ]
    }
)

export default WishlistItem
