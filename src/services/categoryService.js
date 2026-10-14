import sequelize from "../config/database.js";
import { Category, Product } from "../models/index.js";
import AppError from "../utils/AppError.js";

const listCategories = async () => {
    // Includes how many visible products each category has
    return Category.findAll({
        attributes: {
            include: [[
                sequelize.literal(`(SELECT COUNT(*) FROM products p WHERE p."categoryId" = "Category"."id" AND p."isActive" = true)::int`),
                "productCount"
            ]]
        },
        order: [["name", "ASC"]]
    });
};

const createCategory = async (data) => {
    return Category.create(data);
};

const updateCategory = async (id, data) => {
    const category = await Category.findByPk(id);
    if (!category) {
        throw new AppError("Category not found", 404);
    }
    return category.update(data);
};

const deleteCategory = async (id) => {
    const category = await Category.findByPk(id);
    if (!category) {
        throw new AppError("Category not found", 404);
    }
    // Products in this category stay in the shop, just without a category
    await Product.update({ categoryId: null }, { where: { categoryId: id } });
    await category.destroy();
};

export { listCategories, createCategory, updateCategory, deleteCategory };
