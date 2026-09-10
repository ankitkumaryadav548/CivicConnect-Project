# 🏙️ CivicConnect - Community Issue Tracker

> A modern, full-stack web application empowering citizens to report, track, and resolve local municipal issues while providing administrators with real-time analytics and management tools.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Variables](#environment-variables)
  - [Database Seeding & Demo Setup](#database-seeding--demo-setup)
- [API Endpoints](#-api-endpoints)
- [User Roles & Permissions](#-user-roles--permissions)
- [Screenshots & UI Workflow](#-screenshots--ui-workflow)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**CivicConnect** bridges the gap between community members and local administrators. Citizens can report infrastructure and environmental issues—such as broken streetlights, water leakages, potholes, and uncollected waste—with precise geographic coordinates and photographic evidence. 

Administrators gain access to a centralized dashboard where they can update issue statuses, set priority levels, monitor real-time resolution metrics, and analyze community trends.

---

## ✨ Key Features

### 👤 Citizen Capabilities
- **Location-Based Issue Reporting**: Geolocate issues manually or using interactive maps, attach images via Cloudinary, and select relevant categories.
- **Interactive Community Map**: View reported issues pinned on an interactive Leaflet map with custom markers indicating status.
- **Upvoting & Prioritization**: Upvote issues to highlight high-priority community concerns.
- **Real-Time Comments & Discussion**: Participate in conversations on reported issues for progress updates and community feedback.
- **Personal Dashboard**: Track the status and history of all user-submitted reports.
- **Gamification & Achievement Badges**: Earn badges based on community contributions and activity levels.

### 🛡️ Administrative Tools
- **Centralized Admin Dashboard**: Filter, search, and manage all submitted issues across categories and urgency levels.
- **Status & Priority Management**: Update issue states (`Open`, `In Progress`, `Resolved`) and assign priority levels (`Low`, `Medium`, `High`, `Urgent`).
- **Interactive Analytics**: Access data visualization dashboards powered by Recharts showing category distribution, monthly trends, and resolution performance.
- **Content Moderation**: Delete invalid or duplicate reports.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Mapping**: [Leaflet](https://leafletjs.com/) + React-Leaflet
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with [Mongoose ORM](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs`
- **File Uploads**: [Multer](https://github.com/expressjs/multer) + [Cloudinary API](https://cloudinary.com/)
- **CORS & Middleware**: Express CORS middleware and custom auth guards

---

## 📁 Project Architecture

```
Community Issue Tracker/
├── client/                   # React Frontend (Vite)
│   ├── public/               # Static assets & icons
│   ├── src/
│   │   ├── api/              # Axios instance & interceptors
│   │   ├── components/       # Reusable UI components (Navbar, IssueCard, Map, Badges, Skeleton)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # View pages (Home, ReportIssue, IssueDetail, AdminDashboard, Analytics, MyIssues)
│   │   ├── App.jsx           # Application routing & layout
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── server/                   # Express Backend & API
    ├── config/               # Database & Cloudinary configurations
    ├── controllers/          # Business logic (authController, issueController, commentController)
    ├── middleware/           # Auth validation middleware
    ├── models/               # Mongoose Schemas (User, Issue, Comment)
    ├── routes/               # Express API routes
    ├── createAdmin.js        # Script to instantiate demo administrator account
    ├── seed.js               # Database seeding script with sample data
    ├── server.js             # Express server entry point
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher)
- **MongoDB** instance (Local or MongoDB Atlas cluster)
- **Cloudinary Account** (for image upload functionality)

---

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/ankitkumaryadav548/CivicConnect-Project.git
cd CivicConnect-Project
```

#### 2. Backend Setup
Navigate to the `server` folder, install dependencies, and setup environment variables:

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/civicconnect?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server in development mode:
```bash
npm run dev
```
The API server will run at `http://localhost:5001`.

---

#### 3. Database Seeding & Demo Admin Creation

Run the seed script to populate MongoDB with initial community issues:
```bash
node seed.js
```

Run the admin creation script to generate default administrator credentials:
```bash
node createAdmin.js
```

> **Default Demo Admin Credentials:**
> - **Email**: `admin@example.com`
> - **Password**: `admin123`

---

#### 4. Frontend Setup
Open a new terminal, navigate to the `client` directory, install dependencies, and launch Vite dev server:

```bash
cd client
npm install
npm run dev
```
The React frontend will be available at `http://localhost:5173`.

---

## 📡 API Endpoints

| Category | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Register a new user account |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user and return JWT |
| **Auth** | `GET` | `/api/auth/me` | Private | Get current authenticated user details |
| **Issues** | `GET` | `/api/issues` | Public | Fetch all issues (supports category/status filters & search) |
| **Issues** | `GET` | `/api/issues/:id` | Public | Get single issue details by ID |
| **Issues** | `POST` | `/api/issues` | Private | Create a new issue report (with optional image upload) |
| **Issues** | `PUT` | `/api/issues/:id` | Admin | Update issue status, priority, or assigned handler |
| **Issues** | `DELETE` | `/api/issues/:id` | Admin | Delete an issue report |
| **Issues** | `PUT` | `/api/issues/:id/upvote` | Private | Upvote or remove upvote from an issue |
| **Comments**| `GET` | `/api/comments/:issueId` | Public | Fetch all comments for a specific issue |
| **Comments**| `POST` | `/api/comments/:issueId` | Private | Add a comment to an issue |

---

## 🔐 User Roles & Permissions

| Feature / Action | Citizen | Admin |
| :--- | :---: | :---: |
| Browse & Search Public Issues | ✅ | ✅ |
| View Geolocation Map & Analytics | ✅ | ✅ |
| Report New Civic Issues | ✅ | ✅ |
| Upvote & Comment on Issues | ✅ | ✅ |
| Track Personal Submissions | ✅ | ✅ |
| Change Issue Resolution Status | ❌ | ✅ |
| Assign Urgency & Priority Levels | ❌ | ✅ |
| Delete Reports / Moderation | ❌ | ✅ |
| Access Admin Dashboard | ❌ | ✅ |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
