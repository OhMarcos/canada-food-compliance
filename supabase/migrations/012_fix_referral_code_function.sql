-- Fix: generate_referral_code uses gen_random_bytes which lives in extensions schema
-- Use md5(random()) instead, which is always available

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'CB' || UPPER(substring(md5(random()::text), 1, 8));
END;
$$;

-- Now restore the full trigger with all three inserts
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Clean up orphaned test data
DELETE FROM user_profiles WHERE email = 'hardcoded@test.com';
