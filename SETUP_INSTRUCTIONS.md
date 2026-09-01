# 🚀 El Nadhour Setup Instructions

## ✅ What's Fixed:
- ✅ App name changed to "El Nadhour" throughout
- ✅ Admin email changed to: admin@elnadhour.com
- ✅ Color scheme updated to teal (#1F5A6B)
- ✅ Icon updated to use your icon.png
- ✅ Dependencies installed

## 🔧 Next Steps:

### 1. Configure Database Connection
Edit `setup-database.js` lines 8-12 with your PostgreSQL credentials:

```javascript
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',        // ← Change to your PostgreSQL username
  password: 'YOUR_PASSWORD', // ← Change to your PostgreSQL password  
  database: 'postgres'
};
```

### 2. Run Database Setup
```bash
node setup-database.js
```

### 3. Start Backend
```bash
cd backend
npm run dev
```

### 4. Your Frontend is Already Running!
- Visit: http://localhost:3000
- Admin: http://localhost:3000/admin
- Login: admin@elnadhour.com / admin123

## 🎯 What PostgreSQL Password to Use?

### Option 1: Default PostgreSQL Password
If you just installed PostgreSQL, try common defaults:
- Password: `postgres`
- Password: `admin` 
- Password: (empty - just press enter)

### Option 2: Set PostgreSQL Password
```bash
# Connect to PostgreSQL
psql -U postgres

# Set password
ALTER USER postgres PASSWORD 'newpassword';
```

### Option 3: Create New User
```sql
-- Connect as postgres
psql -U postgres

-- Create new user
CREATE USER elnadhour WITH PASSWORD 'elnadhour123';
ALTER USER elnadhour CREATEDB;

-- Then update setup-database.js:
user: 'elnadhour',
password: 'elnadhour123',
```

## 🎨 Updated Colors:
- Primary Teal: #1F5A6B (your logo color)
- Light backgrounds: Soft teals and grays
- Clean modern look matching your icon

## 📱 Features Ready:
- ✅ El Nadhour branding throughout
- ✅ Teal color scheme
- ✅ Your custom icon
- ✅ Responsive design
- ✅ Admin dashboard
- ✅ Menu management

Once database is set up, everything should work perfectly!