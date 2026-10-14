import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../config/database.js";
import { CustomRequest, Order, OrderItem, User, WishlistItem } from "../models/index.js";
import AppError from "../utils/AppError.js";

const ROLES = ["customer", "admin"];

const listUsers = async ({ search, role, page, limit }) => {
    const where = {};
    if (search) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { phone: { [Op.iLike]: `%${search}%` } }
        ];
    }
    if (ROLES.includes(role)) {
        where.role = role;
    }

    const pageNumber = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const [{ rows, count }, totalUsers, admins, newThisMonth] = await Promise.all([
        User.findAndCountAll({
            where,
            // Never send password hashes; add order count and lifetime spend per user
            attributes: [
                "id", "name", "email", "phone", "role", "createdAt",
                [sequelize.literal(`(SELECT COUNT(*) FROM orders o WHERE o."userId" = "User"."id")::int`), "orderCount"],
                [sequelize.literal(`(SELECT COALESCE(SUM(o."totalAmount"), 0) FROM orders o WHERE o."userId" = "User"."id" AND o.status <> 'cancelled')::float`), "totalSpent"]
            ],
            order: [["createdAt", "DESC"]],
            limit: pageSize,
            offset: (pageNumber - 1) * pageSize
        }),
        User.count(),
        User.count({ where: { role: "admin" } }),
        User.count({
            where: {
                createdAt: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
            }
        })
    ]);

    return {
        users: rows,
        summary: {
            totalUsers,
            admins,
            customers: totalUsers - admins,
            newThisMonth
        },
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total: count,
            totalPages: Math.ceil(count / pageSize)
        }
    };
};

const updateUserRole = async (id, role, currentUser) => {
    // Stops an admin from locking themselves out by accident
    if (id === currentUser.id) {
        throw new AppError("You can't change your own role. Ask another admin to do it.");
    }

    return sequelize.transaction(async (transaction) => {
        const user = await User.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
        if (!user) {
            throw new AppError("User not found", 404);
        }

        // The shop must always keep at least one admin
        if (user.role === "admin" && role === "customer") {
            const admins = await User.count({ where: { role: "admin" }, transaction });
            if (admins <= 1) {
                throw new AppError("The shop needs at least one admin");
            }
        }

        await user.update({ role }, { transaction });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        };
    });
};

const publicFields = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt
});

// Everything the profile page shows about the signed-in user
const getProfile = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const [orderCount, totalSpent, customRequestCount, wishlistCount, recentOrders, recentCustomRequests] = await Promise.all([
        Order.count({ where: { userId } }),
        Order.sum("totalAmount", { where: { userId, status: { [Op.ne]: "cancelled" } } }),
        CustomRequest.count({ where: { userId } }),
        WishlistItem.count({ where: { userId } }),
        Order.findAll({
            where: { userId },
            include: [{ model: OrderItem, as: "items" }],
            order: [["createdAt", "DESC"]],
            limit: 3
        }),
        CustomRequest.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
            limit: 3
        })
    ]);

    // The address from the most recent order or custom request, shown as "saved address"
    const latest = [recentOrders[0], recentCustomRequests[0]]
        .filter(Boolean)
        .sort((a, b) => b.createdAt - a.createdAt)[0];
    const lastAddress = latest
        ? {
            shippingName: latest.shippingName,
            shippingPhone: latest.shippingPhone,
            shippingAddress: latest.shippingAddress,
            shippingCity: latest.shippingCity,
            shippingState: latest.shippingState,
            shippingPincode: latest.shippingPincode
        }
        : null;

    return {
        user: publicFields(user),
        stats: {
            orderCount,
            totalSpent: Number(totalSpent) || 0,
            customRequestCount,
            wishlistCount
        },
        lastAddress,
        recentOrders,
        recentCustomRequests
    };
};

const updateProfile = async (userId, { name, phone }) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    await user.update({ name, phone });
    return publicFields(user);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
        throw new AppError("Your current password is incorrect");
    }
    if (await bcrypt.compare(newPassword, user.password)) {
        throw new AppError("Your new password must be different from the current one");
    }
    await user.update({ password: await bcrypt.hash(newPassword, 10) });
};

export { listUsers, updateUserRole, getProfile, updateProfile, changePassword };
