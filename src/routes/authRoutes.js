import express from "express"
import { register, login, getMe } from '../controllers/authController.js'
import validate from '../middleware/validationMiddleware.js'
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validations/authValidation.js'
import { getMyProfile, updateMyProfile, changeMyPassword } from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getMe);

router.get('/users/profile', authMiddleware, getMyProfile);
router.put('/users/profile', authMiddleware, validate(updateProfileSchema), updateMyProfile);
router.put('/users/profile/password', authMiddleware, validate(changePasswordSchema), changeMyPassword);

export default router