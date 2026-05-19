-- ═══════════════════════════════════════════════════════════════════════════
-- JonJon Client Portal — Supabase Schema
-- Run this entire file in: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────
-- 1. PROFILES
--    One row per user, linked to Supabase Auth (auth.users)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'client'
              CHECK (role IN (
                'admin','team_manager','client',
                'video_editor','photographer','content_writer',
                'social_manager','campaign_manager',
                'automation_specialist','office_manager'
              )),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ─────────────────────────────────────────
-- 2. ROADMAP STAGES
--    Per-client ordered list of process milestones
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_stages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  expected_date TEXT,                          -- display string e.g. "25.04"
  status        TEXT NOT NULL DEFAULT 'locked'
                CHECK (status IN ('completed','current','upcoming','locked')),
  order_index   INTEGER NOT NULL,
  tasks         JSONB NOT NULL DEFAULT '[]',   -- string[]
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS roadmap_stages_client_order
  ON roadmap_stages (client_id, order_index);

CREATE TRIGGER roadmap_stages_updated_at
  BEFORE UPDATE ON roadmap_stages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ─────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ─────────────────────────────────────────
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_stages ENABLE ROW LEVEL SECURITY;

-- Helper: is the calling user an admin/manager?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('admin','team_manager')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- profiles: own row + admins see all
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins full access to profiles"
  ON profiles FOR ALL
  USING (is_admin());

-- roadmap_stages: client sees own, admins manage all
CREATE POLICY "Clients read own roadmap"
  ON roadmap_stages FOR SELECT
  USING (client_id = auth.uid() OR is_admin());

CREATE POLICY "Admins manage roadmap"
  ON roadmap_stages FOR ALL
  USING (is_admin());


-- ─────────────────────────────────────────
-- 4. SEED — default roadmap template
--    Call this function after creating a client profile:
--    SELECT seed_client_roadmap('<client-uuid>');
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION seed_client_roadmap(p_client_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO roadmap_stages (client_id, title, description, expected_date, status, order_index, tasks)
  VALUES
    (p_client_id, 'התחלת תהליך',           'חתימה על הסכם ותחילת העבודה המשותפת',                '01.04', 'completed', 1,  '["חתימה על הסכם","מילוי שאלון לקוח","גישה למערכת"]'),
    (p_client_id, 'פגישת אסטרטגיה ראשונה', 'הכרות מעמיקה עם העסק, קהל יעד ומטרות',              '05.04', 'completed', 2,  '["הכנת מצגת אסטרטגיה","ניתוח מתחרים","הגדרת יעדים"]'),
    (p_client_id, 'כתיבת תסריטים',          'הכנת תסריטים לסרטונים ותכני השיווק',                 '12.04', 'completed', 3,  '["כתיבת 5 תסריטים","התאמה לפלטפורמות","בניית מסרים מרכזיים"]'),
    (p_client_id, 'אישור תסריטים',           'סקירה ואישור התכנים על ידי הלקוח',                   '16.04', 'current',   4,  '["שליחת תסריטים לאישור","שיחת פידבק","אישור סופי"]'),
    (p_client_id, 'יום צילום',               'צילום כל התכנים במיקום שנקבע מראש',                  '25.04', 'upcoming',  5,  '["תיאום מיקום","הכנת ציוד","צילום 8+ סרטונים"]'),
    (p_client_id, 'עריכת סרטונים',           'עריכה מקצועית של כל הסרטונים שנצלמו',               '05.05', 'upcoming',  6,  '["עריכה ראשונית","הוספת כתוביות","עיצוב גרפי"]'),
    (p_client_id, 'אישור סרטונים',           'הלקוח צופה ומאשר את הסרטונים הסופיים',              '10.05', 'locked',    7,  '["שליחת סרטונים לצפייה","תיקונים אם נדרש","אישור סופי"]'),
    (p_client_id, 'בניית גאנט תוכן',         'תכנון לוח זמנים לפרסום התכנים בכל הפלטפורמות',      '14.05', 'locked',    8,  '["תכנון חודשי","התאמה לפלטפורמות","אישור לו״ז"]'),
    (p_client_id, 'קמפיין באוויר',           'השקת הקמפיין הפרסומי בכל הערוצים',                  '20.05', 'locked',    9,  '["העלאת תכנים","הגדרת קהלי יעד","ניהול תקציב"]'),
    (p_client_id, 'דוח ראשון',               'ניתוח ביצועים ותוצאות הקמפיין הראשון',              '10.06', 'locked',    10, '["איסוף נתונים","ניתוח ROI","הכנת דוח מסכם"]'),
    (p_client_id, 'פגישת המשך / שדרוג',      'סיכום התהליך ותכנון השלב הבא',                      '15.06', 'locked',    11, '["סקירת תוצאות","תכנון שלב ב׳","הצעת שדרוג"]')
  ON CONFLICT (client_id, order_index) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
