import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Plus, Trash2, Scale } from 'lucide-react';
import { weightsApi, userApi, getLocalISOString, type Weight, type User } from '../api/client';
import { useToast } from '../components/Toast';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

export default function WeightPage() {
  const [records, setRecords] = useState<Weight[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const [weightsData, userData] = await Promise.all([
        weightsApi.list(30),
        userApi.get(),
      ]);
      setRecords(weightsData);
      setUser(userData);
    } catch (err) {
      console.error('Failed to load data:', err);
      showToast('error', '加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateBMI = (weight: number, heightCm: number) => {
    const heightM = heightCm / 100;
    return Number((weight / (heightM * heightM)).toFixed(1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(inputWeight);
    if (isNaN(weight) || weight <= 0) {
      showToast('error', '请输入有效的体重');
      return;
    }

    setSaving(true);
    try {
      await weightsApi.create({
        weight_kg: weight,
        body_fat_pct: null,
        recorded_at: getLocalISOString(),
        notes: null,
      });
      setInputWeight('');
      setShowInput(false);
      showToast('success', '体重已记录 ⚖️');
      loadData();
    } catch (err) {
      console.error('Failed to save weight:', err);
      showToast('error', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await weightsApi.delete(id);
      showToast('success', '已删除');
      loadData();
    } catch (err) {
      console.error('Failed to delete:', err);
      showToast('error', '删除失败');
    }
    setDeleteConfirm(null);
  };

  const targetWeight = user?.target_weight_kg || 70;
  const userHeight = user?.height_cm || 175;

  const latestWeight = records.length > 0 ? records[0].weight_kg : null;
  const oldestWeight = records.length > 0 ? records[records.length - 1].weight_kg : null;
  const weightChange = latestWeight && oldestWeight ? (latestWeight - oldestWeight).toFixed(1) : null;
  const toGoal = latestWeight ? (latestWeight - targetWeight).toFixed(1) : null;

  // 图表数据（按时间正序）
  const chartData = [...records].reverse().map(r => ({
    date: r.recorded_at.slice(5, 10),
    weight: r.weight_kg,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

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
            Number(weightChange) < 0 ? 'text-green-600' : Number(weightChange) > 0 ? 'text-red-500' : 'text-gray-800'
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
      {chartData.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">体重趋势</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                  label={{ value: '目标', fill: '#22c55e', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Scale}
          iconColor="text-primary-500"
          title="开始追踪体重"
          description="记录体重，查看变化趋势"
          action={{
            label: '记录体重',
            onClick: () => setShowInput(true),
          }}
        />
      )}

      {/* 记录列表 */}
      {records.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">历史记录</h2>
          <div className="space-y-2">
            {records.slice(0, 10).map((record) => (
              <div key={record.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 animate-fade-in">
                <span className="text-gray-600">{record.recorded_at.slice(0, 10)}</span>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-semibold text-gray-800">{record.weight_kg} kg</span>
                    <span className="text-sm text-gray-500 ml-2">
                      BMI {calculateBMI(record.weight_kg, userHeight)}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(record.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 删除确认 */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="删除记录"
        message="确定要删除这条体重记录吗？"
        confirmText="删除"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* 输入弹窗 */}
      {showInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in">
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
                  placeholder={latestWeight ? `上次: ${latestWeight}` : "例如: 75.5"}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInput(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:bg-gray-300 transition-colors"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 添加按钮 */}
      <button
        onClick={() => setShowInput(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
