# ServeEase 🚀

**ServeEase** is a modern, full-stack, on-demand service marketplace platform. It connects end-users who need household services (like Plumbing, Cleaning, or Repairs) with registered "Captains" (Service Providers) in real-time, functioning similarly to apps like Uber or Rapido.

The platform is designed with a premium **Glassmorphism** UI, robust role-based access control, AI enhancements, and real-time Socket.io integrations to provide an exceptional, startup-level user experience.

---

## 🌟 Key Features & Recent Updates

### 🤖 AI Assistant (New!)
- **Gemini-Powered Chatbot:** A fully integrated AI assistant (MedRAGnosis / ServeEase AI) on the User Dashboard that helps users find the right services based on natural language queries (e.g., "My sink is leaking").
- **Smart Analytics:** Real-time visual growth rates and metrics powered by `recharts`.

### 👤 User Features
- **Profile Management:** Edit profile details and add phone numbers for direct communication.
- **Interactive Map Booking:** Integrated Leaflet maps allow users to drop a pin on their exact location to request a service.
- **Live Status Tracking:** Real-time Socket.io updates for booking statuses (`Requested` → `Accepted` → `In Progress` → `Completed`).
- **Rating System:** Users can leave a 5-star rating for their Captain, instantly reflecting on the Captain's tracking profile.

### 👨‍🔧 Captain (Service Provider) Features
- **Strict Approval Gateway:** Captains must be explicitly approved by an Admin before accessing jobs.
- **Live Broadcasting:** Instantly receive new job requests via WebSockets with dynamic map routing.
- **Dashboard Ratings:** Captains can view their real-time aggregate ratings and manage their profiles.

### 🛡️ Admin Dashboard
- **Graphical Analytics:** Real-time Recharts visualization of Company Growth and Booking Volumes.
- **Full Roster Control:** View and manage all Users and Captains in the ecosystem. Approve or revoke Captain statuses on the fly.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js + Vite
- **Styling:** Tailwind CSS v4 (Glassmorphism design, Dark Mode)
- **State Management:** Redux Toolkit
- **Animations / Charts:** Framer Motion, Recharts
- **Maps:** React-Leaflet (OpenStreetMap)

### Backend
- **Environment:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT, bcrypt
- **Real-Time:** Socket.io
- **AI Integration:** Google GenAI API (`@google/genai`)

---

## 🚀 One-Click Setup & Run

We've made running the project as simple as double-clicking a script! All dependency requirements are handled automatically.

### Requirements
- **Node.js** installed on your system.
- **MongoDB Atlas URI** (or local MongoDB).
- **Gemini API Key** (for AI Assistant).

### For Windows Users 🪟
Simply double-click the `run.bat` file in the root directory!
Alternatively, from the command prompt:
```cmd
run.bat
```
*This will automatically install frontend & backend dependencies in the background and launch two new command windows starting your servers.*

### For Mac / Linux Users 🍎
Make the bash script executable and run it:
```bash
chmod +x run.sh
./run.sh
```

### Manual Configuration (.env)
Ensure your `backend/.env` file is properly configured. A sample configuration:
```env
NODE_ENV=development
PORT=8000
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=supersecretjwtkey123
JWT_EXPIRE=30d
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 💡 How to Test Locally

1. **Start the project** using `run.bat` or `./run.sh` (Backend runs on `http://localhost:8000`, Frontend on `http://localhost:5173`).
2. **Open two browser windows** (or one normal and one Incognito).
3. **Register a Captain** in window 1.
4. **Log in as Admin** in window 2 to approve the Captain from the Dashboard.
5. **Register a User** and request a service on the interactive map.
6. Watch the request instantly pop up on the Captain's dashboard, track them in real-time, and leave a review once completed!

---

*Built with ❤️ by the ServeEase Team.*
