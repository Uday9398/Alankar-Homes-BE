import { listWishlist, addToWishlist, removeFromWishlist } from "../services/wishlistService.js";
import { sendError } from "../utils/AppError.js";
import { parseId } from "../utils/parseId.js";

const getWishlist = async (req, res) => {
    try {
        const products = await listWishlist(req.user.id);
        return res.status(200).json({ success: true, data: products });
    } catch (error) {
        return sendError(res, error, "Get wishlist");
    }
};

const addWishlistItem = async (req, res) => {
    try {
        await addToWishlist(req.user.id, parseId(req.params.productId, "Product"));
        return res.status(201).json({ success: true, message: "Added to your wishlist" });
    } catch (error) {
        return sendError(res, error, "Add to wishlist");
    }
};

const removeWishlistItem = async (req, res) => {
    try {
        await removeFromWishlist(req.user.id, parseId(req.params.productId, "Product"));
        return res.status(200).json({ success: true, message: "Removed from your wishlist" });
    } catch (error) {
        return sendError(res, error, "Remove from wishlist");
    }
};

export { getWishlist, addWishlistItem, removeWishlistItem };
