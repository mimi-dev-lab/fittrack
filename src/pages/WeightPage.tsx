import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus } from 'lucide-react';
import type { WeightRecord } from '../types';

export default function WeightPage() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [userHeight] = useState(175); // TODO: 从设置获取
  const [targetWeight] = useState(70); // TODO: 从设置获取

  // TODO: 从 API 获取数据
  useEffect(() => {
    // 模拟数据
    const mockData: WeightRecord[] = [
      { id: 1, date: '2026-01-24', weight: 77.0, bmi: 25.1 },
      { id: 2, date: '2026-01-25', weight: 76.5, bmi: 25.0 },
      { id: 3, date: '2026-01-26', weight: 76.8, bmi: 25.1 },
      { id: 4, date: '2026-01-27', weight: 76.2, bmi: 24.9 },
      { id: 5, date: '2026-01-28', weight: 75.8, bmi: 24.7 },
      { id: 6, date: '2026-01-29', weight: 75.5, bmi: 24.6 },
    ];
    setRecords(mockData);
  }, []);

  const calculateBMI = (weight: number, heightCm: number) => {
    const heightM = heightCm / 100;
    return Number((weight / (heightM * heightM)).toFixed(1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(inputWeight);
    if (isNaN(weight) || weight <= 0) return;

    const today = new Date().toISOString().split('T')[0];
    const bmi = calculateBMI(weight, userHeight);
    
    const newRecord: WeightRecord = {
      id: Date.now(),
      date: today,
      weight,
      bmi,
    };

    // TODO: 发送到 API
    setRecords([...records, newRecord]);
    setInputWeight('');
    setShowInput(false);
  };

  const latestWeight = records.length > 0 ? records[records.length - 1].weight : null;
  const firstWeight = records.length > 0 ? records[0].weight : null;
  const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null;
  const toGoal = latestWeight ? (latestWeight - targetWeight).toFixed(1) : null;

  const chartData = records.map(r => ({
    date: r.date.slice(5), // MM-DD
    weight: r.weight,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">体重追踪</h1>

      {/* 当前状态卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-sm text-gray-500">当前体重</p>
          <p className="text-xl font-bold text-gray-800">
            {latestWeight ? `${latestWeight}kg` : '-'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-sm text-gray-500">变化</p>
          <p className={`text-xl font-bold ${
            Number(weightChange) < 0 ? 'text-green-600' : 'text-red-500'
          }`}>
            {weightChange ? `${Number(weightChange) > 0 ? '+' : ''}${weightChange}kg` : '-'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-sm text-gray-500">距目标</p>
          <p className="text-xl font-bold text-primary-600">
            {toGoal ? `${toGoal}kg` : '-'}
          </p>
        </div>
      </div>

      {/* 图表 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">体重趋势</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis domain={['auto', 'auto']} stroke="#888" fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 记录列表 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">历史记录</h2>
        <div className="space-y-2">
          {[...records].reverse().slice(0, 7).map((record) => (
            <div key={record.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-600">{record.date}</span>
              <div className="text-right">
                <span className="font-semibold text-gray-800">{record.weight} kg</span>
                <span className="text-sm text-gray-500 ml-2">BMI {record.bmi}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 输入弹窗 */}
      {showInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">记录今日体重</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如: 75.5"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInput(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 添加按钮 */}
      <button
        onClick={() => setShowInput(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
