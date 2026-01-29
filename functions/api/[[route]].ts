import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// CORS 设置
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://fittrack.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// ============ 用户设置 ============
app.get('/user', async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind('default').first();
  
  if (!result) {
    await c.env.DB.prepare(
      'INSERT INTO users (id) VALUES (?)'
    ).bind('default').run();
    return c.json({ id: 'default', height_cm: null, target_weight_kg: null, daily_calorie_goal: null });
  }
  return c.json(result);
});

app.put('/user', async (c) => {
  const body = await c.req.json();
  const { height_cm, target_weight_kg, daily_calorie_goal } = body;
  
  await c.env.DB.prepare(`
    INSERT INTO users (id, height_cm, target_weight_kg, daily_calorie_goal)
    VALUES ('default', ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      height_cm = excluded.height_cm,
      target_weight_kg = excluded.target_weight_kg,
      daily_calorie_goal = excluded.daily_calorie_goal,
      updated_at = datetime('now')
  `).bind(height_cm, target_weight_kg, daily_calorie_goal).run();
  
  return c.json({ success: true });
});

// ============ 体重记录 ============
app.get('/weights', async (c) => {
  const limit = c.req.query('limit') || '30';
  const results = await c.env.DB.prepare(
    'SELECT * FROM weights ORDER BY recorded_at DESC LIMIT ?'
  ).bind(parseInt(limit)).all();
  return c.json(results.results);
});

app.post('/weights', async (c) => {
  const body = await c.req.json();
  const { weight_kg, body_fat_pct, recorded_at, notes } = body;
  
  const result = await c.env.DB.prepare(`
    INSERT INTO weights (weight_kg, body_fat_pct, recorded_at, notes)
    VALUES (?, ?, ?, ?)
  `).bind(weight_kg, body_fat_pct || null, recorded_at, notes || null).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

app.delete('/weights/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM weights WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// ============ 饮食记录 ============
app.get('/meals', async (c) => {
  const date = c.req.query('date');
  const limit = c.req.query('limit') || '50';
  
  let query = 'SELECT * FROM meals';
  const params: (string | number)[] = [];
  
  if (date) {
    query += ' WHERE recorded_at LIKE ?';
    params.push(`${date}%`);
  }
  query += ' ORDER BY recorded_at DESC LIMIT ?';
  params.push(parseInt(limit));
  
  const stmt = c.env.DB.prepare(query);
  const results = await stmt.bind(...params).all();
  return c.json(results.results);
});

app.post('/meals', async (c) => {
  const body = await c.req.json();
  const { meal_type, description, calories, protein_g, carbs_g, fat_g, recorded_at, notes } = body;
  
  const result = await c.env.DB.prepare(`
    INSERT INTO meals (meal_type, description, calories, protein_g, carbs_g, fat_g, recorded_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(meal_type, description, calories || null, protein_g || null, carbs_g || null, fat_g || null, recorded_at, notes || null).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

app.delete('/meals/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM meals WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// ============ 运动记录 ============
app.get('/exercises', async (c) => {
  const date = c.req.query('date');
  const type = c.req.query('type');
  const limit = c.req.query('limit') || '50';
  
  let query = 'SELECT * FROM exercises WHERE 1=1';
  const params: (string | number)[] = [];
  
  if (date) {
    query += ' AND recorded_at LIKE ?';
    params.push(`${date}%`);
  }
  if (type) {
    query += ' AND exercise_type = ?';
    params.push(type);
  }
  query += ' ORDER BY recorded_at DESC LIMIT ?';
  params.push(parseInt(limit));
  
  const stmt = c.env.DB.prepare(query);
  const results = await stmt.bind(...params).all();
  return c.json(results.results);
});

app.post('/exercises', async (c) => {
  const body = await c.req.json();
  const { 
    exercise_type, name, duration_min, calories_burned,
    sets, reps, weight_kg, distance_km, avg_heart_rate,
    recorded_at, notes 
  } = body;
  
  const result = await c.env.DB.prepare(`
    INSERT INTO exercises (
      exercise_type, name, duration_min, calories_burned,
      sets, reps, weight_kg, distance_km, avg_heart_rate,
      recorded_at, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    exercise_type, name, duration_min || null, calories_burned || null,
    sets || null, reps || null, weight_kg || null, 
    distance_km || null, avg_heart_rate || null,
    recorded_at, notes || null
  ).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

app.delete('/exercises/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM exercises WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// ============ 统计 API ============
// 获取指定时区的今天日期 (YYYY-MM-DD)
function getTodayInTimezone(tz: string = 'Asia/Tokyo'): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: tz });
}

app.get('/stats/overview', async (c) => {
  // 使用 Asia/Tokyo 时区来确定"今天"
  const tz = c.req.query('tz') || 'Asia/Tokyo';
  const today = getTodayInTimezone(tz);
  
  const todayCalories = await c.env.DB.prepare(`
    SELECT COALESCE(SUM(calories), 0) as total
    FROM meals WHERE recorded_at LIKE ?
  `).bind(`${today}%`).first();
  
  const todayBurned = await c.env.DB.prepare(`
    SELECT COALESCE(SUM(calories_burned), 0) as total
    FROM exercises WHERE recorded_at LIKE ?
  `).bind(`${today}%`).first();
  
  const latestWeight = await c.env.DB.prepare(`
    SELECT weight_kg, recorded_at FROM weights 
    ORDER BY recorded_at DESC LIMIT 1
  `).first();
  
  const weekAgoDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekAgo = weekAgoDate.toLocaleDateString('sv-SE', { timeZone: tz });
  const weekAgoWeight = await c.env.DB.prepare(`
    SELECT weight_kg FROM weights 
    WHERE recorded_at <= ? ORDER BY recorded_at DESC LIMIT 1
  `).bind(weekAgo).first();
  
  return c.json({
    today_calories_in: todayCalories?.total || 0,
    today_calories_out: todayBurned?.total || 0,
    current_weight: latestWeight?.weight_kg || null,
    weight_change_7d: latestWeight && weekAgoWeight 
      ? ((latestWeight.weight_kg as number) - (weekAgoWeight.weight_kg as number)).toFixed(1)
      : null
  });
});

app.get('/stats/weight-trend', async (c) => {
  const days = c.req.query('days') || '30';
  const results = await c.env.DB.prepare(`
    SELECT weight_kg, body_fat_pct, recorded_at 
    FROM weights 
    ORDER BY recorded_at DESC 
    LIMIT ?
  `).bind(parseInt(days)).all();
  return c.json(results.results.reverse());
});

app.get('/stats/nutrition-trend', async (c) => {
  const days = c.req.query('days') || '7';
  const results = await c.env.DB.prepare(`
    SELECT 
      DATE(recorded_at) as date,
      SUM(calories) as total_calories,
      SUM(protein_g) as total_protein,
      SUM(carbs_g) as total_carbs,
      SUM(fat_g) as total_fat
    FROM meals 
    GROUP BY DATE(recorded_at)
    ORDER BY date DESC 
    LIMIT ?
  `).bind(parseInt(days)).all();
  return c.json(results.results.reverse());
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export const onRequest = handle(app);
