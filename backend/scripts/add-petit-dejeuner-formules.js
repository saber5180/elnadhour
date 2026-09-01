/**
 * Ajoute les formules petit-déjeuner El Nadhour (prix en EUR en base).
 * Usage: node scripts/add-petit-dejeuner-formules.js (depuis cafe-app/backend)
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cafe_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const FORMULES = [
  {
    name: 'Beau Matin',
    price: 14,
    image_url:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    description:
      'Café aux choix, mini jus, eau 0,5 L, viennoiserie, beurre, confiture, miel, œuf à la coque.',
  },
  {
    name: 'Kids',
    price: 16,
    image_url:
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=80',
    description:
      'Tasse de lait, mini jus, eau 0,5 L, mini croissant, grain d\'or, pain cake, œuf à la coque, œuf surprise.',
  },
  {
    name: 'Délice de Matin',
    price: 28.5,
    image_url:
      'https://images.unsplash.com/photo-1526318479861-d55cd11d0177?w=800&q=80',
    description:
      'Café aux choix, mini jus, eau 0,5 L, corbeille viennoiserie, fruits coupés, crêpe chocolat, gaufre chocolat, brownie, verrine cheesecake, gâteaux du jour, assiette fromage, charcuterie, yaourt, cake, chocolat, confiture, beurre, miel.',
  },
  {
    name: 'Gourmand',
    price: 35,
    image_url:
      'https://images.unsplash.com/photo-1525351484163-7529144344d8?w=800&q=80',
    description:
      'Café aux choix, mini jus, eau 0,5 L, pain maison, croissant salé, assiette fromage et charcuterie, assortiment de poulet, omelette, crêpe fourrée escalope, crêpe fromage, harissa, huile d\'olive, ricotta, olives.',
  },
  {
    name: 'Healthy',
    price: 24,
    image_url:
      'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&q=80',
    description:
      'Café aux choix, lait tiède, pain complet, fruits coupés, assiette fromage blanc, eau détox, omelette blanc d\'œuf, pain cake nature, yaourt 0%, brochette escalope grillée.',
  },
  {
    name: 'Dio Traditionnel',
    price: 49,
    image_url: '/489781949_1156002556538359_4823614051028907923_n.jpg',
    description:
      '2 cafés, 2 mini jus, eau 1 L, 2 croissants, plats tunisiens, pain traditionnel, assiette fromage et charcuterie, ojja nature, doigts de Fatma, drooh, rfissa, 2 mini soufflés, pâtisserie tunisienne, assidat zgougou, bsissa, huile d\'olive, olives, harissa arbi.',
  },
  {
    name: 'Brunch Saphir Bleu',
    price: 59,
    image_url:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    description:
      '2 cafés, 2 mini jus, eau 1 L, corbeille viennoiserie, 2 mini gâteaux (jwajem), crêpe Nutella, gaufre chocolat, brownies, cookies, fondant au chocolat, gâteaux du jour, omelette fromage, ojja nature, crêpe fourrée escalope, assiette fromage et charcuterie, assortiment de poulet, calamars dorés, 2 mini soufflés thon, beurre, Nutella, confiture, miel, huile d\'olive, olives, harissa. (Prix indicatif — à ajuster si besoin.)',
  },
];

async function run() {
  const cat = await pool.query(
    "SELECT id FROM categories WHERE name ILIKE 'petit-déjeuner' OR name ILIKE 'petit dejeuner' LIMIT 1"
  );
  if (!cat.rows.length) {
    console.error('❌ Catégorie « Petit-déjeuner » introuvable. Créez-la d’abord.');
    process.exit(1);
  }
  const categoryId = cat.rows[0].id;
  let added = 0;
  for (const f of FORMULES) {
    const exists = await pool.query(
      'SELECT 1 FROM menu_items WHERE category_id = $1 AND name = $2 LIMIT 1',
      [categoryId, f.name]
    );
    if (exists.rows.length) {
      console.log(`⏭️  Déjà présent : ${f.name}`);
      continue;
    }
    await pool.query(
      `INSERT INTO menu_items (name, description, price, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [f.name, f.description, f.price, categoryId, f.image_url]
    );
    console.log(`✅ Ajouté : ${f.name} (${f.price} €)`);
    added += 1;
  }
  console.log(`\n🎉 Terminé — ${added} formule(s) ajoutée(s).`);
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
