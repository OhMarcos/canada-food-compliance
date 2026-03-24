-- Fix: add explicit search_path to all SECURITY DEFINER functions
-- Supabase triggers on auth.users need search_path = public to find tables

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

CREATE OR REPLACE FUNCTION spend_user_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_endpoint TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  SELECT balance INTO v_balance
  FROM user_token_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  v_new_balance := v_balance - p_amount;

  UPDATE user_token_balances
  SET balance = v_new_balance,
      total_spent = total_spent + p_amount,
      last_activity = now(),
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO token_transactions (user_id, transaction_type, amount, balance_after, description, api_endpoint)
  VALUES (p_user_id, 'spend', -p_amount, v_new_balance, COALESCE(p_description, p_endpoint || ' usage'), p_endpoint);

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION add_user_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  SELECT balance INTO v_balance
  FROM user_token_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RETURN FALSE;
  END IF;

  v_new_balance := v_balance + p_amount;

  UPDATE user_token_balances
  SET balance = v_new_balance,
      total_earned = total_earned + p_amount,
      last_activity = now(),
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO token_transactions (user_id, transaction_type, amount, balance_after, description, metadata)
  VALUES (p_user_id, p_transaction_type, p_amount, v_new_balance, p_description, p_metadata);

  RETURN TRUE;
END;
$$;
