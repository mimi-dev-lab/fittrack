-- FitTrack Database Schema

-- 用户设置
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT 'default',
  height_cm REAL,
  target_weight_kg REAL,
  daily_calorie_goal INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 体重记录
CREATE TABLE IF NOT EXISTS weights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'default',
  weight_kg REAL NOT NULL,
  body_fat_pct REAL,
  recorded_at TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 饮食记录
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'default',
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description TEXT NOT NULL,
  calories INTEGER,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  recorded_at TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 运动记录
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'default',
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('strength', 'cardio')),
  name TEXT NOT NULL,
  duration_min INTEGER,
  calories_burned INTEGER,
  -- 力量训练专用
  sets INTEGER,
  reps INTEGER,
  weight_kg REAL,
  -- 有氧训练专用
  distance_km REAL,
  avg_heart_rate INTEGER,
  recorded_at TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_weights_recorded_at ON weights(recorded_at);
CREATE INDEX IF NOT EXISTS idx_meals_recorded_at ON meals(recorded_at);
CREATE INDEX IF NOT EXISTS idx_exercises_recorded_at ON exercises(recorded_at);
