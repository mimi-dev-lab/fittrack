import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, Calendar } from 'lucide-react';
import { statsApi, userApi, type User } from '../api/client';

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [user, setUser] = useState<User | null>(null);
  const [weightData, setWeightData] = useState<{ date: string; weight: number }[]>([]);
  const [calorieData, setCalorieData] = useState<{ date: string; intake: number; burn: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
        
        const [userData, weightTrend, nutritionTrend] = await Promise.all([
          userApi.get(),
          statsApi.weightTrend(days),
          statsApi.nutritionTrend(days),
        ]);
        
        setUser(userData);
        
        setWeightData(weightTrend.map(w => ({
          date: w.recorded_at.slice(5, 10),
          weight: w.weight_kg,
        })));
        
        setCalorieData(nutritionTrend.map(n => ({
          date: n.date.slice(5, 10),
          intake: n.total_calories || 0,
          burn: 0, // TODO: 从 exercises 统计
        })));
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [timeRange]);

  // 计算统计数据
  const startWeight = weightData.length > 0 ? weightData[0].weight : 0;
  const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : 0;
  const weightLost = (startWeight - currentWeight).toFixed(1);
  const targetWeight = user?.target_weight_kg || 70;
  const progress = startWeight > targetWeight 
    ? ((startWeight - currentWeight) / (startWeight - targetWeight) * 100).toFixed(0)
    : '0';
  const avgCalorieIntake = calorieData.length > 0
    ? Math.round(calorieData.reduce((sum, d) => sum + d.intake, 0) / calorieData.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

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
            <p className="font-semibold text-gray-800">{startWeight || '-'}kg</p>
          </div>
          <div>
            <p className="text-gray-500">当前</p>
            <p className="font-semibold text-primary-600">{currentWeight || '-'}kg</p>
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
          <p className={`text-2xl font-bold ${Number(weightLost) > 0 ? 'text-green-500' : 'text-gray-500'}`}>
            {Number(weightLost) > 0 ? weightLost : '0'} kg
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">记录天数</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{weightData.length} 天</p>
        </div>
      </div>

      {/* 体重趋势图 */}
      {weightData.length > 0 && (
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
      )}

      {/* 卡路里摄入图 */}
      {calorieData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">每日摄入</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="intake" fill="#f97316" name="摄入(kcal)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">平均每日摄入</p>
            <p className="font-semibold text-orange-500 text-xl">{avgCalorieIntake} kcal</p>
          </div>
        </div>
      )}

      {weightData.length === 0 && calorieData.length === 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-500">
          暂无数据，开始记录后这里会显示统计图表
        </div>
      )}
    </div>
  );
}
