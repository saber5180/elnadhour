# 🔄 Frontend Refresh Guide

## Your Frontend Should Auto-Update

Since you're running `npm run dev`, Vite should automatically reload with changes.

## If Colors/Logo Don't Update:

### 1. Hard Refresh Browser
- **Chrome/Edge**: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
- **Firefox**: Ctrl + F5 (Windows) or Cmd + Shift + R (Mac)

### 2. Clear Browser Cache
- Press F12 (Developer Tools)
- Right-click refresh button → "Empty Cache and Hard Reload"

### 3. Restart Frontend (if needed)
In your terminal running the frontend:
- Press `Ctrl + C` to stop
- Run `npm run dev` again

## ✅ Expected Changes:
- **Title**: "El Nadhour | Restaurant & Café"
- **Logo**: Your custom icon.png
- **Colors**: Teal theme (#1F5A6B) instead of brown
- **Name**: "El Nadhour" everywhere instead of "Café de la Paix"
- **Admin**: "El Nadhour Admin" in dashboard

## 🎯 Check These Pages:
- Home: http://localhost:3000
- Menu: http://localhost:3000/menu  
- Admin: http://localhost:3000/admin

If you still see brown colors or old name, try the hard refresh steps above!