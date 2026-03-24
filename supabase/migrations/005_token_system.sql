-- ============================================
-- Token/Credit System
-- ============================================

-- 1. User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ko')),
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Token balances
CREATE TABLE user_token_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Transaction ledger (immutable)
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'signup_bonus', 'referral_bonus', 'purchase', 'spend', 'admin_adjustment'
  )),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL,
  api_endpoint TEXT,
  referral_user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Token packages (configurable pricing)
CREATE TABLE token_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  price_currency TEXT NOT NULL DEFAULT 'CAD',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. API endpoint costs (configurable)
CREATE TABLE api_token_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  cost_per_request INTEGER NOT NULL CHECK (cost_per_request > 0),
  description_en TEXT NOT NULL,
  description_ko TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code);
CREATE INDEX idx_user_profiles_referred_by ON user_profiles(referred_by);
CREATE INDEX idx_token_balances_user ON user_token_balances(user_id);
CREATE INDEX idx_token_transactions_user_time ON token_transactions(user_id, created_at DESC);
CREATE INDEX idx_token_transactions_type ON token_transactions(transaction_type);

-- ============================================
-- Functions
-- ============================================

-- Generate unique referral codes (CB + 8 hex chars)
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CB' || UPPER(substring(encode(gen_random_bytes(4), 'hex'), 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Atomic token spending with row-level lock
CREATE OR REPLACE FUNCTION spend_user_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_endpoint TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic token adding with row-level lock
CREATE OR REPLACE FUNCTION add_user_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: auto-create profile + grant tokens on signup
-- ============================================
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
  VALUES (NEW.id, 150, 150);

  INSERT INTO token_transactions (user_id, transaction_type, amount, balance_after, description)
  VALUES (NEW.id, 'signup_bonus', 150, 150, 'Welcome bonus — 150 free tokens');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Seed data: default token costs
-- ============================================
INSERT INTO api_token_costs (endpoint, cost_per_request, description_en, description_ko) VALUES
  ('chat', 3, 'Q&A Chat inquiry', 'Q&A 채팅 질문'),
  ('chat-stream', 3, 'Q&A Chat (streaming)', 'Q&A 채팅 (스트리밍)'),
  ('product-check', 15, 'Product label analysis', '제품 라벨 분석'),
  ('market', 2, 'Market cross-check', '시장 교차 확인'),
  ('checklist', 5, 'Compliance checklist', '컴플라이언스 체크리스트');

-- Seed data: default token packages
INSERT INTO token_packages (name_en, name_ko, tokens, price_cents, sort_order) VALUES
  ('Starter', '스타터', 500, 1900, 1),
  ('Professional', '프로페셔널', 1200, 3900, 2),
  ('Business', '비즈니스', 3000, 7900, 3),
  ('Enterprise', '엔터프라이즈', 8000, 14900, 4);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_token_costs ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can read their own balance
CREATE POLICY "Users can view own balance"
  ON user_token_balances FOR SELECT
  USING (auth.uid() = user_id);

-- Users can read their own transactions
CREATE POLICY "Users can view own transactions"
  ON token_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view active packages
CREATE POLICY "Anyone can view packages"
  ON token_packages FOR SELECT
  USING (is_active = true);

-- Anyone can view active costs
CREATE POLICY "Anyone can view costs"
  ON api_token_costs FOR SELECT
  USING (is_active = true);
