import { Op } from "sequelize";
import { Category, Product } from "../models/index.js";
import AppError from "../utils/AppError.js";

const SORT_OPTIONS = {
    newest: [["createdAt", "DESC"]],
    price_asc: [["price", "ASC"]],
    price_desc: [["price", "DESC"]],
    name: [["name", "ASC"]]
};

const categoryInclude = {
    model: Category,
    as: "category",
    attributes: ["id", "name"]
};

const listProducts = async ({ search, categoryId, featured, sort, page, limit, includeInactive }) => {
    const where = {};

    if (!includeInactive) {
        where.isActive = true;
    }
    if (search) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ];
    }
    if (categoryId) {
        where.categoryId = categoryId;
    }
    if (featured) {
        where.isFeatured = true;
    }

    const pageNumber = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 12));

    const { rows, count } = await Product.findAndCountAll({
        where,
        include: [categoryInclude],
        order: SORT_OPTIONS[sort] || SORT_OPTIONS.newest,
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize
    });

    return {
        products: rows,
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total: count,
            totalPages: Math.ceil(count / pageSize)
        }
    };
};

const getProductById = async (id, { includeInactive = false } = {}) => {
    const product = await Product.findByPk(id, { include: [categoryInclude] });
    if (!product || (!product.isActive && !includeInactive)) {
        throw new AppError("Product not found", 404);
    }
    return product;
};

const ensureCategoryExists = async (categoryId) => {
    if (categoryId && !(await Category.findByPk(categoryId))) {
        throw new AppError("Selected category does not exist");
    }
};

const createProduct = async (data) => {
    await ensureCategoryExists(data.categoryId);
    const product = await Product.create(data);
    return getProductById(product.id, { includeInactive: true });
};

const updateProduct = async (id, data) => {
    const product = await Product.findByPk(id);
    if (!product) {
        throw new AppError("Product not found", 404);
    }
    await ensureCategoryExists(data.categoryId);
    await product.update(data);
    return getProductById(id, { includeInactive: true });
};

const deleteProduct = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) {
        throw new AppError("Product not found", 404);
    }
    // Past orders keep their own copy of the name, price and image
    await product.destroy();
};

export { listProducts, getProductById, createProduct, updateProduct, deleteProduct };
