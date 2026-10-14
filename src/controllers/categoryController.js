import {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../services/categoryService.js";
import { sendError } from "../utils/AppError.js";
import { parseId } from "../utils/parseId.js";

const getCategories = async (req, res) => {
    try {
        const categories = await listCategories();
        return res.status(200).json({ success: true, data: categories });
    } catch (error) {
        return sendError(res, error, "Get categories");
    }
};

const addCategory = async (req, res) => {
    try {
        const category = await createCategory(req.body);
        return res.status(201).json({
            success: true,
            message: "Category added successfully",
            data: category
        });
    } catch (error) {
        return sendError(res, error, "Create category");
    }
};

const editCategory = async (req, res) => {
    try {
        const category = await updateCategory(parseId(req.params.id, "Category"), req.body);
        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });
    } catch (error) {
        return sendError(res, error, "Update category");
    }
};

const removeCategory = async (req, res) => {
    try {
        await deleteCategory(parseId(req.params.id, "Category"));
        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        return sendError(res, error, "Delete category");
    }
};

export { getCategories, addCategory, editCategory, removeCategory };
