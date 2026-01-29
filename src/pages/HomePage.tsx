import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Utensils, Dumbbell, Flame } from 'lucide-react';

export default function HomePage() {
  const [todayData, setTodayData] = useState({
    weight: null as number | null,
    bmi: null as number | null,
    caloriesIn: 0,
    caloriesOut: 0,
    workoutDone: false,
  });

  // TODO: 从 API 获取今日数据
  useEffect(() => {
    // 模拟数据
    setTodayData({
      weight: 75.5,
      bmi: 24.2,
      caloriesIn: 1200,
      caloriesOut: 350,
      workoutDone: true,
    });
  }, []);

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

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
              <p className="text-sm text-gray-500">今日体重</p>
              <p className="text-2xl font-bold text-gray-800">
                {todayData.weight ? `${todayData.weight} kg` : '未记录'}
              </p>
            </div>
          </div>
          {todayData.bmi && (
            <div className="text-right">
              <p className="text-sm text-gray-500">BMI</p>
              <p className="text-lg font-semibold text-gray-700">{todayData.bmi}</p>
            </div>
          )}
        </div>
        <Link
          to="/weight"
          className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700"
        >
          {todayData.weight ? '查看趋势 →' : '记录体重 →'}
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
              {todayData.caloriesIn} <span className="text-sm font-normal text-gray-500">摄入</span>
              {' / '}
              {todayData.caloriesOut} <span className="text-sm font-normal text-gray-500">消耗</span>
            </p>
          </div>
        </div>
        {/* 进度条 */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full transition-all"
            style={{ width: `${Math.min((todayData.caloriesIn / 2000) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">目标: 2000 kcal</p>
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
              todayData.workoutDone ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Dumbbell className={`w-6 h-6 ${
                todayData.workoutDone ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日运动</p>
              <p className={`text-lg font-semibold ${
                todayData.workoutDone ? 'text-green-600' : 'text-gray-400'
              }`}>
                {todayData.workoutDone ? '已完成 ✓' : '未运动'}
              </p>
            </div>
          </div>
          <Link
            to="/workout"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {todayData.workoutDone ? '查看详情' : '去运动'}
          </Link>
        </div>
      </div>
    </div>
  );
}
