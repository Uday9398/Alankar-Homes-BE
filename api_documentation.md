# Alankar Homes - API Documentation (v1)

This document contains all the currently implemented API endpoints in the backend repository (`Alankar-Homes-BE`).

- **Base URL**: `http://localhost:5000/api/v1`
- **Content-Type**: `application/json`

---

## Authentication Endpoints

### 1. Register User (`POST /register`)
Creates a new customer account.

*   **URL**: `/register`
*   **Method**: `POST`
*   **Access**: Public

#### Request Body
The request payload is validated using Joi. All fields are required.

| Field | Type | Rules | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Min 2, Max 100 characters. Trimmed. | Full name of the user |
| `email` | String | Valid email address format. Lowercased, trimmed. | User email (must be unique) |
| `phone` | String | Min 10, Max 15 characters. Trimmed. | User phone number |
| `password` | String | Min 8, Max 128 characters. | User password |
| `confirmPassword`| String | Must match `password` exactly. | Confirmation password |

**Example Request:**
```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "phone": "9876543210",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

#### Success Response
*   **Status Code**: `201 Created`
*   **Response Body**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```

#### Error Responses
*   **Status Code**: `400 Bad Request` (Validation Failed)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "confirmPassword",
      "message": "Passwords do not match"
    }
  ]
}
```
*   **Status Code**: `400 Bad Request` (Email already registered)
```json
{
  "success": false,
  "message": "Email is already registered"
}
```

---

### 2. Login User (`POST /login`)
Authenticates an existing user and returns a JSON Web Token (JWT).

*   **URL**: `/login`
*   **Method**: `POST`
*   **Access**: Public

#### Request Body
| Field | Type | Rules | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Valid email format. Lowercased, trimmed. Required. | User's registered email |
| `password` | String | Required. | User's password |

**Example Request:**
```json
{
  "email": "johndoe@example.com",
  "password": "Password123!"
}
```

#### Success Response
*   **Status Code**: `200 OK`
*   **Response Body**:
```json
{
  "success": true,
  "message": "Login Successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSw...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "johndoe@example.com",
      "phone": "9876543210",
      "role": "customer"
    }
  }
}
```

#### Error Responses
*   **Status Code**: `400 Bad Request` (Validation/Credential mismatch)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User Info (`GET /me`)
Retrieves the profile of the currently logged-in user.

*   **URL**: `/me`
*   **Method**: `GET`
*   **Access**: Protected (Requires valid Bearer Token)

#### Request Headers
| Header | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <JWT_TOKEN>` | Send the JWT token obtained from `/login` response |

#### Success Response
*   **Status Code**: `200 OK`
*   **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```

#### Error Responses
*   **Status Code**: `401 Unauthorized` (Token missing or malformed)
```json
{
  "success": false,
  "message": "Authentication token missing or invalid"
}
```
*   **Status Code**: `401 Unauthorized` (Token expired or signature invalid)
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "jwt expired"
}
```

---

## Shop Endpoints

All responses use the same `{ "success", "message", "data" }` shape as above. Validation errors return `400` with an `errors` array.

### Public (no token needed)

| Method | URL | Description |
| :--- | :--- | :--- |
| `GET` | `/categories` | All categories, each with a `productCount` of visible products |
| `GET` | `/products` | Visible products. Query: `search`, `category` (id), `featured=true`, `sort` (`newest` \| `price_asc` \| `price_desc` \| `name`), `page`, `limit` (max 100). Returns `{ products, pagination }` |
| `GET` | `/products/:id` | One visible product. Hidden or missing products return `404` |

### Customer (Bearer token)

| Method | URL | Description |
| :--- | :--- | :--- |
| `POST` | `/orders` | Place a cash-on-delivery order (body below). Prices are always taken from the database. Stock is checked and reduced in one transaction |
| `GET` | `/orders/my` | The signed-in customer's orders, newest first |
| `GET` | `/orders/:id` | One order. Customers only see their own (others return `404`), admins see any |
| `POST` | `/orders/:id/cancel` | Cancel your own order while it is still `pending`. Stock is restored |

**Place order body:**
```json
{
  "items": [{ "productId": 1, "quantity": 2 }],
  "shippingName": "Aditi Sharma",
  "shippingPhone": "9876543210",
  "shippingAddress": "12 MG Road, Banjara Hills",
  "shippingCity": "Hyderabad",
  "shippingState": "Telangana",
  "shippingPincode": "500034",
  "notes": "Please gift wrap"
}
```

### Admin (Bearer token of a user with `role: "admin"`, otherwise `403`)

| Method | URL | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/stats` | Dashboard numbers: sales, orders by status, low-stock products, recent orders |
| `GET` | `/admin/products` | All products including hidden ones (same query params as `/products`) |
| `GET` | `/admin/products/:id` | One product, including hidden |
| `POST` | `/admin/products` | Create. Body: `name`*, `price`*, `description`, `mrp`, `stock`, `images` (array of URLs), `categoryId`, `isFeatured`, `isActive` |
| `PUT` | `/admin/products/:id` | Update any of the fields above |
| `DELETE` | `/admin/products/:id` | Delete. Past orders keep their own copy of the name, price and image |
| `POST` | `/admin/uploads` | `multipart/form-data` with up to 8 `images` files (JPG/PNG/WEBP/GIF, 5 MB each). Returns an array of URLs like `/uploads/products/<file>.jpg` |
| `POST` | `/admin/categories` | Create. Body: `name`*, `description` |
| `PUT` | `/admin/categories/:id` | Update |
| `DELETE` | `/admin/categories/:id` | Delete. Its products stay in the shop without a category |
| `GET` | `/admin/orders` | All orders. Query: `status`, `page`, `limit` |
| `GET` | `/admin/orders/:id` | One order with customer details |
| `PATCH` | `/admin/orders/:id/status` | Body `{ "status": "confirmed" }`. One of `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`. Cancelling restores stock; cancelled orders cannot be changed |

Uploaded images are served from `http://localhost:5000/uploads/...` (outside `/api/v1`).

### Making someone an admin

Register the account on the website, then run:
```bash
npm run make-admin -- sister@example.com
```
The user must sign out and sign in again to see the **Admin** menu.

### Users (admin)

| Method | URL | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/users` | Registered users, newest first. Query: `search` (name, email or phone), `role` (`customer` \| `admin`), `page`, `limit`. Returns `{ users, summary: { totalUsers, admins, customers, newThisMonth }, pagination }`. Each user includes `orderCount` and `totalSpent`; passwords are never returned |
| `PATCH` | `/admin/users/:id/role` | Body `{ "role": "admin" }` or `{ "role": "customer" }`. Admins can't change their own role, and the last remaining admin can't be removed |

### Wishlist (customer, Bearer token)

| Method | URL | Description |
| :--- | :--- | :--- |
| `GET` | `/wishlist` | The signed-in user's saved products, most recently saved first. Hidden products are left out until they're shown again |
| `POST` | `/wishlist/:productId` | Save a product. Saving twice is harmless. `404` if the product doesn't exist or is hidden |
| `DELETE` | `/wishlist/:productId` | Remove a product from the wishlist |

Wishlist entries are deleted automatically when their user or product is deleted.
