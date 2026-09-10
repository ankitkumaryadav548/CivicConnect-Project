# ⚙️ CivicConnect Server (Backend API)

The backend for **CivicConnect** is built with **Node.js**, **Express.js**, and **MongoDB Atlas** using **Mongoose ORM**. It handles user authentication, issue management, image uploads via Cloudinary, commenting system, upvoting functionality, and role-based access control (RBAC).

---

## 🛠️ Tech Stack & Dependencies

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js v5](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with [Mongoose v9](https://mongoosejs.com/)
- **Authentication**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Media Storage**: [Cloudinary](https://cloudinary.com/) with `multer` & `multer-storage-cloudinary`
- **Environment Management**: [dotenv](https://github.com/motdotla/dotenv)
- **CORS**: `cors` package

---

## 📁 Directory Architecture

```
server/
├── config/
│   ├── db.js                 # MongoDB connection setup
│   └── cloudinary.js         # Cloudinary configuration & Multer storage engine
├── controllers/
│   ├── authController.js     # User registration, login & profile retrieval logic
│   ├── commentController.js  # Add and fetch comments for issues
│   └── issueController.js    # Issue CRUD, upvotes, filters & admin actions
├── middleware/
│   └── auth.js               # JWT verification & role authorization (Admin guard)
├── models/
│   ├── Comment.js            # Comment Mongoose Schema
│   ├── Issue.js              # Issue Mongoose Schema
│   └── User.js               # User Mongoose Schema
├── routes/
│   ├── auth.js               # Authentication routes (`/api/auth`)
│   ├── comments.js           # Comment routes (`/api/comments`)
│   └── issues.js             # Issue management routes (`/api/issues`)
├── createAdmin.js            # Script to create or upgrade a demo admin account
├── seed.js                   # Script to populate MongoDB with initial sample issues
├── server.js                 # Primary Express app entry point
└── verify.js                 # System verification & connectivity script
```

---

## 🗄️ Database Schemas

### 1. User Schema (`models/User.js`)
- `name` (String, Required)
- `email` (String, Required, Unique)
- `password` (String, Required, Encrypted with bcrypt)
- `role` (String, Enum: `['citizen', 'admin']`, Default: `'citizen'`)
- `avatar` (String)
- `upvotedIssues` (Array of Issue ObjectIDs)

### 2. Issue Schema (`models/Issue.js`)
- `title` (String, Required)
- `description` (String, Required)
- `category` (String, Enum: `['pothole', 'street light', 'trash', 'water', 'electricity', 'road', 'sanitation', 'other']`)
- `location` (String, Required)
- `latitude` / `longitude` (Number)
- `status` (String, Enum: `['open', 'in_progress', 'resolved']`, Default: `'open'`)
- `priority` (String, Enum: `['low', 'medium', 'high', 'urgent']`, Default: `'medium'`)
- `images` (Array of Strings / Cloudinary URLs)
- `reporter` (Ref to User Schema)
- `upvotes` (Number, Default: 0)
- `upvotedBy` (Array of User ObjectIDs)
- `assignedTo` (String / Handler)

### 3. Comment Schema (`models/Comment.js`)
- `issue` (Ref to Issue Schema)
- `user` (Ref to User Schema)
- `content` (String, Required)

---

## 🔌 API Endpoints Reference

### Auth Routes (`/api/auth`)
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Validate credentials and receive JWT.
- `GET /api/auth/me`: Get profile details for authenticated user.

### Issue Routes (`/api/issues`)
- `GET /api/issues`: List all issues with optional filtering by status, category, search query, or sorting.
- `GET /api/issues/:id`: Get detailed issue report by ID.
- `POST /api/issues`: Create new issue report (supports multipart/form-data image upload).
- `PUT /api/issues/:id`: Update issue status, priority, or details (Admin restricted).
- `DELETE /api/issues/:id`: Remove issue report (Admin restricted).
- `PUT /api/issues/:id/upvote`: Toggle upvote status for authenticated user.

### Comment Routes (`/api/comments`)
- `GET /api/comments/:issueId`: Retrieve all comments associated with an issue.
- `POST /api/comments/:issueId`: Add a new comment to an issue.

---

## 🔑 Environment Configuration (`.env`)

Create a `.env` file in the `server/` root:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname
JWT_SECRET=super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## ⚙️ Utility Scripts

- **Start Development Server**:
  ```bash
  npm run dev
  ```
- **Start Production Server**:
  ```bash
  npm start
  ```
- **Seed Initial Database Content**:
  ```bash
  node seed.js
  ```
- **Generate Demo Admin Account**:
  ```bash
  node createAdmin.js
  ```
- **Verify Configuration & Services**:
  ```bash
  node verify.js
  ```
