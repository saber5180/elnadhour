# 🗄️ Database Setup Guide

## Quick Database Setup

I've created a standalone database setup script that will handle everything for you!

### Option 1: Automated Setup (Recommended)

#### Step 1: Install Dependencies
```bash
cd cafe-app/backend
npm install
```

#### Step 2: Configure Database Connection
Edit the `setup-database.js` file in the root directory and update these values:
```javascript
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',        // Your PostgreSQL username
  password: 'password',    // Your PostgreSQL password
  database: 'postgres'
};
```

#### Step 3: Run Database Setup
**Windows:**
```bash
# Double-click setup-db.bat
# OR run in command prompt:
cd cafe-app
node setup-database.js
```

**Linux/Mac:**
```bash
cd cafe-app
chmod +x setup-db.sh
./setup-db.sh
```

This will automatically:
- ✅ Create the `cafe_db` database
- ✅ Create all necessary tables (users, categories, menu_items)
- ✅ Insert sample data (4 categories, 12 menu items)
- ✅ Create admin user (admin@cafe.com / admin123)

### Option 2: Manual Setup

If you prefer to do it manually:

#### 1. Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE cafe_db;

-- Connect to the new database
\c cafe_db;
```

#### 2. Create Tables
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Run Backend Migration (Alternative)
If you want to use the original backend scripts:
```bash
cd cafe-app/backend
npm run migrate
npm run seed
```

## Configuration

### Backend Environment
Update `cafe-app/backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cafe_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_very_long_secret_key
PORT=5000
```

## Verification

After setup, you should be able to:
1. Connect to the database: `psql -U postgres -d cafe_db`
2. See tables: `\dt`
3. Check data: `SELECT * FROM categories;`

## Troubleshooting

### Connection Refused
```bash
# Check if PostgreSQL is running
# Windows:
sc query postgresql-x64-14

# Linux:
sudo systemctl status postgresql

# Mac:
brew services list | grep postgres
```

### Authentication Failed
- Check your username/password in the setup script
- Verify PostgreSQL allows local connections
- Check `pg_hba.conf` if needed

### Permission Denied
```bash
# Grant permissions (if needed)
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'password';"
```

## Sample Data Included

After setup, you'll have:
- 4 Categories: Petit-déjeuner, Fast Food, Boissons, Desserts
- 12 Menu items with descriptions and prices
- 1 Admin user: admin@cafe.com / admin123

## Next Steps

After database setup:
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Visit: http://localhost:3000
4. Admin panel: http://localhost:3000/admin