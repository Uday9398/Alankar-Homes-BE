import express from "express"
import authRoutes from "./authRoutes.js"
import shopRoutes from "./shopRoutes.js"
import adminRoutes from "./adminRoutes.js"

const router = express.Router()

router.use("/", authRoutes)
router.use("/", shopRoutes)
router.use("/admin", adminRoutes)

export default router
