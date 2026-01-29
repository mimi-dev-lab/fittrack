import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Utensils, Dumbbell, Flame } from 'lucide-react';
import { statsApi, userApi, exercisesApi, getLocalDateString, type StatsOverview, type User } from '../api/client';

export default function HomePage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [workoutDone, setWorkoutDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, userData, exercisesData] = await Promise.all([
          statsApi.overview(),
          userApi.get(),
          exercisesApi.list(getLocalDateString()),
        ]);
        setStats(statsData);
        setUser(userData);
        setWorkoutDone(exercisesData.length > 0);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // BMI 计算
  const bmi = stats?.current_weight && user?.height_cm
    ? (stats.current_weight / Math.pow(user.height_cm / 100, 2)).toFixed(1)
    : null;

  const calorieGoal = user?.daily_calorie_goal || 2000;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 日期显示 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">FitTrack</h1>
        <p className="text-gray-500 mt-1">{today}</p>
      </div>

      {/* 体重卡片 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">当前体重</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats?.current_weight ? `${stats.current_weight} kg` : '未记录'}
              </p>
            </div>
          </div>
          {bmi && (
            <div className="text-right">
              <p className="text-sm text-gray-500">BMI</p>
              <p className="text-lg font-semibold text-gray-700">{bmi}</p>
            </div>
          )}
        </div>
        {stats?.weight_change_7d && (
          <p className={`mt-2 text-sm ${Number(stats.weight_change_7d) < 0 ? 'text-green-600' : 'text-red-500'}`}>
            7天变化: {Number(stats.weight_change_7d) > 0 ? '+' : ''}{stats.weight_change_7d} kg
          </p>
        )}
        <Link
          to="/weight"
          className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700"
        >
          {stats?.current_weight ? '查看趋势 →' : '记录体重 →'}
        </Link>
      </div>

      {/* 卡路里卡片 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">今日卡路里</p>
            <p className="text-xl font-bold text-gray-800">
              {stats?.today_calories_in || 0} <span className="text-sm font-normal text-gray-500">摄入</span>
              {' / '}
              {stats?.today_calories_out || 0} <span className="text-sm font-normal text-gray-500">消耗</span>
            </p>
          </div>
        </div>
        {/* 进度条 */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full transition-all"
            style={{ width: `${Math.min(((stats?.today_calories_in || 0) / calorieGoal) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">目标: {calorieGoal} kcal</p>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          to="/weight"
          className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
        >
          <Scale className="w-8 h-8 text-primary-500" />
          <span className="text-sm text-gray-600">记录体重</span>
        </Link>
        <Link
          to="/meals"
          className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
        >
          <Utensils className="w-8 h-8 text-orange-500" />
          <span className="text-sm text-gray-600">记录饮食</span>
        </Link>
        <Link
          to="/workout"
          className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
        >
          <Dumbbell className="w-8 h-8 text-blue-500" />
          <span className="text-sm text-gray-600">记录运动</span>
        </Link>
      </div>

      {/* 运动状态 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              workoutDone ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Dumbbell className={`w-6 h-6 ${
                workoutDone ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日运动</p>
              <p className={`text-lg font-semibold ${
                workoutDone ? 'text-green-600' : 'text-gray-400'
              }`}>
                {workoutDone ? '已完成 ✓' : '未运动'}
              </p>
            </div>
          </div>
          <Link
            to="/workout"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {workoutDone ? '查看详情' : '去运动'}
          </Link>
        </div>
      </div>
    </div>
  );
}
