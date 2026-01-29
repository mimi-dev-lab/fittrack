import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Utensils, Dumbbell, Flame, TrendingDown, TrendingUp, Minus, Settings } from 'lucide-react';
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

  // BMI 分类
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: '偏瘦', color: 'text-blue-500' };
    if (bmi < 24) return { label: '正常', color: 'text-green-500' };
    if (bmi < 28) return { label: '偏胖', color: 'text-yellow-500' };
    return { label: '肥胖', color: 'text-red-500' };
  };

  const calorieGoal = user?.daily_calorie_goal || 2000;
  const calorieIntake = stats?.today_calories_in || 0;
  const calorieProgress = Math.min((calorieIntake / calorieGoal) * 100, 100);

  // 体重变化趋势图标
  const getWeightTrendIcon = () => {
    if (!stats?.weight_change_7d) return <Minus className="w-4 h-4 text-gray-400" />;
    const change = Number(stats.weight_change_7d);
    if (change < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div className="w-10" /> {/* 占位 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">FitTrack</h1>
          <p className="text-gray-500 mt-1">{today}</p>
        </div>
        <Link 
          to="/settings" 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-500" />
        </Link>
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
              <p className={`text-xs ${getBMICategory(Number(bmi)).color}`}>
                {getBMICategory(Number(bmi)).label}
              </p>
            </div>
          )}
        </div>
        {stats?.weight_change_7d && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            {getWeightTrendIcon()}
            <span className={Number(stats.weight_change_7d) < 0 ? 'text-green-600' : Number(stats.weight_change_7d) > 0 ? 'text-red-500' : 'text-gray-500'}>
              7天变化: {Number(stats.weight_change_7d) > 0 ? '+' : ''}{stats.weight_change_7d} kg
            </span>
          </div>
        )}
        <Link
          to="/weight"
          className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
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
          <div className="flex-1">
            <p className="text-sm text-gray-500">今日卡路里</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-800">{calorieIntake}</span>
              <span className="text-sm text-gray-500">/ {calorieGoal} kcal</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">消耗</p>
            <p className="text-lg font-semibold text-orange-500">{stats?.today_calories_out || 0}</p>
          </div>
        </div>
        {/* 进度条 */}
        <div className="relative">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                calorieProgress >= 100 ? 'bg-red-400' : calorieProgress >= 80 ? 'bg-yellow-400' : 'bg-orange-400'
              }`}
              style={{ width: `${calorieProgress}%` }}
            />
          </div>
          <span className="absolute right-0 -top-5 text-xs text-gray-500">{calorieProgress.toFixed(0)}%</span>
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>净摄入: {calorieIntake - (stats?.today_calories_out || 0)} kcal</span>
          <span>剩余: {Math.max(calorieGoal - calorieIntake, 0)} kcal</span>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          to="/weight"
          className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md active:scale-98 transition-all"
        >
          <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
            <Scale className="w-6 h-6 text-primary-500" />
          </div>
          <span className="text-sm text-gray-600">记录体重</span>
        </Link>
        <Link
          to="/meals"
          className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md active:scale-98 transition-all"
        >
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
            <Utensils className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-sm text-gray-600">记录饮食</span>
        </Link>
        <Link
          to="/workout"
          className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md active:scale-98 transition-all"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-blue-500" />
          </div>
          <span className="text-sm text-gray-600">记录运动</span>
        </Link>
      </div>

      {/* 运动状态 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              workoutDone ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Dumbbell className={`w-6 h-6 transition-colors ${
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              workoutDone 
                ? 'text-gray-600 hover:bg-gray-100' 
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {workoutDone ? '查看详情' : '去运动'}
          </Link>
        </div>
      </div>

      {/* 激励语 */}
      <div className="text-center text-sm text-gray-400 py-2">
        💪 坚持就是胜利！
      </div>
    </div>
  );
}
