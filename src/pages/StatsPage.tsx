import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, Calendar } from 'lucide-react';

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  // TODO: 从 API 获取数据
  const weightData = [
    { date: '01-24', weight: 77.0 },
    { date: '01-25', weight: 76.5 },
    { date: '01-26', weight: 76.8 },
    { date: '01-27', weight: 76.2 },
    { date: '01-28', weight: 75.8 },
    { date: '01-29', weight: 75.5 },
    { date: '01-30', weight: 75.3 },
  ];

  const calorieData = [
    { date: '01-24', intake: 1800, burn: 400 },
    { date: '01-25', intake: 2100, burn: 300 },
    { date: '01-26', intake: 1600, burn: 500 },
    { date: '01-27', intake: 1900, burn: 350 },
    { date: '01-28', intake: 2200, burn: 600 },
    { date: '01-29', intake: 1700, burn: 400 },
    { date: '01-30', intake: 1500, burn: 380 },
  ];

  // 计算统计数据
  const startWeight = weightData[0]?.weight || 0;
  const currentWeight = weightData[weightData.length - 1]?.weight || 0;
  const weightLost = (startWeight - currentWeight).toFixed(1);
  const targetWeight = 70;
  const progress = ((startWeight - currentWeight) / (startWeight - targetWeight) * 100).toFixed(0);
  const avgCalorieIntake = Math.round(calorieData.reduce((sum, d) => sum + d.intake, 0) / calorieData.length);
  const avgCalorieBurn = Math.round(calorieData.reduce((sum, d) => sum + d.burn, 0) / calorieData.length);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">数据统计</h1>

      {/* 时间范围选择 */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {range === 'week' ? '本周' : range === 'month' ? '本月' : '全部'}
          </button>
        ))}
      </div>

      {/* 进度概览 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">减重进度</h2>
        <div className="text-center mb-4">
          <p className="text-5xl font-bold text-primary-500">{progress}%</p>
          <p className="text-sm text-gray-500 mt-1">距离目标</p>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all"
            style={{ width: `${Math.min(Number(progress), 100)}%` }}
          />
        </div>
        <div className="grid grid-cols-3 text-center text-sm">
          <div>
            <p className="text-gray-500">起始</p>
            <p className="font-semibold text-gray-800">{startWeight}kg</p>
          </div>
          <div>
            <p className="text-gray-500">当前</p>
            <p className="font-semibold text-primary-600">{currentWeight}kg</p>
          </div>
          <div>
            <p className="text-gray-500">目标</p>
            <p className="font-semibold text-gray-800">{targetWeight}kg</p>
          </div>
        </div>
      </div>

      {/* 关键数据 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">已减重</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{weightLost} kg</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">坚持天数</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{weightData.length} 天</p>
        </div>
      </div>

      {/* 体重趋势图 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">体重趋势</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis domain={['auto', 'auto']} stroke="#888" fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                name="体重(kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 卡路里对比图 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">卡路里摄入 vs 消耗</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="intake" fill="#f97316" name="摄入" radius={[4, 4, 0, 0]} />
              <Bar dataKey="burn" fill="#22c55e" name="消耗" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-around mt-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">平均摄入</p>
            <p className="font-semibold text-orange-500">{avgCalorieIntake} kcal</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">平均消耗</p>
            <p className="font-semibold text-green-500">{avgCalorieBurn} kcal</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">热量缺口</p>
            <p className="font-semibold text-primary-500">{avgCalorieIntake - avgCalorieBurn} kcal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
