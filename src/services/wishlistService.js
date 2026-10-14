import { Category, Product, WishlistItem } from "../models/index.js";
import AppError from "../utils/AppError.js";

// Hidden products stay saved but aren't shown until they're back in the shop
const listWishlist = async (userId) => {
    const items = await WishlistItem.findAll({
        where: { userId },
        include: [{
            model: Product,
            as: "product",
            where: { isActive: true },
            include: [{ model: Category, as: "category", attributes: ["id", "name"] }]
        }],
        order: [["createdAt", "DESC"]]
    });
    return items.map((item) => item.product);
};

const addToWishlist = async (userId, productId) => {
    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
        throw new AppError("Product not found", 404);
    }
    // Adding twice is harmless
    await WishlistItem.findOrCreate({ where: { userId, productId } });
};

const removeFromWishlist = async (userId, productId) => {
    await WishlistItem.destroy({ where: { userId, productId } });
};

export { listWishlist, addToWishlist, removeFromWishlist };
