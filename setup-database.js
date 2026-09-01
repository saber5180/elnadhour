#!/usr/bin/env node

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration - update these values as needed
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres', // Change this to your PostgreSQL username
  password: 'postgres', // Change this to your PostgreSQL password
  database: 'postgres' // Connect to default database first
};

const TARGET_DB = 'cafe_db';

async function setupDatabase() {
  console.log('🚀 Starting database setup for El Nadhour...\n');

  let client;

  try {
    // Connect to PostgreSQL
    client = new Client(DB_CONFIG);
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Create database if it doesn't exist
    try {
      await client.query(`CREATE DATABASE ${TARGET_DB}`);
      console.log(`✅ Database "${TARGET_DB}" created successfully`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`ℹ️  Database "${TARGET_DB}" already exists`);
      } else {
        throw error;
      }
    }

    await client.end();

    // Connect to the new database
    const dbClient = new Client({
      ...DB_CONFIG,
      database: TARGET_DB
    });
    await dbClient.connect();
    console.log(`✅ Connected to database "${TARGET_DB}"`);

    // Create tables
    console.log('\n📋 Creating database tables...');
    
    // Users table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Categories table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Categories table created');

    // Menu items table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(500),
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        is_recommended BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Menu items table created');

    await dbClient.query(`
      ALTER TABLE menu_items
      ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT FALSE
    `);

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS hero_images (
        id SERIAL PRIMARY KEY,
        image_url VARCHAR(500) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Hero images table created');

    // Insert sample data
    console.log('\n🌱 Inserting sample data...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await dbClient.query(`
      INSERT INTO users (email, password_hash) 
      VALUES ($1, $2) 
      ON CONFLICT (email) DO NOTHING
    `, ['admin@elnadhour.com', hashedPassword]);
    console.log('✅ Admin user created (admin@elnadhour.com / admin123)');

    // Create categories with sample data
    const categories = [
      { name: 'Petit-déjeuner', image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800' },
      { name: 'Fast Food', image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800' },
      { name: 'Boissons', image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800' },
      { name: 'Desserts', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800' }
    ];

    const categoryIds = {};
    for (const category of categories) {
      const result = await dbClient.query(`
        INSERT INTO categories (name, image_url) 
        VALUES ($1, $2) 
        ON CONFLICT DO NOTHING 
        RETURNING id
      `, [category.name, category.image_url]);
      
      if (result.rows.length > 0) {
        categoryIds[category.name] = result.rows[0].id;
      } else {
        // Get existing category ID
        const existing = await dbClient.query(
          'SELECT id FROM categories WHERE name = $1', 
          [category.name]
        );
        if (existing.rows.length > 0) {
          categoryIds[category.name] = existing.rows[0].id;
        }
      }
    }
    console.log('✅ Categories created');

    // Create sample menu items
    const menuItems = [
      // Petit-déjeuner
      { name: 'Croissant au Beurre', description: 'Croissant frais et croustillant', price: 2.50, category: 'Petit-déjeuner', image_url: 'https://images.unsplash.com/photo-1555507036-ab794f4ade6a?w=400' },
      { name: 'Pain au Chocolat', description: 'Viennoiserie avec chocolat noir', price: 2.80, category: 'Petit-déjeuner', image_url: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400' },
      { name: 'Café + Croissant', description: 'Formule petit-déjeuner classique', price: 4.50, category: 'Petit-déjeuner', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400' },

      // Fast Food
      { name: 'Sandwich Club', description: 'Poulet, bacon, salade, tomate, mayo', price: 8.90, category: 'Fast Food', image_url: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400' },
      { name: 'Croque Monsieur', description: 'Jambon, fromage, béchamel gratinée', price: 7.50, category: 'Fast Food', image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
      { name: 'Salade César', description: 'Salade verte, poulet, parmesan, croûtons', price: 9.20, category: 'Fast Food', image_url: 'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=400' },

      // Boissons
      { name: 'Café Espresso', description: 'Café italien traditionnel', price: 2.20, category: 'Boissons', image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400' },
      { name: 'Cappuccino', description: 'Espresso avec mousse de lait', price: 3.50, category: 'Boissons', image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400' },
      { name: 'Thé à la Menthe', description: 'Thé vert frais avec menthe', price: 3.00, category: 'Boissons', image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
      { name: 'Jus d\'Orange Frais', description: 'Jus pressé du jour', price: 4.00, category: 'Boissons', image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },

      // Desserts
      { name: 'Tarte aux Pommes', description: 'Tarte maison aux pommes caramélisées', price: 5.50, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400' },
      { name: 'Tiramisu', description: 'Dessert italien au mascarpone', price: 6.00, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' },
      { name: 'Éclair au Chocolat', description: 'Pâte à choux garnie de crème pâtissière', price: 4.20, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' }
    ];

    for (const item of menuItems) {
      const categoryId = categoryIds[item.category];
      if (categoryId) {
        await dbClient.query(`
          INSERT INTO menu_items (name, description, price, category_id, image_url) 
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [item.name, item.description, item.price, categoryId, item.image_url]);
      }
    }
    console.log('✅ Sample menu items created');

    await dbClient.end();

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Database: ${TARGET_DB}`);
    console.log(`   Admin Email: admin@elnadhour.com`);
    console.log(`   Admin Password: admin123`);
    console.log(`   Categories: 4`);
    console.log(`   Menu Items: 12`);
    console.log('\n🚀 You can now start your backend server with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure PostgreSQL is running:');
      console.log('   Windows: Start PostgreSQL service');
      console.log('   Linux: sudo systemctl start postgresql');
      console.log('   macOS: brew services start postgresql');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   1. PostgreSQL username and password in this script');
      console.log('   2. Update DB_CONFIG at the top of this file');
    }
    
    process.exit(1);
  } finally {
    if (client && !client._ending) {
      await client.end();
    }
  }
}

// Run the setup
setupDatabase();