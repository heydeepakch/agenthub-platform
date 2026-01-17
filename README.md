# Agent-Hub Platform

A full-stack chatbot application that allows users to create and manage AI-powered chatbot projects agents with custom prompts.

## Overview

This application consists of a React/Next.js frontend and an Express backend with PostgreSQL database. Users can register, create multiple chatbot agent projects with custom system prompts, and have conversations with AI assistants powered by Perplexity AI.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (version 16 or higher)
- npm or yarn
- PostgreSQL database
- A Perplexity API key

## Project Structure

```
chatbot-platform/
├── backend/          # Express server with TypeScript
├── frontend/         # Next.js application
└── README.md         # This file
```

## Setup Instructions

### 1. Database Setup

First, make sure PostgreSQL is installed and running on your system. Create a new database for this project:

```bash
createdb agent_hub_platform
```

Or use your preferred PostgreSQL client to create a database.

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/agent_hub_platform"
JWT_SECRET="your-secret-key-here"
PERPLEXITY_API_KEY="your-perplexity-api-key-here"
```

Replace the values with your actual credentials:

- `username` and `password`: Your PostgreSQL credentials
- `agent_hub_platform`: Your database name
- `your-secret-key-here`: A random string for JWT token generation
- `your-perplexity-api-key-here`: Your Perplexity AI API key

Run database migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

The frontend is configured to connect to the backend at `http://localhost:4000` by default.

## Running the Application

### Start the Backend Server

Open a terminal in the backend directory:

```bash
cd backend
npm run dev
```

The backend server will start on port 4000. You should see:

```
Server running on port 4000
```

### Start the Frontend Application

Open another terminal in the frontend directory:

```bash
cd frontend
npm run dev
```

The frontend will start on port 3000. You should see:

```
Ready on http://localhost:3000
```

### Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

## Using the Application

1. **Register**: Create a new account with your email and password
2. **Login**: Sign in with your credentials
3. **Create Project**: Create a new chatbot project with a custom name and system prompt
4. **Chat**: Start conversations with your AI chatbot in each project
5. **Dashboard**: View and manage all your projects from the dashboard

## Features

- User authentication with JWT tokens
- Multiple chatbot projects per user
- Custom system prompts for each chatbot
- Real-time chat with AI assistant
- Message history preservation
- Secure password hashing

## Technology Stack

### Backend

- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT for authentication
- Bcrypt for password hashing
- Perplexity AI for chat responses

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Axios for API calls

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Projects

- GET `/api/projects` - Get all user projects
- POST `/api/projects` - Create new project
- GET `/api/projects/:id` - Get single project

### Chat

- POST `/api/chat/:projectId/message` - Send message and get response
- GET `/api/chat/:projectId/messages` - Get all messages for a project

## Development Commands

### Backend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linter
```
