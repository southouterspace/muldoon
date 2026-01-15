-- Add sizes and link columns to Item table
ALTER TABLE "Item" ADD COLUMN sizes TEXT[];
ALTER TABLE "Item" ADD COLUMN link TEXT;

-- Clear existing items and reseed with correct data from raptors_spring_2026.json
TRUNCATE TABLE "Item" CASCADE;

-- Reseed items (cost converted from dollars to cents)
INSERT INTO "Item" (number, name, "costCents", active, sizes, link)
VALUES
  (1, 'Raptors Red Team Jersey', 5000, TRUE, NULL, NULL),
  (2, 'Raptors White Team Jersey', 5000, TRUE, NULL, NULL),
  (3, 'Youth Grey Splatter Practice Shirt', 1800, TRUE, ARRAY['XS', 'S', 'M', 'L', 'XL'], 'https://www.portandcompany.com/p/6524_GyConcrete'),
  (4, 'Youth Black Graffiti Practice Shirt', 1800, TRUE, ARRAY['XS', 'S', 'M', 'L', 'XL'], 'https://www.jiffy.com/sporttek-YST350.html?ac=Neon+Pink&size=XS...'),
  (5, 'Youth Pink Electric Practice Shirt', 1800, TRUE, ARRAY['XS', 'S', 'M', 'L', 'XL'], 'https://www.jiffy.com/sporttek-YST350.html?ac=Neon+Pink&size=XS...'),
  (6, 'Youth Red Seams Practice Shirt', 1800, TRUE, ARRAY['XS', 'S', 'M', 'L', 'XL'], 'https://www.jiffy.com/sporttek-YST350.html?ac=Neon+Pink&size=XS...'),
  (7, 'Youth Red Raptors Baseball Short Sleeve Pullover', 3000, TRUE, ARRAY['XS', 'S', 'M', 'L', 'XL'], 'https://www.sporttekusa.com/p/10088_DeepRed'),
  (8, 'Raptors Fitted Team Hat Black and Red', 2000, TRUE, ARRAY['AXS', 'AS', 'AM', 'AL', 'AXL'], 'https://baseball.epicsports.com/prod/117532/the-game-gb998-perforated-gamechanger-cap.html'),
  (9, 'Red Camo socks', 1900, TRUE, ARRAY['Small', 'Medium', 'Large', 'X-Large'], 'https://www.madsportsstuff.com/products/tck-digital-camo-otc-socks?variant=31832871534682'),
  (10, 'Raptors Gray Hoodie with player number', 4000, TRUE, NULL, NULL),
  (11, 'Adult Gray Splatter Shirt (Medium Gray)', 2200, TRUE, ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'], 'https://www.ssactivewear.com/p/paragon/200'),
  (12, 'Adult Black Graffiti Shirt', 2200, TRUE, ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'], 'https://www.ssactivewear.com/p/comfort_colors/1717'),
  (13, 'Adult Pink Electric Shirt', 2200, TRUE, ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'], 'https://www.ssactivewear.com/p/comfort_colors/1717'),
  (14, 'Adult Red Seams Shirt (Red)', 2200, TRUE, ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'], 'https://www.ssactivewear.com/p/paragon/200'),
  (15, 'Adult Hooded SPF Long Sleeve (Heathered Grey)', 2500, TRUE, ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'], 'https://www.ssactivewear.com/p/paragon/220'),
  (16, 'Raptors Fitted Team Hat Black and Red', 2000, TRUE, ARRAY['AXS', 'AS', 'AM', 'AL', 'AXL'], 'https://baseball.epicsports.com/prod/117532/the-game-gb998-perforated-gamechanger-cap.html'),
  (17, 'Snapback Raptors Hat - Black and White', 2000, TRUE, ARRAY['Adjustable'], 'https://www.ssactivewear.com/p/yp_classics/6606'),
  (18, 'Raptors Dad Hat - Black and White', 2000, TRUE, NULL, NULL),
  (19, 'Raptors Gray Hoodie Sweatshirt', 4000, TRUE, NULL, NULL)
ON CONFLICT (number) DO UPDATE
SET name = EXCLUDED.name,
    "costCents" = EXCLUDED."costCents",
    active = EXCLUDED.active,
    sizes = EXCLUDED.sizes,
    link = EXCLUDED.link;
