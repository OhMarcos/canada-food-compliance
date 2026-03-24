-- Update token economics:
--   Free signup: 150 → 30
--   Referral: 75/50 → 60/60
--   Packages: single tier — 30 tokens / $5

-- 1. Update the signup trigger to grant 30 tokens
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, avatar_url, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    generate_referral_code()
  );

  INSERT INTO user_token_balances (user_id, balance, total_earned)
  VALUES (NEW.id, 30, 30);

  INSERT INTO token_transactions (user_id, transaction_type, amount, balance_after, description)
  VALUES (NEW.id, 'signup_bonus', 30, 30, 'Welcome bonus — 30 free tokens');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Replace packages: remove old, insert single tier
DELETE FROM token_packages;

INSERT INTO token_packages (name_en, name_ko, tokens, price_cents, sort_order) VALUES
  ('Token Pack', '토큰 팩', 30, 500, 1);
