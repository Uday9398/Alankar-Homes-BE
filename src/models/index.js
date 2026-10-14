import User from "./User.js";
import Category from "./Category.js";
import Product from "./Product.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import WishlistItem from "./WishlistItem.js";
import CustomRequest from "./CustomRequest.js";
import Address from "./Address.js";

Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category", onDelete: "SET NULL" });

User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: { name: "userId", allowNull: false }, as: "user" });

Order.hasMany(OrderItem, { foreignKey: { name: "orderId", allowNull: false }, as: "items", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// SET NULL keeps order history when a product is deleted
Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems", onDelete: "SET NULL" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Wishlist entries disappear with their user or product
User.hasMany(WishlistItem, { foreignKey: { name: "userId", allowNull: false }, as: "wishlist", onDelete: "CASCADE" });
WishlistItem.belongsTo(User, { foreignKey: "userId", as: "user" });
Product.hasMany(WishlistItem, { foreignKey: { name: "productId", allowNull: false }, as: "wishlistItems", onDelete: "CASCADE" });
WishlistItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

User.hasMany(CustomRequest, { foreignKey: { name: "userId", allowNull: false }, as: "customRequests" });
CustomRequest.belongsTo(User, { foreignKey: "userId", as: "user" });

// Saved addresses disappear with their user
User.hasMany(Address, { foreignKey: { name: "userId", allowNull: false }, as: "addresses", onDelete: "CASCADE" });
Address.belongsTo(User, { foreignKey: "userId", as: "user" });

export { User, Category, Product, Order, OrderItem, WishlistItem, CustomRequest, Address };
export default { User, Category, Product, Order, OrderItem, WishlistItem, CustomRequest, Address }
