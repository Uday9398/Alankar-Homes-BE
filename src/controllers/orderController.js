import {
    createOrder,
    listMyOrders,
    getOrder,
    listAllOrders,
    updateOrderStatus,
    cancelMyOrder,
    getDashboardStats
} from "../services/orderService.js";
import { notifyNewOrder } from "../services/notificationService.js";
import { sendError } from "../utils/AppError.js";
import { parseId } from "../utils/parseId.js";

const placeOrder = async (req, res) => {
    try {
        const order = await createOrder(req.user.id, req.body);
        notifyNewOrder(order);
        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: order
        });
    } catch (error) {
        return sendError(res, error, "Place order");
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await listMyOrders(req.user.id);
        return res.status(200).json({ success: true, data: orders });
    } catch (error) {
        return sendError(res, error, "Get my orders");
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await getOrder(parseId(req.params.id, "Order"), req.user);
        return res.status(200).json({ success: true, data: order });
    } catch (error) {
        return sendError(res, error, "Get order");
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await cancelMyOrder(parseId(req.params.id, "Order"), req.user.id);
        return res.status(200).json({
            success: true,
            message: "Order cancelled",
            data: order
        });
    } catch (error) {
        return sendError(res, error, "Cancel order");
    }
};

const getAllOrders = async (req, res) => {
    try {
        const { status, page, limit } = req.query;
        const result = await listAllOrders({ status, page, limit });
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return sendError(res, error, "Get all orders");
    }
};

const setOrderStatus = async (req, res) => {
    try {
        const order = await updateOrderStatus(parseId(req.params.id, "Order"), req.body.status);
        return res.status(200).json({
            success: true,
            message: "Order status updated",
            data: order
        });
    } catch (error) {
        return sendError(res, error, "Update order status");
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await getDashboardStats();
        return res.status(200).json({ success: true, data: stats });
    } catch (error) {
        return sendError(res, error, "Get stats");
    }
};

export {
    placeOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    setOrderStatus,
    getStats
};
