const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const inclus = (details, items) => {
  const head = details ? `${details.trim()}\n\n` : '';
  return `${head}Inclus : ${items.join(', ')}`;
};

const lines = (intro, rest) => {
  const extra = rest.filter(Boolean).join('\n');
  return extra ? `${intro}\n\n${extra}` : intro;
};

const MENU = [
  {
    name: "Les Matins d'El Nadhour",
    description: "Servis jusqu'à 13.00 pour profiter de la douceur de la brise marine.",
    items: [
      {
        name: 'Escale Rapide (Formule Fast)',
        price: 10,
        description: inclus("L'essentiel pour démarrer la journée du bon pied.", [
          'Café au choix', 'Mini jus', 'Croissant', 'Eau 0,5 L',
        ]),
      },
      {
        name: 'Brise du Matin',
        price: 15,
        description: inclus("L'équilibre parfait entre douceur et énergie.", [
          'Café au choix', 'Mini jus', 'Viennoiserie', 'Beurre', 'Confiture', 'Miel', 'Eau 0,5 L',
        ]),
      },
      {
        name: 'Délices du Salakta',
        price: 36,
        description: inclus('Un voyage authentique dans les saveurs de notre terroir.', [
          'Café au choix', 'Mini jus au choix', 'Eau 0,5 L', 'Viennoiserie', 'Pain',
          'Assiette de fruits', 'Fondant', 'Crêpe', 'Gaufre', 'Confiture', 'Miel', 'Beurre',
          'Chocolat', 'Cake', 'Gâteau', 'Mini pain cake', 'Tartelettes sucrées',
          'Omelette au fromage', 'Yaourt',
        ]),
      },
      {
        name: 'GOURMAND',
        price: 41,
        description: inclus('Une expérience matinale ultime.', [
          'Café au choix', 'Mini jus au choix', 'Eau 0,5 L', 'Viennoiserie', 'Pain', 'Harissa',
          "Huile d'olive", 'Olive', 'Ricotta', 'Assiette fromage charcuterie', 'Omelette fromage',
          'Crêpe salée', 'Mini soufflés', 'Charcuterie poulet', 'Tartelettes salées', 'Sandwich salé',
        ]),
      },
    ],
  },
  {
    name: 'Brunch',
    items: [
      {
        name: 'Grand Large en Duo',
        price: 62,
        description: inclus("Formule Brunch — 2 Pax. L'expérience ultime de partage face au port, entre terre et mer.", [
          '2 cafés au choix', '2 mini jus', 'Eau 1 L', 'Viennoiserie', '2 minis jwajems',
          'Beurre', 'Chocolat', 'Confiture', 'Bsissa', 'Chamia', 'Harissa', "Huile d'olive",
          'Olive', 'Miel', 'Gaufre', 'Crêpe', 'Fondant', 'Gâteau', 'Cake', 'Omelette',
          'Crêpe salée', 'Assiette charcuterie', 'Fromage', 'Nuggets', 'Boulette', 'Cordon bleu',
          'Calamare doré', 'Mchakchek', 'Tartelettes', 'French toast', 'Soufflet', 'Corbeille de pain',
        ]),
      },
      {
        name: 'Port & Soleil',
        price: 76,
        description: inclus(
          'Formule Brunch — 2 Pax. Une parenthèse ensoleillée face au port, alliant fraîcheur, générosité et un assortiment gourmand pensé pour un brunch à savourer à deux.',
          [
            '2 cafés au choix', '2 minis jus', 'Eau 1 L', 'Viennoiserie', '2 minis jwajems',
            '2 yaourts glacés', 'Assiette de fruits', 'Beurre', 'Chocolat', 'Confiture', 'Bsissa',
            'Chamia', 'Harissa', "Huile d'olive", 'Olive', 'Miel', 'Gaufre', 'Crêpe', 'Fondant',
            'Gâteau', 'Cake', 'Omelette', 'Crêpe salée', 'Assiette charcuterie', 'Fromage',
            'Nuggets', 'Boulette', 'Cordon bleu', 'Calamare doré', 'Mchakchek', 'Croissant farcis',
            'Tartelettes', 'French toast', 'Soufflet', 'Corbeille de pain', 'Gratin de poulet',
            'Mini pancake',
          ]
        ),
      },
    ],
  },
  {
    name: 'Crêpes, Gaufres & Mini Pancakes',
    subcategories: [
      {
        name: 'Les Saveurs Salées',
        description:
          'Élaborées avec des ingrédients frais et un fromage 100% lait, nos crêpes salées offrent des garnitures inspirées du jour pour une expérience savoureuse et raffinée.',
        items: [
          { name: 'Marsana', price: 18, description: 'Crêpe Thon & Fromage' },
          { name: 'Darse', price: 17, description: 'Crêpe Jambon & Fromage' },
          { name: 'Vague', price: 20, description: 'Crêpe Escalope & Fromage' },
          { name: 'Ancre', price: 22, description: 'Crêpe Cordon Bleu & Fromage' },
        ],
      },
      {
        name: 'Les Douceurs Sucrées',
        description:
          'Crêpes, Gaufres, Mini Pancakes. Toutes nos douceurs sont accompagnées de fruits frais et de nos variétés de crèmes à tartiner sélectionnées selon l\'inspiration du jour.',
        items: [
          { name: 'Nutella', price: 15 },
          { name: 'Nutella banane', price: 18 },
          { name: 'Nutella Fruits Secs', price: 18 },
          { name: 'Speculoos', price: 15 },
          { name: 'Pistache royal', price: 20 },
          { name: 'El Nadhour', price: 28, description: 'Fruits, Fruits secs, Nutella, Yaourt glacé, Variété de chocolat' },
          { name: 'Chocolat Dubai', price: 25, description: 'Kounafa, Pistache, Nutella, Fruits secs' },
        ],
      },
    ],
  },
  {
    name: 'Pâtes',
    description: 'Types de pâtes : Spaghettis, Pennes, Tagliatelles.',
    items: [
      {
        name: 'Fruits de mer',
        price: 40,
        description:
          'Une sélection généreuse des fruits de mer mariée à des pâtes savoureuses et une sauce parfumée aux arômes de la Méditerranée.',
      },
      {
        name: 'Pesto aux crevettes',
        price: 45,
        description:
          'Une spécialité traditionnelle relevée au cumin, où les fruits de mer de Salakta mijotent dans une sauce onctueuse et parfumée.',
      },
      {
        name: 'Carbonara',
        price: 29,
        description:
          'Une recette italienne authentique où la crème d’œuf, le parmesan et la pancetta s’unissent pour offrir une texture veloutée et une saveur chaleureuse.',
      },
      {
        name: 'Cordon Bleu (tagliatelles)',
        price: 33,
        description:
          'Des tagliatelles nappées d’une sauce crémeuse, accompagnées d’un cordon bleu fondant, pour un mariage généreux entre douceur et gourmandise.',
      },
      {
        name: 'Alfredo',
        price: 30,
        description:
          'Une sauce onctueuse au parmesan et au beurre qui enveloppe les pâtes d’un voile crémeux, offrant un plat délicat et irrésistiblement réconfortant.',
      },
      {
        name: 'Bolognaise',
        price: 29,
        description:
          'Un classique mijoté longuement : viande savoureuse, tomates parfumées et herbes méditerranéennes pour une sauce riche et pleine de caractère.',
      },
      {
        name: 'Puttanesca',
        price: 25,
        description:
          'Une composition audacieuse mêlant olives, câpres, ail et tomates, créant une harmonie méditerranéenne intense et pleine de personnalité.',
      },
      {
        name: 'Rosé',
        price: 45,
      },
    ],
  },
  {
    name: 'Entrées & Salades',
    items: [
      { name: 'Byzantique', price: 21, description: 'Omelette Thon & Fromage' },
      { name: 'El Sania', price: 17, description: 'Omelette végétarienne' },
      { name: 'César Salakta', price: 21, description: 'Salade César au Poulet' },
    ],
  },
  {
    name: 'Grilladin de Sullectum',
    description:
      "Chaque assiette raconte une histoire : celle d'une rencontre entre les trésors du port de Salakta et la générosité des terres tunisiennes.",
    items: [
      {
        name: 'Suprême Grillé',
        price: 23,
        description: 'Suprême du poulet mariné, grillé à cœur pour une chair juteuse.',
      },
      {
        name: 'Suprême Panée Kounafa',
        price: 25,
        description: 'Suprême de poulet pané et doré à la perfection pour un plaisir rustique et généreux.',
      },
      {
        name: 'Cordon Bleu Maison',
        price: 28,
        description: 'Où le fondant du fromage rencontre la finesse de la volaille marinée.',
      },
      {
        name: 'Suprême Signatures',
        price: 30,
        description: lines(
          'Volaille marinée accompagnée de la sauce de votre choix pour une escale sur mesure.',
          ['Options : Sauce roquefort, Sauce champignons']
        ),
      },
      {
        name: "Côtelettes d'Agneau (400G)",
        price: 58,
        description:
          '400 g de côtelettes grillées à la minute en hommage à la tradition pastorale du Sahel, servi avec toute la générosité de Salakta.',
      },
      {
        name: 'Filet de Bœuf',
        price: 48,
        description: lines(
          'Un filet de bœuf marqué par la saisie du grill pour être savouré nature ou sublimé par la sauce de votre choix.',
          ['Options : Nature, Sauce Poivre, Champignons, Roquefort']
        ),
      },
      {
        name: 'Grillade Mixte',
        price: 58,
        description:
          'Un assortiment généreux de viandes grillées à la minute, célébrant le savoir-faire des braises du Sahel et servi avec toute la convivialité de Salakta.',
      },
    ],
  },
  {
    name: 'Poissons & Fruits de Mer',
    items: [
      {
        name: 'Dorade du Jour (Arrivage de Salakta)',
        price: 31,
        description:
          "Sélection du jour issue de l'arrivage matinal du port de Salakta, saisie à la plancha, huile d'olive vierge et fleur de sel.",
      },
      {
        name: 'Loup du Jour (Arrivage de Salakta)',
        price: 35,
        description:
          "Sélection du jour issue de l'arrivage matinal du port de Salakta, saisie à la plancha, huile d'olive vierge et fleur de sel.",
      },
      {
        name: 'Duo de Crevettes (Panées et Grillées)',
        price: 48,
        description: '300 g de crevettes croustillantes panées et grillées.',
      },
      {
        name: 'Calamars Doré',
        price: 30,
        description: "Des calamars enveloppés d'une panure légère et dorée pour un croquant irrésistible à chaque bouchée.",
      },
      {
        name: 'Kamouniya Fruits de Mer',
        price: 40,
        description:
          'Une spécialité traditionnelle relevée au cumin, où les fruits de mer de Salakta mijotent dans une sauce onctueuse et parfumée.',
      },
      {
        name: 'Ojja Fruits de Mer',
        price: 40,
        description:
          'Une ojja généreuse où les fruits de mer de Salakta mijotent dans une sauce relevée, offrant une chaleur authentique et un parfum profondément méditerranéen.',
      },
      {
        name: 'Royaume Sauvage de Salakta',
        price: 108,
        description:
          'Un festin marin inspiré des côtes sauvages de Salakta, réunissant une sélection noble de fruits de mer grillés et mijotés pour une expérience majestueuse.',
      },
      {
        name: 'Royal Fruits de Mer',
        price: 75,
        description:
          'Un plateau royal où se mêlent fraîcheur, générosité et finesse, célébrant les trésors de la mer dans une composition élégante et abondante.',
      },
      {
        name: 'Plateaux Pêcheur',
        price: 95,
        description:
          'Une sélection authentique inspirée de la pêche du jour, réunissant les saveurs brutes et sincères de la mer pour un hommage vibrant aux pêcheurs de Salakta.',
      },
    ],
  },
  {
    name: 'Snack',
    items: [
      { name: 'Makloub Tradition', price: 17, description: 'Options : Poulet grillé, Poulet pané' },
      { name: 'Tacos Gourmets', price: 15, description: 'Poulet' },
      { name: 'Baguette Farcie', price: 19, description: 'Options : Poulet grillé, Poulet pané' },
    ],
  },
  {
    name: 'Pizzas',
    items: [
      { name: 'Margherita', price: 16, description: 'Tomate, Mozzarella fondante, Basilic frais' },
      { name: 'Pizza Végétarienne', price: 19, description: 'Tomate, Légumes sautés, Mozzarella fondante, Basilic frais' },
      { name: 'Thoniera', price: 22, description: 'Thon de Mahdia, Tomate, Mozzarella fondante, Basilic frais' },
      { name: 'Pepperonis', price: 23, description: 'Pepperonis, Tomate, Mozzarella fondante, Basilic frais' },
      { name: 'Perle Blanche au Poulet', price: 25, description: 'Sauce blanche, Poulet mariné, Basilic frais' },
      {
        name: 'Tout-Fromage',
        price: 28,
        description: 'Sauce blanche, Gruyère, Parmesan, Edam, Mozzarella fondante, Roquefort',
      },
      {
        name: 'Pizza Fruits de Mer',
        price: 30,
        description: 'Ensemble de fruits de mer, Tomate, Mozzarella fondante, Basilic frais',
      },
    ],
  },
  {
    name: 'Boissons Chaudes',
    items: [
      { name: 'Chocolat Chaud', price: 10 },
      { name: 'Spécial Arabica', price: 10, description: 'Café turc, Pâtisseries tunisiennes' },
      { name: 'Thé du Pêcheur', price: 10, description: 'Pâtisseries tunisiennes' },
      { name: 'Thé du Port', price: 14, description: 'Pâtisseries tunisiennes, Pignons ou amandes' },
      { name: 'Affogatos', price: 15, description: 'Glace au choix' },
    ],
  },
  {
    name: 'Frappuccino',
    items: [
      { name: 'Pistache', price: 18 },
      { name: 'Oreo', price: 18 },
      { name: 'Speculoos', price: 18 },
    ],
  },
  {
    name: 'Café',
    items: [
      { name: 'Expresso', price: 4 },
      { name: 'Capucin', price: 4.5 },
      { name: 'Café Crème', price: 5 },
      { name: 'Américano', price: 4 },
      { name: 'Cappuccino', price: 8 },
      { name: 'Cappuccino Tunisienne', price: 10 },
    ],
  },
  {
    name: 'Ice Tea',
    items: [
      { name: 'Mango Splash', price: 16 },
      { name: 'Pineapple Brecze', price: 16 },
      { name: 'Peach Sunset', price: 16 },
      { name: 'Apple', price: 11 },
    ],
  },
  {
    name: 'Ice Coffee',
    items: [
      { name: 'Ice Latte', price: 10 },
      { name: 'Ice Caramel Latte', price: 12 },
      { name: 'Ice Mocha Latte', price: 12 },
      { name: 'Ice Cappuccino', price: 12 },
    ],
  },
  {
    name: 'Boissons Fraîches',
    items: [
      { name: 'Hayet en Verre', price: 6 },
      { name: 'Eau 1L', price: 4 },
      { name: 'Eau 0,5L', price: 2.5 },
      { name: 'Eau Gazéifiée', price: 4.5 },
      { name: 'Canettes', price: 5.5 },
      { name: 'Énergétique', price: 10 },
    ],
  },
  {
    name: 'Jus',
    items: [
      { name: 'Citron', price: 9 },
      { name: 'Fraise', price: 11 },
      { name: 'Date Banane', price: 15 },
      { name: 'Mix Fruit de Saison', price: 14.5 },
      { name: 'Citron Libanais', price: 16, description: 'Citron, Menthe, Amande, Glace citron' },
    ],
  },
  {
    name: 'Smoothie',
    items: [
      { name: 'Yuzu Mangue', price: 19 },
      { name: 'Melon Pêche', price: 19 },
      { name: 'Berry', price: 19 },
      { name: 'Banane Fraise', price: 19 },
      { name: 'Mangue Ananas', price: 19 },
    ],
  },
  {
    name: 'Mojitos',
    items: [
      { name: 'Classic', price: 14 },
      { name: 'Red', price: 17.5 },
      { name: 'Blue', price: 17.5 },
      { name: 'Energetic', price: 21 },
    ],
  },
  {
    name: 'Mocktail',
    items: [
      { name: 'Holden Legon', price: 17.5, description: 'Orange, Bleu, Fruits passion' },
      { name: 'Blue Sakura', price: 17.5, description: 'Ananas, Bleu, Lytchee, Bleu Perry' },
      { name: 'Scarlet et Legon', price: 17.5, description: 'Kiwi, Passion, Frais citron' },
      { name: 'Tropical', price: 17.5, description: 'Ananas, Coco, Grenadine' },
      { name: 'Marly Boob', price: 17.5, description: 'Frais, Orange, Bleu' },
    ],
  },
  {
    name: 'Cocktails Signatures',
    items: [
      { name: 'Velvet Mango', price: 19, description: 'Mangue, Vanille, Citron, Grenadine' },
      { name: 'Banano Republique', price: 19, description: 'Banane, Blue Curaçao, Coco' },
      { name: 'Pina Colada', price: 19, description: 'Ananas, Noix de coco' },
      { name: 'Melon Sunset', price: 19, description: 'Citron, Blue Curaçao, Grenadine' },
    ],
  },
  {
    name: 'Power & Healthy',
    items: [
      { name: 'ChicBadhin', price: 15, description: 'Chia, Fruits, Yaourt' },
      { name: 'Pitrave Apple', price: 15, description: 'Pitrave, Pomme' },
      { name: 'Lemon Gingembre', price: 17, description: 'Citron, Boisson énergétique, Blue Curaçao' },
      { name: 'Power', price: 25, description: 'Banane, Fruits secs, Date, Miel, Boisson énergétique' },
      { name: 'Protein Shake', price: 24, description: 'Dose protein, Banane, Fruits secs' },
      { name: 'Mix Energy', price: 19, description: 'Banane, Fruits secs, Date' },
    ],
  },
  {
    name: 'Freakshakes',
    items: [
      { name: 'Oreo', price: 19 },
      { name: 'Pistachella', price: 19, description: 'Pistache, Chocolat' },
      { name: 'Speculoos', price: 19 },
    ],
  },
  {
    name: 'Milkshakes',
    items: [
      { name: 'Fraise', price: 12 },
      { name: 'Vanille', price: 12 },
      { name: 'Chocolat', price: 12 },
      { name: 'Pistache', price: 12 },
      { name: 'Kinder Bueno', price: 12 },
    ],
  },
  {
    name: 'Glace',
    items: [
      { name: 'Sorbet Citron', price: 12 },
      { name: 'Trio', price: 18, description: '3 boules, Fruits' },
      { name: 'Sorbet Gourmand', price: 31, description: '5 boules, Yaourt glacé, Fruits, Fruits secs' },
    ],
  },
  {
    name: 'Yaourt Glacé',
    items: [
      { name: 'Chocolat', price: 18 },
      { name: 'Strawberry', price: 18 },
      { name: 'Pistacha', price: 19.5 },
    ],
  },
  {
    name: 'Matcha',
    items: [
      { name: 'Classique', price: 19 },
      { name: 'Blue Matcha', price: 21 },
      { name: 'Strawberry', price: 21 },
      { name: 'Myrtille', price: 21 },
    ],
  },
  {
    name: 'Spécialités Jwajem',
    items: [
      { name: 'Classique', price: 16 },
      {
        name: 'Jwajem El Nadhour',
        price: 22,
        description: 'Notre création signature. Yaourt glacé, Fruits, Fruits secs, Croquant',
      },
      {
        name: "L'Assiette de Fruits",
        price: 30,
        description: 'Sélection de fruits frais de saison découpés.',
      },
    ],
  },
  {
    name: "L'Espace Narguilé & Détente",
    description: "L'art de la vapeur face à l'horizon.",
    items: [
      {
        name: 'Le Souffle de la Marine',
        price: 13,
        description: inclus('Profitez de votre chicha au choix :', [
          'Pomme classique', 'Menthe fraîche', 'Mini jus', 'Mini thé', 'Love 66', 'Ou votre propre Mix Signature',
        ]),
      },
      {
        name: 'Le Pack (Escale au Port)',
        price: 30,
        description: inclus("L'accord parfait pour une pause prolongée.", [
          'Chicha préférée', 'Eau minérale 0,5 L', "Thé à l'amande ou pignon", 'Mini jus de fruits',
        ]),
      },
      {
        name: 'La Chicha Royale des Amiraux',
        price: 40,
        description: inclus('Le service de prestige par excellence.', [
          'Chicha', 'Seau de glaçons pour une vapeur extra-fraîche', 'Farandole de fruits de saison',
          "Thé à l'amande ou pignon", 'Eau minérale 0,5 L',
        ]),
      },
    ],
  },
];

async function insertItem(categoryId, subcategoryId, item, sortOrder) {
  await pool.query(
    `INSERT INTO menu_items (name, description, price, category_id, subcategory_id, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [item.name, item.description || null, item.price, categoryId, subcategoryId, sortOrder]
  );
}

const seedMenu = async () => {
  console.log('🌱 Remplacement du menu par la carte El Nadhour...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await pool.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    ['admin@elnadhour.com', hashedPassword]
  );

  await pool.query('DELETE FROM menu_items');
  await pool.query('DELETE FROM subcategories');
  await pool.query('DELETE FROM categories');

  let catOrder = 0;
  let itemCount = 0;
  let subCount = 0;

  for (const cat of MENU) {
    catOrder += 1;
    const catRes = await pool.query(
      'INSERT INTO categories (name, description, sort_order) VALUES ($1, $2, $3) RETURNING id',
      [cat.name, cat.description || null, catOrder]
    );
    const categoryId = catRes.rows[0].id;
    let itemOrder = 0;

    if (cat.subcategories) {
      let subOrder = 0;
      for (const sub of cat.subcategories) {
        subOrder += 1;
        subCount += 1;
        const subRes = await pool.query(
          'INSERT INTO subcategories (name, description, category_id, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
          [sub.name, sub.description || null, categoryId, subOrder]
        );
        const subcategoryId = subRes.rows[0].id;
        for (const item of sub.items || []) {
          itemOrder += 1;
          itemCount += 1;
          await insertItem(categoryId, subcategoryId, item, itemOrder);
        }
      }
    }

    for (const item of cat.items || []) {
      itemOrder += 1;
      itemCount += 1;
      await insertItem(categoryId, null, item, itemOrder);
    }
  }

  console.log(`🎉 Menu El Nadhour chargé : ${catOrder} catégories, ${subCount} sous-catégories, ${itemCount} articles.`);
};

(async () => {
  try {
    await seedMenu();
    process.exitCode = 0;
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  } finally {
    try {
      await pool.end();
    } catch (_) {
      /* ignore */
    }
  }
  process.exit(process.exitCode ?? 1);
})();
