# ServeEase 🚀

**ServeEase** is a modern, full-stack, on-demand service marketplace platform. It connects end-users who need household services (like Plumbing, Cleaning, or Repairs) with registered "Captains" (Service Providers) in real-time, functioning similarly to apps like Uber or Rapido.

The platform is designed with a premium **Glassmorphism** UI, robust role-based access control, and real-time Socket.io integrations to provide an exceptional, startup-level user experience.

---

## 🌟 Key Features

### 👤 User Features
- **Browse Services:** Users can view available services with base pricing.
- **Interactive Map Booking:** Integrated Leaflet maps allow users to drop a pin on their exact location to request a service.
- **Live Status Tracking:** Real-time Socket.io updates for booking statuses (`Requested` → `Accepted` → `In Progress` → `Completed`).
- **Checkout Flow:** Simulated mock payment system upon service completion.

### 👨‍🔧 Captain (Service Provider) Features
- **Availability Toggle:** Go "online" or "offline" to receive live broadcasts of service requests.
- **Live Broadcasting:** Instantly receive new job requests that match the Captain's registered service type via WebSockets.
- **Booking Management:** Accept requests, start work, and mark jobs as completed.

### 🛡️ Admin Dashboard
- **Analytics Overview:** View top-level platform statistics (Total Users, Captains, Bookings, and Revenue).
- **Captain Roster:** Review registered Captains and toggle their "Approved" status to control who can accept jobs on the platform.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js + Vite
- **Styling:** Tailwind CSS v4 (Glassmorphism design, Dark Mode)
- **State Management:** Redux Toolkit
- **Animations:** Framer Motion
- **Maps:** React-Leaflet (OpenStreetMap)
- **API Calls:** Axios

### Backend
- **Environment:** Node.js + Express.js
- **Database:** MongoDB + Mongoose (Atlas URI supported)
- **Architecture:** Clean Architecture (Routes → Controllers → Models → Middleware)
- **Authentication:** JWT stored in HTTP-Only Cookies, bcrypt for password hashing
- **Real-Time:** Socket.io

---

## 📂 Project Structure

```text
ServeEase/
├── backend/
│   ├── src/
│   │   ├── config/        # DB & Env configurations
│   │   ├── controllers/   # Request handlers (Auth, Admin, Bookings, Services)
│   │   ├── middlewares/   # JWT protection and Role validation
│   │   ├── models/        # Mongoose Schemas
│   │   ├── routes/        # Express route definitions
│   │   ├── utils/         # Helpers (e.g., JWT generator)
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # Server entry point & Socket.io init
│   ├── seed.js            # Script to seed default services
│   ├── seedAdmin.js       # Script to seed the default Admin user
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI components (Navbar, GlassCard)
    │   ├── pages/         # Core views (Home, Login, Register, Dashboards)
    │   ├── services/      # Axios API instances
    │   ├── store/         # Redux store and slices
    │   ├── App.jsx        # React Router configuration
    │   └── main.jsx       # React entry point
    ├── index.css          # Tailwind imports and Glassmorphism utilities
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine
- MongoDB Atlas URI (or local MongoDB instance)

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_uri_here
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=30d
   ```
4. **Seed the database:**
   To populate the database with default services (Plumbing, Cleaning, etc.):
   ```bash
   node seed.js
   ```
   To create the default Admin account (`admin@serveease.com` / `password123`):
   ```bash
   node seedAdmin.js
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The application will be available at `http://localhost:5173`.

---

## 💡 How to Test Locally

1. **Start both servers** (Backend on port 5000, Frontend on port 5173).
2. **Open two different browsers** (or one normal and one Incognito window).
3. **Register a Captain** in window 1, selecting "Plumbing" as the service. Set availability to ON.
4. **Register a User** in window 2. 
5. In the User Dashboard, click on the map, select "Plumbing", and click "Request Now".
6. Watch the request instantly pop up on the Captain's dashboard in window 1! 
7. The Captain can click "Accept", "Start Work", and "Complete", and the User's dashboard will reflect these status changes in real-time.
8. Log in as an **Admin** (`admin@serveease.com`) to view the overall platform stats and manage the Captain you just registered.

---

*Built with ❤️ by the ServeEase Team.*
