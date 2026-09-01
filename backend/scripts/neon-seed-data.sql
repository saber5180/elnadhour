-- =============================================================================
-- Neon / PostgreSQL — même contenu que scripts/seed.js (sans Node)
-- Coller tout le fichier dans Neon → SQL Editor, puis Run.
-- Idempotent : ré-exécuter n’ajoute pas de doublons (users par email, reste par nom).
-- Prérequis : tables users, categories, menu_items existent (migrate / ensureSchema).
-- =============================================================================

-- --- Admin (mot de passe : admin123) ---
INSERT INTO users (email, password_hash)
VALUES (
  'admin@elnadhour.com',
  '$2a$10$cvRp7xe/sBmLBdoEszGL6eQfW9AGBHX/3rVUHnMcgUrVVOQOeBoS2'
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash;

-- --- Catégories ---
INSERT INTO categories (name, image_url)
SELECT 'Petit-déjeuner', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Petit-déjeuner');

INSERT INTO categories (name, image_url)
SELECT 'Fast Food', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Fast Food');

INSERT INTO categories (name, image_url)
SELECT 'Boissons', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Boissons');

INSERT INTO categories (name, image_url)
SELECT 'Desserts', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Desserts');

-- --- Plats (menu_items) : Petit-déjeuner ---
INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Croissant au Beurre', 'Croissant frais et croustillant', 2.50, c.id,
  'https://images.unsplash.com/photo-1555507036-ab794f4ade6a?w=400', false
FROM categories c WHERE c.name = 'Petit-déjeuner'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Croissant au Beurre');

INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Pain au Chocolat', 'Viennoiserie avec chocolat noir', 2.80, c.id,
  'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400', false
FROM categories c WHERE c.name = 'Petit-déjeuner'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Pain au Chocolat');

INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Café + Croissant', 'Formule petit-déjeuner classique', 4.50, c.id,
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', false
FROM categories c WHERE c.name = 'Petit-déjeuner'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Café + Croissant');

-- --- Fast Food ---
INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Sandwich Club', 'Poulet, bacon, salade, tomate, mayo', 8.90, c.id,
  'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400', false
FROM categories c WHERE c.name = 'Fast Food'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Sandwich Club');

INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Croque Monsieur', 'Jambon, fromage, béchamel gratinée', 7.50, c.id,
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', false
FROM categories c WHERE c.name = 'Fast Food'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Croque Monsieur');

INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Salade César', 'Salade verte, poulet, parmesan, croûtons', 9.20, c.id,
  'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=400', false
FROM categories c WHERE c.name = 'Fast Food'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Salade César');

-- --- Boissons ---
INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Café Espresso', 'Café italien traditionnel', 2.20, c.id,
  'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400', false
FROM categories c WHERE c.name = 'Boissons'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Café Espresso');

INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Cappuccino', 'Espresso avec mousse de lait', 3.50, c.id,
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', false
FROM categories c WHERE c.name = 'Boissons'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Cappuccino');

INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Thé à la Menthe', 'Thé vert frais avec menthe', 3.00, c.id,
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', false
FROM categories c WHERE c.name = 'Boissons'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Thé à la Menthe');

INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Jus d''Orange Frais', 'Jus pressé du jour', 4.00, c.id,
  'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', false
FROM categories c WHERE c.name = 'Boissons'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Jus d''Orange Frais');

-- --- Desserts ---
INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Tarte aux Pommes', 'Tarte maison aux pommes caramélisées', 5.50, c.id,
  'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', false
FROM categories c WHERE c.name = 'Desserts'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Tarte aux Pommes');

INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Tiramisu', 'Dessert italien au mascarpone', 6.00, c.id,
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', false
FROM categories c WHERE c.name = 'Desserts'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Tiramisu');

INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended)
SELECT 'Éclair au Chocolat', 'Pâte à choux garnie de crème pâtissière', 4.20, c.id,
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', false
FROM categories c WHERE c.name = 'Desserts'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = 'Éclair au Chocolat');
