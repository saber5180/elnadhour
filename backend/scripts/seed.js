const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
      ['admin@elnadhour.com', hashedPassword]
    );
    console.log('✅ Admin user created (admin@elnadhour.com / admin123)');

    // Create categories
    const categories = [
      { name: 'Petit-déjeuner', image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800' },
      { name: 'Fast Food', image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800' },
      { name: 'Boissons', image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800' },
      { name: 'Desserts', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800' }
    ];

    for (const category of categories) {
      await pool.query(
        'INSERT INTO categories (name, image_url) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [category.name, category.image_url]
      );
    }
    console.log('✅ Categories created');

    // Get category IDs for menu items
    const petitDejResult = await pool.query('SELECT id FROM categories WHERE name = $1', ['Petit-déjeuner']);
    const fastFoodResult = await pool.query('SELECT id FROM categories WHERE name = $1', ['Fast Food']);
    const boissonsResult = await pool.query('SELECT id FROM categories WHERE name = $1', ['Boissons']);
    const dessertsResult = await pool.query('SELECT id FROM categories WHERE name = $1', ['Desserts']);

    const petitDejId = petitDejResult.rows[0]?.id;
    const fastFoodId = fastFoodResult.rows[0]?.id;
    const boissonsId = boissonsResult.rows[0]?.id;
    const dessertsId = dessertsResult.rows[0]?.id;

    // Create menu items
    const menuItems = [
      // Petit-déjeuner
      { name: 'Croissant au Beurre', description: 'Croissant frais et croustillant', price: 2.50, category_id: petitDejId, image_url: 'https://images.unsplash.com/photo-1555507036-ab794f4ade6a?w=400' },
      { name: 'Pain au Chocolat', description: 'Viennoiserie avec chocolat noir', price: 2.80, category_id: petitDejId, image_url: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400' },
      { name: 'Café + Croissant', description: 'Formule petit-déjeuner classique', price: 4.50, category_id: petitDejId, image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400' },

      // Fast Food
      { name: 'Sandwich Club', description: 'Poulet, bacon, salade, tomate, mayo', price: 8.90, category_id: fastFoodId, image_url: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400' },
      { name: 'Croque Monsieur', description: 'Jambon, fromage, béchamel gratinée', price: 7.50, category_id: fastFoodId, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
      { name: 'Salade César', description: 'Salade verte, poulet, parmesan, croûtons', price: 9.20, category_id: fastFoodId, image_url: 'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=400' },

      // Boissons
      { name: 'Café Espresso', description: 'Café italien traditionnel', price: 2.20, category_id: boissonsId, image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400' },
      { name: 'Cappuccino', description: 'Espresso avec mousse de lait', price: 3.50, category_id: boissonsId, image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400' },
      { name: 'Thé à la Menthe', description: 'Thé vert frais avec menthe', price: 3.00, category_id: boissonsId, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
      { name: 'Jus d\'Orange Frais', description: 'Jus pressé du jour', price: 4.00, category_id: boissonsId, image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },

      // Desserts
      { name: 'Tarte aux Pommes', description: 'Tarte maison aux pommes caramélisées', price: 5.50, category_id: dessertsId, image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400' },
      { name: 'Tiramisu', description: 'Dessert italien au mascarpone', price: 6.00, category_id: dessertsId, image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' },
      { name: 'Éclair au Chocolat', description: 'Pâte à choux garnie de crème pâtissière', price: 4.20, category_id: dessertsId, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' }
    ];

    for (const item of menuItems) {
      if (item.category_id) {
        await pool.query(
          'INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES ($1, $2, $3, $4, $5)',
          [item.name, item.description, item.price, item.category_id, item.image_url]
        );
      }
    }
    console.log('✅ Menu items created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('📧 Admin login: admin@elnadhour.com');
    console.log('🔑 Admin password: admin123');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await pool.end();
  }
};

seedData();