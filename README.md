# One-Click-Analysis

A task and comments analyzer that generates a complete project task report in one click using an LLM (Groq API).
It provides details like current progress, work completed, work pending, open questions, and estimated time to complete.

🗂 Project Structure
project-root/
├── frontend/    # React + Tailwind CSS
├── backend/     # Node.js + Express API using Groq LLM
└── README.md

⚡ Setup Instructions
# Frontend

Go to the frontend folder:

cd frontend


Install dependencies:

npm install


Start the frontend server:

npm run dev


The frontend will run on http://localhost:5173/ (or the terminal-provided URL).

# Backend

Go to the backend folder:

cd backend


Install dependencies:

npm install


Create a .env file with your Groq API key:

GROQ_API_KEY=your_api_key_here


Start the backend server:

npm run dev


The backend will run on http://localhost:5000.