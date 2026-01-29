import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { TrendingDown, Calendar, Target, Flame, BarChart3 } from 'lucide-react';
import { statsApi, userApi, type User } from '../api/client';
import EmptyState from '../components/EmptyState';

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [user, setUser] = useState<User | null>(null);
  const [weightData, setWeightData] = useState<{ date: string; weight: number }[]>([]);
  const [calorieData, setCalorieData] = useState<{ date: string; intake: number; burn: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
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
          burn: 0,
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
  const calorieGoal = user?.daily_calorie_goal || 2000;
  
  // 进度计算（考虑增重和减重两种情况）
  const isLosing = startWeight > targetWeight;
  const totalToChange = Math.abs(startWeight - targetWeight);
  const actualChange = Math.abs(startWeight - currentWeight);
  const progress = totalToChange > 0 && startWeight > 0
    ? Math.min(Math.round((actualChange / totalToChange) * 100), 100)
    : 0;
    
  const avgCalorieIntake = calorieData.length > 0
    ? Math.round(calorieData.reduce((sum, d) => sum + d.intake, 0) / calorieData.length)
    : 0;

  // 计算本周/本月平均
  const avgWeight = weightData.length > 0
    ? (weightData.reduce((sum, d) => sum + d.weight, 0) / weightData.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const hasData = weightData.length > 0 || calorieData.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">数据统计</h1>

      {/* 时间范围选择 */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {range === 'week' ? '本周' : range === 'month' ? '本月' : '全部'}
          </button>
        ))}
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          iconColor="text-indigo-400"
          title="暂无统计数据"
          description="开始记录体重和饮食后，这里会显示统计图表"
        />
      ) : (
        <>
          {/* 进度概览 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                {isLosing ? '减重进度' : '增重进度'}
              </h2>
            </div>
            <div className="text-center mb-4">
              <p className="text-5xl font-bold text-primary-500">{progress}%</p>
              <p className="text-sm text-gray-500 mt-1">距离目标</p>
            </div>
            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
              {/* 目标标记 */}
              <div className="absolute top-0 right-0 h-full w-1 bg-primary-700" />
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
                <TrendingDown className={`w-5 h-5 ${Number(weightLost) > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-500">已{isLosing ? '减' : '增'}重</span>
              </div>
              <p className={`text-2xl font-bold ${Number(weightLost) > 0 ? 'text-green-500' : 'text-gray-400'}`}>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">体重趋势</h2>
                {avgWeight && (
                  <span className="text-sm text-gray-500">
                    平均 <span className="font-medium text-gray-700">{avgWeight}kg</span>
                  </span>
                )}
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                    <YAxis domain={['auto', 'auto']} stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value) => [`${value} kg`, '体重']}
                    />
                    <ReferenceLine
                      y={targetWeight}
                      stroke="#22c55e"
                      strokeDasharray="5 5"
                      label={{ value: '目标', fill: '#22c55e', fontSize: 12, position: 'right' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-gray-800">每日摄入</h2>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calorieData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <ReferenceLine
                      y={calorieGoal}
                      stroke="#f97316"
                      strokeDasharray="5 5"
                      label={{ value: '目标', fill: '#f97316', fontSize: 12, position: 'right' }}
                    />
                    <Legend />
                    <Bar dataKey="intake" fill="#f97316" name="摄入(kcal)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">平均摄入</p>
                  <p className="font-semibold text-orange-500 text-xl">{avgCalorieIntake} kcal</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">每日目标</p>
                  <p className="font-semibold text-gray-700 text-xl">{calorieGoal} kcal</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
