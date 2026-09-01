# 🚀 Quick Start Guide - Café de la Paix

## 📋 What You Need
- Node.js 16+ 
- PostgreSQL 12+
- A code editor

## ⚡ 5-Minute Setup

### 1. Database Setup
```bash
# Install PostgreSQL, then create database
sudo -u postgres createdb cafe_db
```

### 2. Backend Setup
```bash
cd cafe-app/backend
npm install
npm run migrate  # Creates tables
npm run seed     # Adds sample data
npm run dev      # Starts server on :5000
```

### 3. Frontend Setup (new terminal)
```bash
cd cafe-app/frontend
npm install
npm run dev      # Starts app on :3000
```

## 🎯 Access the Application

### Public Site
- **URL**: http://localhost:3000
- **Features**: Homepage, menu browsing, category pages, search

### Admin Panel
- **URL**: http://localhost:3000/admin/login
- **Email**: `admin@cafe.com`
- **Password**: `admin123`
- **Features**: Manage categories, menu items, images

## 🔧 Default Configuration

The app comes pre-configured with:
- ✅ Sample categories (Petit-déjeuner, Fast Food, Boissons, Desserts)
- ✅ Sample menu items with images
- ✅ Admin user account
- ✅ Responsive design
- ✅ Image upload functionality
- ✅ Search & filtering

## 📂 Key Files to Customize

### Backend Config
- `backend/.env` - Database & JWT settings
- `backend/scripts/seed.js` - Sample data

### Frontend Styling
- `frontend/src/index.css` - Custom CSS classes
- `frontend/tailwind.config.js` - Colors & theme

### Images
- Upload through admin panel or place in `backend/uploads/`

## 🎨 Customization Ideas

1. **Change Colors**: Edit `tailwind.config.js` cafe color palette
2. **Add Logo**: Replace cafe icon in `frontend/public/`
3. **Modify Content**: Update sample data in seed script
4. **Add Features**: Extend with orders, reservations, etc.

## 🐛 Troubleshooting

**Database Connection Error?**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database exists: `psql -U postgres -l`

**Port Already in Use?**
- Backend: `lsof -i :5000` then `kill -9 <PID>`
- Frontend: `lsof -i :3000` then `kill -9 <PID>`

**Images Not Loading?**
- Check `backend/uploads` folder exists
- Ensure backend server is running
- Try uploading a new image through admin panel

## 📱 Features Overview

### Client Side
- 🏠 Beautiful homepage with cafe presentation
- 📋 Menu browsing with category cards
- 🔍 Real-time search functionality  
- 📱 Fully responsive design
- 🖼️ Image-focused card layouts

### Admin Side
- 🔐 Secure JWT authentication
- 📊 Dashboard with statistics
- 📁 Category management (CRUD)
- 🍽️ Menu item management (CRUD)
- 📷 Image upload (local + URL)
- 🔍 Search & filter admin views

---

**🎉 Your cafe website is ready! Start customizing and adding your own content.**