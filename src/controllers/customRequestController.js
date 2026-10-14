import {
    createCustomRequest,
    listMyCustomRequests,
    getCustomRequest,
    acceptQuote,
    cancelMyCustomRequest,
    listAllCustomRequests,
    updateCustomRequest
} from "../services/customRequestService.js";
import { uploadImages } from "../services/imageService.js";
import { notifyNewCustomRequest } from "../services/notificationService.js";
import { sendError } from "../utils/AppError.js";
import { parseId } from "../utils/parseId.js";

const uploadReferenceImages = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please choose at least one image"
        });
    }
    try {
        const urls = await uploadImages(req.files, "custom-requests");
        return res.status(201).json({
            success: true,
            message: "Images uploaded successfully",
            data: urls
        });
    } catch (error) {
        return sendError(res, error, "Upload custom request images");
    }
};

const submitCustomRequest = async (req, res) => {
    try {
        const request = await createCustomRequest(req.user.id, req.body);
        notifyNewCustomRequest(request);
        return res.status(201).json({
            success: true,
            message: "Your request has been sent",
            data: request
        });
    } catch (error) {
        return sendError(res, error, "Create custom request");
    }
};

const getMyCustomRequests = async (req, res) => {
    try {
        const requests = await listMyCustomRequests(req.user.id);
        return res.status(200).json({ success: true, data: requests });
    } catch (error) {
        return sendError(res, error, "Get my custom requests");
    }
};

const getCustomRequestById = async (req, res) => {
    try {
        const request = await getCustomRequest(parseId(req.params.id, "Request"), req.user);
        return res.status(200).json({ success: true, data: request });
    } catch (error) {
        return sendError(res, error, "Get custom request");
    }
};

const acceptCustomRequestQuote = async (req, res) => {
    try {
        const request = await acceptQuote(parseId(req.params.id, "Request"), req.user.id);
        return res.status(200).json({
            success: true,
            message: "Price accepted, we'll start making your piece",
            data: request
        });
    } catch (error) {
        return sendError(res, error, "Accept custom request quote");
    }
};

const cancelCustomRequest = async (req, res) => {
    try {
        const request = await cancelMyCustomRequest(parseId(req.params.id, "Request"), req.user.id);
        return res.status(200).json({
            success: true,
            message: "Request cancelled",
            data: request
        });
    } catch (error) {
        return sendError(res, error, "Cancel custom request");
    }
};

const getAllCustomRequests = async (req, res) => {
    try {
        const { status, page, limit } = req.query;
        const result = await listAllCustomRequests({ status, page, limit });
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return sendError(res, error, "Get all custom requests");
    }
};

const editCustomRequest = async (req, res) => {
    try {
        const request = await updateCustomRequest(parseId(req.params.id, "Request"), req.body);
        return res.status(200).json({
            success: true,
            message: "Request updated",
            data: request
        });
    } catch (error) {
        return sendError(res, error, "Update custom request");
    }
};

export {
    uploadReferenceImages,
    submitCustomRequest,
    getMyCustomRequests,
    getCustomRequestById,
    acceptCustomRequestQuote,
    cancelCustomRequest,
    getAllCustomRequests,
    editCustomRequest
};
