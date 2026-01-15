-- Seed: Items for Raptors Order Form 2026
-- Run with: supabase db reset OR supabase db seed

INSERT INTO "Item" (number, name, "costCents", active)
VALUES
  (1, 'Raptors Practice Shirt (Youth)',          1500,  TRUE),
  (2, 'Raptors Practice Shirt (Adult)',          1500,  TRUE),
  (3, 'Raptors Hoodie (Youth)',                  3500,  TRUE),
  (4, 'Raptors Hoodie (Adult)',                  3500,  TRUE),
  (5, 'Raptors Baseball Pullover (Youth)',       3500,  TRUE),
  (6, 'Raptors Baseball Pullover (Adult)',       3500,  TRUE),
  (7, 'Cap – Richardson 112 Youth',              2500,  TRUE),
  (8, 'Cap – Richardson 112 Adult',              2500,  TRUE),
  (9, 'Cap – Epic Sports AXS-AXL',               2500,  TRUE),
  (10, 'Camo Socks – Small (Youth S/M)',         1200,  TRUE),
  (11, 'Camo Socks – Medium (Youth L/Adult S)',  1200,  TRUE),
  (12, 'Camo Socks – Large (Adult M/L)',         1200,  TRUE),
  (13, 'Camo Socks – X-Large (Adult XL)',        1200,  TRUE),
  (14, 'Raptors Short Slee00 Youth', 2000, TRUE),
  (15, 'Raptors Short Sleeve – Paragon 200 Adult', 2000, TRUE),
  (16, 'Raptors Comfort Colors Tee (Adult)',     3000,  TRUE),
  (17, 'Raptors Hoodie – Paragon 220 (Adult)',   4000,  TRUE),
  (18, 'Raptors Hat – YP Classics 6606',         2500,  TRUE),
  (19, 'Raptors Hat – YP Classics 6606 Navy',    2500,  TRUE)
ON CONFLICT (number) DO UPDATE
SET name = EXCLUDED.name,
    "costCents" = EXCLUDED."costCents",
    active = EXCLUDED.active;
