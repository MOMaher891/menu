# Gourmet QR Menu & Admin Dashboard

A complete, production-ready Digital QR Menu & Admin Dashboard system for restaurants and cafes. It features a mobile-first, high-fidelity customer menu that dynamically handles table identifiers and scheduled promotions, alongside a secure web-based management dashboard for operators.

---

## 🌟 Key Features

### 📱 Customer QR Menu (Mobile-First)
*   **Table ID Resolution**: Captures table numbers from the scanned URL (e.g. `?table=12`) and persists them in the session state.
*   **Automated Discount engine**: Dynamically calculates and displays sale prices, original prices (struck-through), and "SPECIAL OFFER" badges for active promotions based on the scheduled dates. Expired promotions are automatically disabled.
*   **Dual-Language & RTL Layout**: Fully supports English and Arabic. Toggle language on-the-fly; Arabic activates full RTL mirroring with the elegant **Cairo** web font.
*   **Interactive Drawer & Option Selectors**: Customers can customize their dishes (e.g., choice of single/double patty, extra cheese) and preview final totals instantly.
*   **High-Performance Visuals**: Fast loading speeds using optimized image serving and skeleton loader animations.

### 💼 Admin Management Panel
*   **Secure Session Authentication**: Secure access gateway using JWT (JSON Web Tokens).
*   **Analytics Overview Card**: Displays total counts of categories, items, and live scheduled offers.
*   **Categories Management (CRUD)**: Easily add, edit, or delete category tabs, define display sorting orders, and select icon slugs.
*   **Items Management (CRUD)**: Manage titles, pricing, descriptions, availability toggles, and nested options groups.
*   **Interactive Options Editor**: Directly build multi-level choice fields (sizes, modifiers, checkboxes) inside the creation form.
*   **Scheduled Promotions Manager**: Set up discount percentages or fixed sale rates using HTML5 datetime-local pickers.
*   **Integrated Local File Uploader**: Drag-and-drop file uploader that pushes photos directly to backend storage and returns static URLs.

---

## 🏗️ Project Directory Structure

```text
Menu/
├── client/                     # React Frontend (Vite + Tailwind CSS)
│   ├── dist/                   # Production-compiled assets
│   ├── src/
│   │   ├── components/         # Common UI elements
│   │   ├── context/
│   │   │   └── LanguageContext.jsx # RTL & EN/AR localization provider
│   │   ├── pages/
│   │   │   ├── CustomerMenu.jsx   # Mobile-first customer menu
│   │   │   ├── AdminLogin.jsx     # Glassmorphic admin sign-in
│   │   │   └── AdminDashboard.jsx # Full operational dashboard
│   │   ├── App.jsx             # HashRouter pathing
│   │   ├── index.css           # Styling directives, glassmorphic UI, custom animations
│   │   └── main.jsx
│   ├── tailwind.config.js      # Custom theme colors and fonts (Outfit & Cairo)
│   └── package.json
│
├── server/                     # Node.js + Express + Mongoose Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection config
│   ├── controllers/            # Logic controllers (auth, menu, categories, items, offers)
│   ├── middleware/             # JWT Protection & Multer File Upload handlers
│   ├── models/                 # Mongoose schemas (Admin, Category, Item, Offer)
│   ├── routes/                 # API endpoint routers
│   ├── uploads/                # Local static directory for food photos
│   ├── seed.js                 # Database seeder script
│   ├── .env                    # System environment variables
│   └── package.json
│
├── package.json                # Root package for concurrent execution
└── README.md                   # Instructions & documentation
```

---

## 🛠️ Installation & Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Local community server or MongoDB Atlas cluster connection)

### 1. Clone & Set Up Directory
Run the installation script in the root directory to install all packages for both the backend and frontend:
```bash
npm run install-all
```

### 2. Configure Environment Variables
Navigate to `server/` (or edit `server/.env` directly).
Update the variables to match your database connection string and secret key:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/qr_menu   # Local MongoDB or MongoDB Atlas URI
JWT_SECRET=super_secret_jwt_key_123_456
CLIENT_URL=http://localhost:5173
```
> **Note**: If your local MongoDB instance requires different credentials, swap `127.0.0.1:27017` with your target path.

### 3. Seed Database
Run the seed script to import standard food photos, categories, customizable item options, scheduled discounts, and a default administrator user:
```bash
npm run seed
```
*   **Default Admin Credentials**:
    *   **Username**: `admin`
    *   **Password**: `admin123`

---

## 🚀 Running the Application

### Development Mode
Start both the Node.js Express server (port 5000) and the Vite React server (port 5173) simultaneously:
```bash
npm run dev
```
*   **Customer Menu URL**: `http://localhost:5173/?table=7`
*   **Admin Console URL**: `http://localhost:5173/#/admin`

### Production Mode
Compile the frontend code and start the backend Express server, which serves both the API endpoints and the static React build on a single unified port:
```bash
# 1. Compile assets
npm run build

# 2. Run unified server
npm start
```
Open your browser and navigate to:
*   **Main Application**: `http://localhost:5000/?table=5`
*   **Admin Sign-in**: `http://localhost:5000/#/admin`

---

## 📊 Business Logic Mechanics

### Discount Scheduler
The database schema tracks `startDate` and `endDate` parameters:
1. When a client requests `GET /api/menu`, the controller queries the server for the current system date.
2. An offer is retrieved only if `currentDate >= startDate` and `currentDate <= endDate` and `isActive === true`.
3. The server computes the promotional price, attaches the discount badge metadata, and returns it to the client.
4. The client automatically draws a strike-through on the standard price, displays the new price highlighted in orange, and pops a glowing "SPECIAL OFFER" badge.
5. If the current date is outside the start/end window, the offer is ignored, and the item displays at standard pricing without badges.
