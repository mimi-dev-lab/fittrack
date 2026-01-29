// 体重记录
export interface WeightRecord {
  id?: number;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  bmi?: number; // 自动计算
  createdAt?: string;
}

// 饮食记录
export interface MealRecord {
  id?: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number;
  protein?: number; // g
  carbs?: number; // g
  fat?: number; // g
  createdAt?: string;
}

// 运动记录
export interface WorkoutRecord {
  id?: number;
  date: string;
  type: 'strength' | 'cardio';
  name: string;
  duration: number; // 分钟
  caloriesBurned?: number;
  // 力量训练专用
  sets?: number;
  reps?: number;
  weight?: number; // kg
  // 有氧专用
  distance?: number; // km
  pace?: string; // min/km
  createdAt?: string;
}

// 用户设置
export interface UserSettings {
  height: number; // cm
  targetWeight: number; // kg
  dailyCalorieGoal: number;
  startDate: string;
}

// 每日汇总
export interface DailySummary {
  date: string;
  weight?: number;
  bmi?: number;
  totalCaloriesIn: number;
  totalCaloriesOut: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  workoutCount: number;
}
