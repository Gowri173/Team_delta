# ServeEase Requirements

This project uses Node.js and npm for package management. Below are the core dependencies for both the frontend and backend.

## System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: A local instance or MongoDB Atlas cluster

## Backend Dependencies
Navigate to the `backend/` directory and run `npm install`.

Core packages:
- `express`: Web framework
- `mongoose`: MongoDB object modeling
- `socket.io`: Real-time bidirectional event-based communication
- `jsonwebtoken`: Authentication
- `bcryptjs`: Password hashing
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variable management
- `@google/genai`: Google Gemini AI integration

## Frontend Dependencies
Navigate to the `frontend/` directory and run `npm install`.

Core packages:
- `react` & `react-dom`: UI Library
- `react-router-dom`: Routing
- `react-redux` & `@reduxjs/toolkit`: State management
- `axios`: HTTP client
- `socket.io-client`: WebSocket client
- `react-leaflet` & `leaflet`: Interactive maps
- `framer-motion`: Animations
- `recharts`: Data visualization and charts
- `tailwindcss` & `@tailwindcss/vite`: Utility-first CSS framework
- `react-icons`: SVG Icons
- `react-toastify`: Notifications

## Installation Command
To install all requirements at once (using Bash/PowerShell from the root directory):

```bash
cd backend && npm install && cd ../frontend && npm install
```
