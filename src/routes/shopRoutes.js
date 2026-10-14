import express from "express"
import { getProducts, getProduct } from '../controllers/productController.js'
import { getCategories } from '../controllers/categoryController.js'
import { placeOrder, getMyOrders, getOrderById, cancelOrder } from '../controllers/orderController.js'
import { getWishlist, addWishlistItem, removeWishlistItem } from '../controllers/wishlistController.js'
import {
    uploadReferenceImages,
    submitCustomRequest,
    getMyCustomRequests,
    getCustomRequestById,
    acceptCustomRequestQuote,
    cancelCustomRequest
} from '../controllers/customRequestController.js'
import { getAddresses, addAddress, editAddress, makeDefaultAddress, removeAddress } from '../controllers/addressController.js'
import validate from '../middleware/validationMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { uploadCustomRequestImages } from '../middleware/uploadMiddleware.js'
import { createOrderSchema, createCustomRequestSchema, addressSchema } from '../validations/shopValidation.js'

const router = express.Router();

// Public catalogue
router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/:id', getProduct);

// Signed-in customers
router.post('/orders', authMiddleware, validate(createOrderSchema), placeOrder);
router.get('/orders/my', authMiddleware, getMyOrders);
router.get('/orders/:id', authMiddleware, getOrderById);
router.post('/orders/:id/cancel', authMiddleware, cancelOrder);

router.get('/wishlist', authMiddleware, getWishlist);
router.post('/wishlist/:productId', authMiddleware, addWishlistItem);
router.delete('/wishlist/:productId', authMiddleware, removeWishlistItem);

// Saved delivery addresses
router.get('/addresses', authMiddleware, getAddresses);
router.post('/addresses', authMiddleware, validate(addressSchema), addAddress);
router.put('/addresses/:id', authMiddleware, validate(addressSchema), editAddress);
router.post('/addresses/:id/default', authMiddleware, makeDefaultAddress);
router.delete('/addresses/:id', authMiddleware, removeAddress);

// Made-to-order pieces
router.post('/custom-requests/uploads', authMiddleware, uploadCustomRequestImages, uploadReferenceImages);
router.post('/custom-requests', authMiddleware, validate(createCustomRequestSchema), submitCustomRequest);
router.get('/custom-requests/my', authMiddleware, getMyCustomRequests);
router.get('/custom-requests/:id', authMiddleware, getCustomRequestById);
router.post('/custom-requests/:id/accept', authMiddleware, acceptCustomRequestQuote);
router.post('/custom-requests/:id/cancel', authMiddleware, cancelCustomRequest);

export default router
