-- Update token packages: multi-tier USD pricing for Stripe checkout
-- Also add stripe_price_id column for linking to Stripe Price objects

ALTER TABLE token_packages ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

DELETE FROM token_packages;

INSERT INTO token_packages (name_en, name_ko, tokens, price_cents, price_currency, sort_order, stripe_price_id) VALUES
  ('Starter',      '스타터',      100,   500, 'USD', 1, NULL),
  ('Professional', '프로페셔널',  500,  2000, 'USD', 2, NULL),
  ('Business',     '비즈니스',   2000,  6900, 'USD', 3, NULL),
  ('Enterprise',   '엔터프라이즈', 5000, 14900, 'USD', 4, NULL);
