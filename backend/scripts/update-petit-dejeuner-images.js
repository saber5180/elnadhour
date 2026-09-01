/**
 * Met à jour les images d’exemple des formules petit-déjeuner.
 * Usage: node scripts/update-petit-dejeuner-images.js (depuis cafe-app/backend)
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

/** Images d’exemple (Unsplash + fichier public du projet) */
const IMAGES = [
  {
    name: 'Beau Matin',
    image_url:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  },
  {
    name: 'Kids',
    image_url:
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=80',
  },
  {
    name: 'Délice de Matin',
    image_url:
      'https://images.unsplash.com/photo-1526318479861-d55cd11d0177?w=800&q=80',
  },
  {
    name: 'Gourmand',
    image_url:
      'https://images.unsplash.com/photo-1525351484163-7529144344d8?w=800&q=80',
  },
  {
    name: 'Healthy',
    image_url:
      'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&q=80',
  },
  {
    name: 'Dio Traditionnel',
    image_url:
      '/489781949_1156002556538359_4823614051028907923_n.jpg',
  },
  {
    name: 'Brunch Saphir Bleu',
    image_url:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  },
];

async function run() {
  let n = 0;
  for (const row of IMAGES) {
    const r = await pool.query(
      'UPDATE menu_items SET image_url = $1 WHERE name = $2 RETURNING id',
      [row.image_url, row.name]
    );
    if (r.rowCount) {
      console.log(`✅ Image : ${row.name}`);
      n += 1;
    } else {
      console.log(`⏭️  Introuvable (nom exact) : ${row.name}`);
    }
  }
  console.log(`\n🎉 ${n} formule(s) mise(s) à jour.`);
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
