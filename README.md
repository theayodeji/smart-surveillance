# Smart Surveillance System Documentation

---

## Introduction

### 1.1 Purpose
The Smart Surveillance System is designed to provide real-time monitoring, event logging, and secure access control for surveillance environments. It enables users to view, filter, and manage events (such as detected activities or uploaded images) through a modern web interface, with a robust backend for authentication, storage, and API services.

### 1.2 Scope
This documentation covers the architecture, installation, configuration, and initial usage of the Smart Surveillance System, including both backend (API, database, authentication) and frontend (React-based dashboard) components. It is intended to serve as a comprehensive reference for developers, maintainers, and system integrators.

### 1.3 Audience
- Backend and frontend developers
- DevOps and system administrators
- QA engineers
- Technical support staff
- Security analysts

---

## System Overview

### 2.1 Architecture
The system is built with a modular architecture, consisting of:
- **Frontend**: A React application (bootstrapped with Vite) for user interaction, authentication, and visualization of surveillance events.
- **Backend**: An Express.js REST API providing authentication, event management, and integration with external services (e.g., Cloudinary for image storage).
- **Database**: MongoDB, managed via Mongoose ODM, storing users and event logs.
- **External Integrations**: Cloudinary for media storage, and optional email services via Nodemailer.

#### High-Level Flow
1. **User** accesses the frontend dashboard, authenticates, and interacts with event data.
2. **Frontend** communicates with the backend API for all data operations (event CRUD, authentication, etc.).
3. **Backend** handles business logic, authentication (JWT-based), and database access.
4. **Media files** (e.g., images) are stored externally (Cloudinary), with URLs referenced in the database.

### 2.2 Technologies Used
- **Frontend**: React 19, Vite, Tailwind CSS, React Router DOM, Zustand, Lucide React, Axios, Date-fns
- **Backend**: Node.js, Express.js, Mongoose, MongoDB, JWT, BcryptJS, Cloudinary, Nodemailer, CORS, Dotenv
- **Dev Tools**: ESLint, PostCSS, Vite, Nodemon

### 2.3 Dependencies
#### Backend (from `backend/package.json`):
- express
- mongoose
- dotenv
- cors
- cookie-parser
- jsonwebtoken
- bcryptjs
- cloudinary
- nodemailer
- nodemon (dev)

#### Frontend (from `frontend/package.json`):
- react
- react-dom
- react-router-dom
- axios
- zustand
- date-fns
- lucide-react
- react-datepicker
- @tailwindcss/vite
- tailwindcss
- vite
- eslint and related plugins (dev)

---

## Installation Guide

### 3.1 Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB** instance (local or cloud)
- **Cloudinary** account (for media storage)

### 3.2 System Requirements
- Minimum 2 CPU cores, 2GB RAM (for development)
- Network access to MongoDB and Cloudinary
- Modern web browser (for frontend)

### 3.3 Installation Steps
#### 1. Clone the Repository
```sh
git clone <repo_url>
cd smart-surveillance
```

#### 2. Backend Setup
```sh
cd backend
npm install
```

#### 3. Frontend Setup
```sh
cd ../frontend
npm install
```

#### 4. Environment Variables
- Copy `.env.example` (if available) or create a `.env` file in the `backend/` directory with the following variables:
  - `MONGO_URI` - MongoDB connection string
  - `JWT_SECRET` - Secret for JWT signing
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Cloudinary credentials
  - (Optional) Email configuration for Nodemailer

#### 5. Start the Backend
```sh
npm run dev
```
(Default port: 5000)

#### 6. Start the Frontend
```sh
cd ../frontend
npm run dev
```
(Default port: 5173)

---

## Configuration Guide

### 4.1 Configuration Parameters
- **MongoDB**: Set `MONGO_URI` in `backend/.env`.
- **JWT Secret**: Set `JWT_SECRET` in `backend/.env`.
- **Cloudinary**: Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `backend/.env`.
- **Frontend API URL**: The frontend expects the backend at `http://localhost:5000` (configurable in code or via proxy).

### 4.2 Environment Setup
- **Development**: Use `.env` in `backend/` for local secrets.
- **Production**: Use environment variables or a secure secret manager.
- **CORS**: By default, backend allows requests from `http://localhost:5173`.

### 4.3 External Services Integration
- **Cloudinary**: Used for storing images uploaded as part of event logs. Ensure credentials are correct.
- **Nodemailer**: (Optional) Configure SMTP/email provider in `.env` if email features are used.

---

## Usage Guide

### 5.1 User Interface Overview
- **Login/Signup**: Users authenticate via the login or signup page. Authentication is JWT-based.
- **Dashboard**: After login, users land on the dashboard, which displays a list of surveillance events (with images, timestamps, and details).
- **Event Details**: Clicking an event shows its image and metadata. Users can filter events by date/time and delete events.
- **Navigation**: The UI is responsive and adapts for mobile devices.

### 5.2 User Authentication
- **Registration**: New users register with a username and password (and optionally email).
- **Login**: Existing users enter credentials to receive a JWT token, stored in local storage.
- **Protected Routes**: Dashboard and sensitive pages are protected by route guards (frontend) and JWT validation (backend).

### 5.3 Core Functionality
- **Event Log Viewing**: Users can view all surveillance events with images and timestamps.
- **Filtering**: Filter events by date, time, or preset ranges (today, this week, etc.).
- **Event Details**: View detailed info and image for each event.
- **Event Deletion**: Delete events from the dashboard (with confirmation prompt).

### 5.4 Advanced Features
- **Cloudinary Integration**: Images are stored in Cloudinary and referenced by URL.
- **Responsive Design**: UI adapts to desktop and mobile.
- **Date/Time Picker**: Custom date/time picker for filtering events.

### 5.5 Troubleshooting
- **Login Issues**: Ensure backend is running and correct API URL is set.
- **Database Errors**: Check MongoDB connection string and server status.
- **Image Upload Issues**: Verify Cloudinary credentials and API limits.

---

## API Documentation

### 6.1 Endpoints
**Auth**
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT token

**Events**
- `GET /api/events/logs` — Get all event logs
- `GET /api/events/logs/:id` — Get a single event by ID
- `DELETE /api/events/:id` — Delete an event

### 6.2 Request and Response Formats
- **All endpoints** accept and return JSON.
- **Authentication**: Send JWT token as `Authorization: Bearer <token>` in headers for protected routes.

**Example: Register**
```json
POST /api/auth/register
{
  "username": "testuser",
  "password": "password123"
}
```

**Example: Event Log**
```json
GET /api/events/logs
Response: [
  {
    "_id": "...",
    "imageUrl": "https://...",
    "timestamp": "2025-08-08T12:00:00.000Z"
  }
]
```

### 6.3 Authentication and Authorization
- **JWT**: All protected endpoints require a valid JWT token.
- **Role-based access**: (If implemented) Only admins can delete events; regular users can view.

---

## Database Schema

### 7.1 Entity-Relationship Diagram
- **User** (username, passwordHash, role)
- **Event** (imageUrl, timestamp)
- **Relationships**: (Basic) Events are not directly linked to users (can be extended).

### 7.2 Table Definitions
- **User**
  - `_id`: ObjectId
  - `username`: String, unique, required
  - `password`: String (hashed)
  - `role`: String (default: 'user')
- **Event**
  - `_id`: ObjectId
  - `imageUrl`: String, required
  - `timestamp`: Date, required

### 7.3 Relationships and Constraints
- **Unique**: `username` in User is unique.
- **Required**: `imageUrl` and `timestamp` in Event are required.
- **Referential Integrity**: No foreign key constraints by default; can be extended for user-event linkage.

---

## Testing

### 8.1 Test Plan
- **Unit Testing**: (To be implemented) Test core backend logic (authentication, CRUD operations).
- **Integration Testing**: (To be implemented) Test API endpoints end-to-end.
- **Frontend Testing**: (To be implemented) Test UI components and flows.

### 8.2 Test Cases
- **User Registration/Login**: Register and login with valid/invalid credentials.
- **Event CRUD**: Fetch, view, and delete events.
- **Authentication**: Access protected endpoints with/without valid JWT.

### 8.3 Test Results
- **Manual Testing**: Core flows have been manually tested in development.
- **Automated Testing**: (To be implemented) Add tests using Jest, React Testing Library, or similar.

---


## Deployment

### 9.1 Deployment Process
- **Production Build (Frontend)**:
  - Run `npm run build` in the `frontend/` directory to generate static assets in the `dist/` folder.
  - Deploy the contents of `dist/` to your preferred static host (e.g., Netlify, Vercel, S3).
- **Backend Deployment**:
  - Ensure environment variables are set (see Configuration Guide).
  - Run `npm run start` in the `backend/` directory to launch the server.
  - Use a process manager (e.g., PM2) for production uptime.
  - Reverse proxy (e.g., Nginx) recommended for HTTPS and routing.
- **Environment**:
  - Set `NODE_ENV=production` for production deployments.
  - Use secure secrets management for all credentials.

### 9.2 Release Notes
- **v1.0.0**: Initial release with authentication, event logging, filtering, deletion, and Cloudinary integration.

### 9.3 Known Issues and Limitations
- No user management UI (admin actions via DB only).
- No password reset or email verification flows.
- No automated test suite yet.
- Events are not linked to users (can be extended).

---

## Support and Maintenance

### 10.1 Troubleshooting Guide
- **Server Not Starting**: Check `.env` file and MongoDB/Cloudinary connectivity.
- **Frontend Not Loading**: Ensure backend is running and CORS is configured.
- **API Errors**: Inspect backend logs for stack traces.
- **Deployment Issues**: Verify environment variables and network/firewall settings.

### 10.2 Frequently Asked Questions (FAQs)
- **Q: Can I use a remote MongoDB instance?**
  - A: Yes, set `MONGO_URI` in `.env` accordingly.
- **Q: How do I add an admin user?**
  - A: Insert a user with `role: "admin"` directly in MongoDB.
- **Q: Can I use my own image storage?**
  - A: Yes, but you must update the backend integration code.

### 10.3 Contact Information
- **Maintainer**: [Your Name / Team]
- **Support Email**: [support@example.com]
- **Issue Tracker**: [GitHub Issues URL]

---

## Change Log

### 11.1 Version History
- **v1.0.0** — 2025-08-08: Initial public release.

### 11.2 Change Summary
- Initial implementation of all major features: authentication, event CRUD, filtering, Cloudinary integration, and dashboard UI.

---

## Glossary

### 12.1 Terms and Definitions
- **JWT**: JSON Web Token, used for stateless authentication.
- **CRUD**: Create, Read, Update, Delete operations on resources.
- **ODM**: Object Document Mapper (e.g., Mongoose for MongoDB).
- **CORS**: Cross-Origin Resource Sharing, browser security feature.
- **PM2**: Process manager for Node.js applications.
- **Cloudinary**: Cloud-based image and video management service.
- **Nodemailer**: Node.js module for sending emails.
- **Vite**: Frontend build tool for fast React development.
- **React Router**: Library for routing in React apps.
- **Zustand**: State management library for React.

---

