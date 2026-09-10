# 💻 CivicConnect Client (Frontend)

The frontend for **CivicConnect** is a modern, responsive web application built with **React 19**, **Vite**, and **Tailwind CSS v4**. It features interactive map visualizations, data analytics dashboards, authentication management, real-time feedback, and full administrative controls.

---

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Maps**: [Leaflet](https://leafletjs.com/) & `react-leaflet`
- **Charts & Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Toast Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **HTTP Requests**: [Axios](https://axios-http.com/)

---

## 📁 Source Code Structure

```
client/src/
├── api/
│   └── axios.js            # Pre-configured Axios instance with auth interceptor
├── assets/                 # Images, logos, and static graphics
├── components/
│   ├── Badges.jsx          # Achievement badge rendering component
│   ├── IssueCard.jsx       # Card display component for issue items
│   ├── MapDashboard.jsx    # Leaflet interactive map with markers
│   ├── Navbar.jsx          # Top navigation bar with auth status & search
│   └── Skeleton.jsx        # Loading skeleton placeholers
├── context/
│   └── AuthContext.jsx     # User authentication state & token persistence
├── hooks/                  # Reusable custom React hooks
├── pages/
│   ├── AdminDashboard.jsx  # Admin management & issue resolution table
│   ├── Analytics.jsx       # Recharts data analytics & performance metrics
│   ├── Home.jsx            # Landing page with hero banner & issue feed
│   ├── IssueDetail.jsx     # Detailed view, upvotes, gallery & comments
│   ├── Login.jsx           # User authentication page
│   ├── MyIssues.jsx        # User-submitted issue tracker
│   ├── Register.jsx        # Account registration page
│   └── ReportIssue.jsx     # Issue creation form with map picker & Cloudinary upload
├── App.jsx                 # Routing configuration & global layout
└── main.jsx                # React app entry point
```

---

## 🛠️ Key Components & Pages

### 📄 Pages
1. **Home (`Home.jsx`)**: Displays public issues feed, search bar, category filtering, and quick stats.
2. **Report Issue (`ReportIssue.jsx`)**: Form allowing users to enter details, select location on interactive map, pick category, and upload images.
3. **Issue Detail (`IssueDetail.jsx`)**: In-depth view of a specific issue featuring upvoting, status badge, image lightbox, comments thread, and administrative update controls.
4. **My Issues (`MyIssues.jsx`)**: Personal history tracker showing status updates for user-reported problems.
5. **Admin Dashboard (`AdminDashboard.jsx`)**: Administrative panel for sorting, filtering, priority assignment, and status updates (`Open` -> `In Progress` -> `Resolved`).
6. **Analytics (`Analytics.jsx`)**: Charts showing resolution timelines, category breakdowns, and geographic distributions.

### 🧩 Components
- **`Navbar.jsx`**: Responsive navbar with profile dropdown, badge counter, and quick navigation links.
- **`MapDashboard.jsx`**: Interactive Leaflet map rendering color-coded pins based on issue status.
- **`IssueCard.jsx`**: Compact display card showing status badges, upvote counter, location tag, and image previews.
- **`Badges.jsx`**: Displays user activity badges (e.g., *Community Watcher*, *First Responder*, *Civic Hero*).

---

## ⚙️ Development & Scripts

In the `client/` directory:

| Script | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts Vite local development server (HMR enabled) |
| **Build** | `npm run build` | Bundles production assets into `dist/` |
| **Preview** | `npm run preview` | Serves local production build for testing |
| **Lint** | `npm run lint` | Runs ESLint for syntax and code quality checks |

---

## 🌐 API Communication

All backend communication goes through `src/api/axios.js`. Request headers automatically attach `Authorization: Bearer <token>` when a user is logged in.

Default Base URL: `http://localhost:5001/api` (or configured via environment variables).
