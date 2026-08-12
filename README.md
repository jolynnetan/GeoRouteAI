🗺️ GeoRouteAI – Automated Dispatcher & Route Optimization System

GeoRouteAI is an intelligent dispatcher and dynamic route optimization platform built to streamline driver assignments, vehicle routing, and delivery status tracking in real time.

✨ Features

🤖 Automated Dispatching:** Intelligent order-to-driver matching based on proximity, capacity, and current routes.
📍 Interactive Map & Live Tracking:** Visualizes delivery zones, active drivers, and optimized paths in real time.
📊 Real-time Dashboard:** Operational metrics, order statuses, and driver workload overviews.
⚡ High-Performance Build:** Powered by Vite, React, and TypeScript for rapid loading and smooth map rendering.


🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Tailwind CSS
**Build Tool:** Vite (with LightningCSS / Rolldown)
**Icons & UI:** Lucide React
**Deployment:** Vercel

📂 Project Structure

GeoRouteAI/
├── project/              # Main React + Vite source code
│   ├── src/              # App components, pages, and logic
│   ├── public/           # Static assets & index.html
│   ├── vite.config.ts    # Vite configuration
│   └── package.json      # Dependencies and scripts
└── README.md

🚀 Getting Started
Prerequisites
Ensure you have Node.js (v18 or higher) and npm installed.

Local Installation & Setup
Clone the repository:

Bash
git clone [https://github.com/jolynnetan/GeoRouteAI.git](https://github.com/jolynnetan/GeoRouteAI.git)
cd GeoRouteAI/project
Install dependencies:

Bash
npm install
Start the local development server:

Bash
npm run dev
Open your browser at http://localhost:5173.

Build for production:

Bash
npm run build


☁️ Deployment on Vercel
To deploy this project to Vercel:

Connect your GitHub repository (jolynnetan/GeoRouteAI) to Vercel.

Under Project Settings -> General:

Set Root Directory to project.

Set Framework Preset to Vite.

Deploy! Any push to main will automatically trigger a clean build.

📄 License
This project is open-source and available under the MIT License.
