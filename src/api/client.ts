const API_BASE = import.meta.env.DEV ? 'http://localhost:8788/api' : '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}

// ============ User ============
export interface User {
  id: string;
  height_cm: number | null;
  target_weight_kg: number | null;
  daily_calorie_goal: number | null;
}

export const userApi = {
  get: () => request<User>('/user'),
  update: (data: Partial<User>) => request<{ success: boolean }>('/user', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// ============ Weights ============
export interface Weight {
  id: number;
  weight_kg: number;
  body_fat_pct: number | null;
  recorded_at: string;
  notes: string | null;
}

export const weightsApi = {
  list: (limit = 30) => request<Weight[]>(`/weights?limit=${limit}`),
  create: (data: Omit<Weight, 'id'>) => request<{ success: boolean; id: number }>('/weights', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request<{ success: boolean }>(`/weights/${id}`, {
    method: 'DELETE',
  }),
};

// ============ Meals ============
export interface Meal {
  id: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  recorded_at: string;
  notes: string | null;
}

export const mealsApi = {
  list: (date?: string, limit = 50) => {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    params.set('limit', String(limit));
    return request<Meal[]>(`/meals?${params}`);
  },
  create: (data: Omit<Meal, 'id'>) => request<{ success: boolean; id: number }>('/meals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request<{ success: boolean }>(`/meals/${id}`, {
    method: 'DELETE',
  }),
};

// ============ Exercises ============
export interface Exercise {
  id: number;
  exercise_type: 'strength' | 'cardio';
  name: string;
  duration_min: number | null;
  calories_burned: number | null;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  distance_km: number | null;
  avg_heart_rate: number | null;
  recorded_at: string;
  notes: string | null;
}

export const exercisesApi = {
  list: (date?: string, type?: 'strength' | 'cardio', limit = 50) => {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (type) params.set('type', type);
    params.set('limit', String(limit));
    return request<Exercise[]>(`/exercises?${params}`);
  },
  create: (data: Omit<Exercise, 'id'>) => request<{ success: boolean; id: number }>('/exercises', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request<{ success: boolean }>(`/exercises/${id}`, {
    method: 'DELETE',
  }),
};

// ============ Stats ============
export interface StatsOverview {
  today_calories_in: number;
  today_calories_out: number;
  current_weight: number | null;
  weight_change_7d: string | null;
}

export interface WeightTrend {
  weight_kg: number;
  body_fat_pct: number | null;
  recorded_at: string;
}

export interface NutritionTrend {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export const statsApi = {
  overview: () => request<StatsOverview>('/stats/overview'),
  weightTrend: (days = 30) => request<WeightTrend[]>(`/stats/weight-trend?days=${days}`),
  nutritionTrend: (days = 7) => request<NutritionTrend[]>(`/stats/nutrition-trend?days=${days}`),
};
