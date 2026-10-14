import { CustomRequest, User } from "../models/index.js";
import { CUSTOM_REQUEST_STATUSES } from "../models/CustomRequest.js";
import AppError from "../utils/AppError.js";

const userInclude = { model: User, as: "user", attributes: ["id", "name", "email", "phone"] };

// Where the shop owner can move a request from each status.
// "quoted" → "quoted" lets the owner revise the price.
const ADMIN_NEXT_STATUSES = {
    pending: ["quoted", "cancelled"],
    quoted: ["quoted", "accepted", "cancelled"],
    accepted: ["in_progress", "cancelled"],
    in_progress: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: []
};

const createCustomRequest = async (userId, data) => {
    const request = await CustomRequest.create({ ...data, userId, status: "pending" });
    return CustomRequest.findByPk(request.id, { include: [userInclude] });
};

const listMyCustomRequests = async (userId) => {
    return CustomRequest.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]]
    });
};

const getCustomRequest = async (id, user) => {
    const request = await CustomRequest.findByPk(id, { include: [userInclude] });
    // Customers get a 404 for other people's requests so ids can't be probed
    if (!request || (user.role !== "admin" && request.userId !== user.id)) {
        throw new AppError("Request not found", 404);
    }
    return request;
};

const findOwnRequest = async (id, userId) => {
    const request = await CustomRequest.findByPk(id);
    if (!request || request.userId !== userId) {
        throw new AppError("Request not found", 404);
    }
    return request;
};

const acceptQuote = async (id, userId) => {
    const request = await findOwnRequest(id, userId);
    if (request.status !== "quoted") {
        throw new AppError("There is no price waiting for your approval");
    }
    await request.update({ status: "accepted" });
    return getCustomRequest(id, { id: userId });
};

const cancelMyCustomRequest = async (id, userId) => {
    const request = await findOwnRequest(id, userId);
    if (!["pending", "quoted"].includes(request.status)) {
        throw new AppError("We've already started on this piece. Please contact us to make changes.");
    }
    await request.update({ status: "cancelled" });
    return getCustomRequest(id, { id: userId });
};

const listAllCustomRequests = async ({ status, page, limit }) => {
    const where = CUSTOM_REQUEST_STATUSES.includes(status) ? { status } : {};
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const { rows, count } = await CustomRequest.findAndCountAll({
        where,
        include: [userInclude],
        order: [["createdAt", "DESC"]],
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize
    });

    return {
        requests: rows,
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total: count,
            totalPages: Math.ceil(count / pageSize)
        }
    };
};

const updateCustomRequest = async (id, { status, quotedPrice, adminNote }) => {
    const request = await CustomRequest.findByPk(id);
    if (!request) {
        throw new AppError("Request not found", 404);
    }

    const changes = {};
    if (adminNote !== undefined) {
        changes.adminNote = adminNote || null;
    }
    if (quotedPrice !== undefined) {
        if (!["pending", "quoted"].includes(request.status)) {
            throw new AppError("The price can only be changed before the customer accepts it");
        }
        changes.quotedPrice = quotedPrice;
        // Sending a price is what turns a new request into a quote
        changes.status = status || "quoted";
    }
    if (status !== undefined && status !== request.status) {
        if (!ADMIN_NEXT_STATUSES[request.status].includes(status)) {
            throw new AppError(`A request that is "${request.status}" can't be moved to "${status}"`);
        }
        changes.status = status;
    }
    if (changes.status === "quoted" && !(changes.quotedPrice ?? request.quotedPrice)) {
        throw new AppError("Please enter a price before sending the quote");
    }

    await request.update(changes);
    return CustomRequest.findByPk(id, { include: [userInclude] });
};

export {
    createCustomRequest,
    listMyCustomRequests,
    getCustomRequest,
    acceptQuote,
    cancelMyCustomRequest,
    listAllCustomRequests,
    updateCustomRequest
};
