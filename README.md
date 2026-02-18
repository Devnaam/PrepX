# PrepX - Social Learning Platform for Government Exam Aspirants

<div align="center">


**Scroll. Learn. Succeed.**

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About The Project

**prepX** is a mobile-first Progressive Web App (PWA) that revolutionizes government exam preparation by combining:

- 📱 **TikTok-style scroll UX** - Infinite MCQ feed for addictive learning
- 🎓 **Social Learning** - Community posts, discussions, job updates
- 📊 **GitHub-style Gamification** - Activity graphs, streaks, badges
- 🏆 **Performance Tracking** - Detailed analytics and insights
- 👥 **Social Network** - Follow friends, share achievements

### Target Audience

Government exam aspirants in India preparing for:

- SSC (CGL, CHSL)
- Railways (NTPC, Group D)
- Banking (IBPS, SBI)
- State PSCs
- Defense & Teaching

---

## ✨ Features

### Core Features (MVP - Phase 1) ✅

#### 🎓 Learn Tab - MCQ Practice Feed

- Infinite scroll MCQ feed with TikTok-style UX
- Instant feedback with explanations
- Smart filtering by subject, topic, difficulty
- Adaptive learning algorithm
- Bulk question upload (CSV/JSON)

#### 📊 Stats & Analytics

- Today's performance summary
- Daily/Weekly/Monthly statistics
- Subject-wise breakdown
- Weak topic identification
- Progress tracking

#### 👤 Profile & Gamification

- User profiles with customization
- Streak tracking (current & longest)
- Badge system with auto-awarding
- Activity tracking
- Privacy controls

#### 🔐 Authentication & Security

- JWT-based authentication
- Secure password hashing (bcrypt)
- Role-based access control (User/Admin)
- Rate limiting & security headers

#### 👨‍💼 Admin Panel

- Dashboard with key metrics
- Question management (CRUD, approve, analytics)
- User management (ban/unban)
- Badge management
- Post moderation
- Bulk operations
- Analytics & reports

### Upcoming Features (Phase 2-4) 🚀

#### 🏠 Home Tab - Community Feed

- Text posts & discussions
- User-generated questions
- Job postings
- Achievement sharing
- Like, comment, save functionality
- Hashtag support

#### 🔍 Explore Tab - Social Discovery

- User search & suggestions
- Follow/Unfollow system
- Friend requests
- Top contributors leaderboard
- Trending hashtags & topics

#### 🔔 Notifications

- Real-time push notifications
- Badge achievement alerts
- Social interactions (likes, comments, follows)
- Daily reminders

#### 💰 Monetization (Phase 4)

- Premium features
- Ad integration
- Payment gateway (Razorpay)

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS 3
- **State Management:** Redux Toolkit, React Query
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios with interceptors
- **Icons:** Lucide React
- **Build Tool:** Vite

### Backend

- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4.x
- **Language:** TypeScript
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi
- **Security:** Helmet, express-rate-limit, CORS
- **File Upload:** Multer + Cloudinary SDK
- **Logging:** Winston, Morgan

### Database & Storage

- **Database:** MongoDB Atlas v6
- **ODM:** Mongoose 8.x
- **Media Storage:** Cloudinary
- **Caching:** Redis (future)

### DevOps & Tools

- **Version Control:** Git & GitHub
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database:** MongoDB Atlas
- **CDN:** Cloudinary
- **API Testing:** Postman

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account (for media storage)
- **Git**

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/prepx.git
cd prepx
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### 4. Set up Environment Variables

Create `.env` files in both `backend` and `frontend` directories.

**Backend `.env`:**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prepx
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**

```env
VITE_API_URL=http://localhost:5000/api/v1
```

#### 5. Run the Application

**Backend (Terminal 1):**

```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

**Frontend (Terminal 2):**

```bash
cd frontend
npm run dev
# App running on http://localhost:5173
```

#### 6. Create Admin User

Register a user via the UI, then manually update in MongoDB:

```javascript
// MongoDB Atlas or Compass
db.users.updateOne(
	{ email: "your-email@example.com" },
	{ $set: { isAdmin: true } },
);
```

Access admin panel at: `http://localhost:5173/admin`

---

## 🔧 Environment Variables

### Backend Environment Variables

| Variable                | Description                              | Required |
| ----------------------- | ---------------------------------------- | -------- |
| `NODE_ENV`              | Environment (development/production)     | ✅       |
| `PORT`                  | Server port                              | ✅       |
| `MONGODB_URI`           | MongoDB connection string                | ✅       |
| `JWT_SECRET`            | Secret key for JWT tokens (min 32 chars) | ✅       |
| `JWT_EXPIRE`            | JWT expiration time (e.g., 7d)           | ✅       |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                    | ✅       |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                       | ✅       |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                    | ✅       |
| `FRONTEND_URL`          | Frontend URL for CORS                    | ✅       |

### Frontend Environment Variables

| Variable       | Description          | Required |
| -------------- | -------------------- | -------- |
| `VITE_API_URL` | Backend API base URL | ✅       |

---

## 📖 Usage

### For Students

1. **Register/Login** to your account
2. **Learn Tab** - Scroll through MCQs, tap to answer
3. **Stats Tab** - Track your daily/weekly progress
4. **Profile Tab** - View your streak, badges, and achievements
5. **Customize** - Set your target exam, update profile

### For Admins

1. Login with admin credentials
2. Access `/admin` route
3. **Dashboard** - View platform statistics
4. **Questions** - Manage, approve, create questions
5. **Users** - Manage users, ban/unban
6. **Badges** - Create and award badges
7. **Posts** - Moderate community content
8. **Bulk Upload** - Upload questions via CSV/JSON

---

## 📚 API Documentation

### Base URL

```
Development: http://localhost:5000/api/v1
Production:  https://your-backend.onrender.com/api/v1
```

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password@123",
  "fullName": "John Doe"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password@123"
}
```

#### Get Current User

```http
GET /auth/me
Authorization: Bearer {token}
```

### Question Endpoints

#### Get MCQ Feed

```http
GET /questions/feed?limit=20&skip=0&subject=GENERAL_KNOWLEDGE&difficulty=EASY
Authorization: Bearer {token}
```

#### Submit Answer

```http
POST /questions/:id/attempt
Authorization: Bearer {token}
Content-Type: application/json

{
  "selectedOptionIndex": 2,
  "timeTaken": 15
}
```

### Admin Endpoints

All admin endpoints require admin privileges.

#### Get Dashboard Stats

```http
GET /admin/dashboard
Authorization: Bearer {admin_token}
```

#### Bulk Upload Questions

```http
POST /admin/questions/bulk-upload
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

file: questions.csv
```

#### Download Template

```http
GET /admin/questions/template?format=csv
Authorization: Bearer {admin_token}
```

> **Full API Documentation:** [View Complete API Docs](./docs/API.md)

---

## 📁 Project Structure

```
prepx/
│
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript types
│   │   └── server.ts         # Entry point
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   ├── icons/            # PWA icons
│   │   └── manifest.json     # PWA manifest
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── common/       # Buttons, Inputs, Modals
│   │   │   ├── layout/       # Navbar, Sidebar
│   │   │   ├── admin/        # Admin components
│   │   │   └── learn/        # MCQ components
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── learn/        # Learn feed
│   │   │   ├── stats/        # Statistics
│   │   │   ├── profile/      # User profile
│   │   │   └── admin/        # Admin pages
│   │   ├── services/         # API services
│   │   ├── store/            # Redux store
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript types
│   │   ├── constants/        # Constants
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docs/                     # Documentation
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🌐 Deployment

### Backend Deployment (Render)

1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect repository
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add environment variables
6. Deploy

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Configure:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables
5. Deploy

### MongoDB Atlas Setup

1. Create cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist IPs (0.0.0.0/0 for production)
3. Create database user
4. Get connection string
5. Add to environment variables

> **Detailed Deployment Guide:** [View Deployment Docs](./docs/DEPLOYMENT.md)

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

### How to Contribute

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

### Code Style

- **TypeScript:** Use strict mode
- **ESLint:** Follow project ESLint config
- **Prettier:** Format code before committing
- **Naming:** Use camelCase for variables, PascalCase for components

---

## Issues

Found a bug or have a feature request? [Open an issue](https://github.com/yourusername/prepx/issues)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Contact

**Developer:** Your Name

- Email: workwithdevnaam@gmail.com
- LinkedIn: https://www.linkedin.com/in/raj-priyadershi-56a256282/
- GitHub: github.com/devnaam

**Project Link:** [https://github.com/devnaam/prepx](https://github.com/Devnaam/PrepX)

---

## 🙏 Acknowledgments

- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [Cloudinary](https://cloudinary.com/)
- [Lucide Icons](https://lucide.dev/)
- Government Exam Aspirants Community

---

<div align="center">

**Built with ❤️ for Government Exam Aspirants**

⭐ Star this repo if you find it helpful!

</div>
```

---

## **Additional Files to Create:**

### **1. LICENSE** (MIT License)

Create `LICENSE` file:

```
MIT License

Copyright (c) 2026 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### **2. .gitignore** (Project Root)

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment Variables
.env
.env.local
.env.development
.env.production

# Production
/backend/dist
/frontend/dist
/frontend/build

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/

# Misc
.cache/
```

---

### **3. CONTRIBUTING.md** (Optional)

```markdown
# Contributing to prepX

Thank you for considering contributing to prepX! 🎉

## How to Contribute

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Code Style

- Use TypeScript
- Follow ESLint configuration
- Format with Prettier
- Write meaningful commit messages

## Reporting Bugs

Open an issue with:

- Bug description
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## Feature Requests

Open an issue with:

- Feature description
- Use case
- Why it would be useful

Thank you! ❤️
```

---

