import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

// Name, price and image are snapshots taken when the order was placed
export const OrderItem = sequelize.define(
    "OrderItem",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        productName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        productImage: {
            type: DataTypes.STRING,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get() {
                return Number(this.getDataValue("price"));
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: "order_items",
        timestamps: false
    }
)

export default OrderItem
