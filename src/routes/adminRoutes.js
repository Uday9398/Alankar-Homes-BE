import express from "express"
import {
    adminGetProducts,
    adminGetProduct,
    addProduct,
    editProduct,
    removeProduct,
    uploadImages
} from '../controllers/productController.js'
import { addCategory, editCategory, removeCategory } from '../controllers/categoryController.js'
import { getAllOrders, getOrderById, setOrderStatus, getStats } from '../controllers/orderController.js'
import { getUsers, setUserRole } from '../controllers/userController.js'
import { getAllCustomRequests, getCustomRequestById, editCustomRequest } from '../controllers/customRequestController.js'
import validate from '../middleware/validationMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import adminMiddleware from '../middleware/adminMiddleware.js'
import uploadProductImages from '../middleware/uploadMiddleware.js'
import {
    categorySchema,
    createProductSchema,
    updateProductSchema,
    updateOrderStatusSchema,
    updateUserRoleSchema,
    updateCustomRequestSchema
} from '../validations/shopValidation.js'

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', getStats);

router.get('/products', adminGetProducts);
router.get('/products/:id', adminGetProduct);
router.post('/products', validate(createProductSchema), addProduct);
router.put('/products/:id', validate(updateProductSchema), editProduct);
router.delete('/products/:id', removeProduct);
router.post('/uploads', uploadProductImages, uploadImages);

router.post('/categories', validate(categorySchema), addCategory);
router.put('/categories/:id', validate(categorySchema), editCategory);
router.delete('/categories/:id', removeCategory);

router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), setOrderStatus);

router.get('/custom-requests', getAllCustomRequests);
router.get('/custom-requests/:id', getCustomRequestById);
router.patch('/custom-requests/:id', validate(updateCustomRequestSchema), editCustomRequest);

router.get('/users', getUsers);
router.patch('/users/:id/role', validate(updateUserRoleSchema), setUserRole);

export default router
