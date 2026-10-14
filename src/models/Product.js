import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

export const Product = sequelize.define(
    "Product",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Product name is required"
                },
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            // Postgres returns DECIMAL as a string; expose it as a number
            get() {
                const value = this.getDataValue("price");
                return value === null ? null : Number(value);
            }
        },
        // Original price, shown struck-through when the item is on sale
        mrp: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            get() {
                const value = this.getDataValue("mrp");
                return value === null ? null : Number(value);
            }
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        // List of image URLs, the first one is the cover image
        images: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: []
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        // Hidden products are not shown in the shop but stay on old orders
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        tableName: "products",
        timestamps: true
    }
)

export default Product
