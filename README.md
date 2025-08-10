# 💬 Lets Chat – Real-Time Messaging App

**Lets Chat** is a full-stack real-time chat application built with **Next.js** on the frontend and **Express.js** on the backend. It uses **WebSockets (Socket.io)** for instant messaging and **PostgreSQL with Prisma** for storing chats securely. This app delivers a smooth, responsive, and engaging chat experience.

---

## 📌 Features
- **⚡ Real-Time Messaging** – Send and receive messages instantly with WebSockets.
- **🔒 Authentication** – Secure login/signup with JWT and password hashing.
- **👥 Private & Group Chats** – Chat one-on-one or in chat rooms.
- **📱 Responsive UI** – Works seamlessly on all devices.
- **🗄 Persistent Chat History** – Messages stored in PostgreSQL for retrieval anytime.

---

## 🛠️ Tech Stack
**Frontend:** Next.js, Tailwind CSS, Axios, Socket.io Client  
**Backend:** Express.js, Node.js, Prisma ORM, PostgreSQL, JWT, Bcrypt, Socket.io  

---

## 🚀 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/<your-username>/lets-chat.git
cd lets-chat

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Create environment variables for backend
# In backend/.env
DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/<db_name>?schema=public"
JWT_SECRET="your_jwt_secret"
PORT=3000

# Run Prisma migrations to set up the database
cd backend
npx prisma migrate dev --name init

# Start backend server
npx tsc -b
node dist/index.js

# Start frontend server (in a new terminal)
cd ../frontend
npm run dev
