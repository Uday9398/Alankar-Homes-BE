import {
    listProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from "../services/productService.js";
import { uploadImages as uploadToCloudinary } from "../services/imageService.js";
import { sendError } from "../utils/AppError.js";
import { parseId } from "../utils/parseId.js";

const getProducts = async (req, res) => {
    try {
        const { search, category, featured, sort, page, limit } = req.query;
        const result = await listProducts({
            search: typeof search === "string" ? search.trim() : undefined,
            categoryId: parseInt(category) || undefined,
            featured: featured === "true",
            sort,
            page,
            limit,
            includeInactive: false
        });
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return sendError(res, error, "Get products");
    }
};

const getProduct = async (req, res) => {
    try {
        const product = await getProductById(parseId(req.params.id, "Product"));
        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        return sendError(res, error, "Get product");
    }
};

// Admin sees hidden products too
const adminGetProducts = async (req, res) => {
    try {
        const { search, category, sort, page, limit } = req.query;
        const result = await listProducts({
            search: typeof search === "string" ? search.trim() : undefined,
            categoryId: parseInt(category) || undefined,
            sort,
            page,
            limit,
            includeInactive: true
        });
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return sendError(res, error, "Admin get products");
    }
};

const adminGetProduct = async (req, res) => {
    try {
        const product = await getProductById(parseId(req.params.id, "Product"), { includeInactive: true });
        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        return sendError(res, error, "Admin get product");
    }
};

const addProduct = async (req, res) => {
    try {
        const product = await createProduct(req.body);
        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            data: product
        });
    } catch (error) {
        return sendError(res, error, "Create product");
    }
};

const editProduct = async (req, res) => {
    try {
        const product = await updateProduct(parseId(req.params.id, "Product"), req.body);
        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        return sendError(res, error, "Update product");
    }
};

const removeProduct = async (req, res) => {
    try {
        await deleteProduct(parseId(req.params.id, "Product"));
        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        return sendError(res, error, "Delete product");
    }
};

const uploadImages = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please choose at least one image"
        });
    }
    try {
        const urls = await uploadToCloudinary(req.files, "products");
        return res.status(201).json({
            success: true,
            message: "Images uploaded successfully",
            data: urls
        });
    } catch (error) {
        return sendError(res, error, "Upload images");
    }
};

export {
    getProducts,
    getProduct,
    adminGetProducts,
    adminGetProduct,
    addProduct,
    editProduct,
    removeProduct,
    uploadImages
};
