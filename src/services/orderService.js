import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { Order, OrderItem, Product, User } from "../models/index.js";
import { ORDER_STATUSES } from "../models/Order.js";
import AppError from "../utils/AppError.js";

const orderIncludes = [
    { model: OrderItem, as: "items" },
    { model: User, as: "user", attributes: ["id", "name", "email", "phone"] }
];

const createOrder = async (userId, { items, ...shipping }) => {
    // Merge duplicate lines so stock is checked against the full quantity
    const quantities = new Map();
    for (const item of items) {
        quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    }

    const orderId = await sequelize.transaction(async (transaction) => {
        // Row locks stop two customers buying the last piece at the same time
        const products = await Product.findAll({
            where: { id: [...quantities.keys()] },
            lock: transaction.LOCK.UPDATE,
            transaction
        });
        const productsById = new Map(products.map((p) => [p.id, p]));

        let totalAmount = 0;
        const orderItems = [];

        for (const [productId, quantity] of quantities) {
            const product = productsById.get(productId);
            if (!product || !product.isActive) {
                throw new AppError("One of the items in your cart is no longer available");
            }
            if (product.stock < quantity) {
                throw new AppError(
                    product.stock === 0
                        ? `"${product.name}" is out of stock`
                        : `Only ${product.stock} of "${product.name}" left in stock`
                );
            }

            // Prices always come from the database, never from the client
            totalAmount += product.price * quantity;
            orderItems.push({
                productId,
                productName: product.name,
                productImage: product.images?.[0] || null,
                price: product.price,
                quantity
            });

            await product.decrement("stock", { by: quantity, transaction });
        }

        const order = await Order.create({
            ...shipping,
            userId,
            totalAmount: totalAmount.toFixed(2),
            paymentMethod: "cod",
            status: "pending"
        }, { transaction });

        await OrderItem.bulkCreate(
            orderItems.map((item) => ({ ...item, orderId: order.id })),
            { transaction }
        );

        return order.id;
    });

    return Order.findByPk(orderId, { include: orderIncludes });
};

const listMyOrders = async (userId) => {
    return Order.findAll({
        where: { userId },
        include: [{ model: OrderItem, as: "items" }],
        order: [["createdAt", "DESC"]]
    });
};

const getOrder = async (id, user) => {
    const order = await Order.findByPk(id, { include: orderIncludes });
    // Customers get a 404 for other people's orders so ids can't be probed
    if (!order || (user.role !== "admin" && order.userId !== user.id)) {
        throw new AppError("Order not found", 404);
    }
    return order;
};

const listAllOrders = async ({ status, page, limit }) => {
    const where = ORDER_STATUSES.includes(status) ? { status } : {};
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const { rows, count } = await Order.findAndCountAll({
        where,
        include: orderIncludes,
        order: [["createdAt", "DESC"]],
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        distinct: true
    });

    return {
        orders: rows,
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total: count,
            totalPages: Math.ceil(count / pageSize)
        }
    };
};

const changeStatus = async (id, status, { onlyIfPendingForUserId } = {}) => {
    await sequelize.transaction(async (transaction) => {
        // Postgres can't lock rows through an outer join, so items are loaded separately
        const order = await Order.findByPk(id, {
            lock: transaction.LOCK.UPDATE,
            transaction
        });

        if (!order || (onlyIfPendingForUserId && order.userId !== onlyIfPendingForUserId)) {
            throw new AppError("Order not found", 404);
        }
        if (onlyIfPendingForUserId && order.status !== "pending") {
            throw new AppError("Only pending orders can be cancelled. Please contact us for help.");
        }
        if (order.status === "cancelled") {
            throw new AppError("This order is already cancelled");
        }
        if (order.status === status) {
            return;
        }

        // Put the items back on the shelf
        if (status === "cancelled") {
            const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction });
            for (const item of items) {
                if (item.productId) {
                    await Product.increment("stock", {
                        by: item.quantity,
                        where: { id: item.productId },
                        transaction
                    });
                }
            }
        }

        await order.update({ status }, { transaction });
    });

    return Order.findByPk(id, { include: orderIncludes });
};

const updateOrderStatus = (id, status) => changeStatus(id, status);

const cancelMyOrder = (id, userId) => changeStatus(id, "cancelled", { onlyIfPendingForUserId: userId });

const getDashboardStats = async () => {
    const [totalProducts, lowStockProducts, totalCustomers, statusCounts, revenue, recentOrders] = await Promise.all([
        Product.count(),
        Product.findAll({
            where: { stock: { [Op.lte]: 3 }, isActive: true },
            attributes: ["id", "name", "stock", "images"],
            order: [["stock", "ASC"]],
            limit: 10
        }),
        User.count({ where: { role: "customer" } }),
        Order.findAll({
            attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
            group: ["status"],
            raw: true
        }),
        Order.sum("totalAmount", { where: { status: { [Op.ne]: "cancelled" } } }),
        Order.findAll({
            include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
            order: [["createdAt", "DESC"]],
            limit: 5
        })
    ]);

    const ordersByStatus = Object.fromEntries(statusCounts.map((row) => [row.status, Number(row.count)]));

    return {
        totalProducts,
        totalCustomers,
        totalOrders: Object.values(ordersByStatus).reduce((sum, n) => sum + n, 0),
        ordersByStatus,
        revenue: Number(revenue) || 0,
        lowStockProducts,
        recentOrders
    };
};

export {
    createOrder,
    listMyOrders,
    getOrder,
    listAllOrders,
    updateOrderStatus,
    cancelMyOrder,
    getDashboardStats
};
