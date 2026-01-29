import { useState, useEffect } from 'react';
import { Plus, Trash2, Dumbbell, Heart } from 'lucide-react';
import { exercisesApi, getLocalDateString, getLocalISOString, type Exercise } from '../api/client';

export default function WorkoutPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  // 表单状态
  const [formData, setFormData] = useState({
    exercise_type: 'strength' as Exercise['exercise_type'],
    name: '',
    duration_min: '',
    calories_burned: '',
    sets: '',
    reps: '',
    weight_kg: '',
    distance_km: '',
  });

  const loadExercises = async () => {
    try {
      const data = await exercisesApi.list(selectedDate);
      setExercises(data);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await exercisesApi.create({
        exercise_type: formData.exercise_type,
        name: formData.name,
        duration_min: formData.duration_min ? parseInt(formData.duration_min) : null,
        calories_burned: formData.calories_burned ? parseInt(formData.calories_burned) : null,
        sets: formData.sets ? parseInt(formData.sets) : null,
        reps: formData.reps ? parseInt(formData.reps) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        avg_heart_rate: null,
        recorded_at: getLocalISOString(),
        notes: null,
      });
      setFormData({
        exercise_type: 'strength',
        name: '',
        duration_min: '',
        calories_burned: '',
        sets: '',
        reps: '',
        weight_kg: '',
        distance_km: '',
      });
      setShowInput(false);
      loadExercises();
    } catch (err) {
      console.error('Failed to save exercise:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这条记录？')) return;
    try {
      await exercisesApi.delete(id);
      loadExercises();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // 今日统计
  const todayStats = exercises.reduce(
    (acc, ex) => ({
      duration: acc.duration + (ex.duration_min || 0),
      calories: acc.calories + (ex.calories_burned || 0),
      strength: acc.strength + (ex.exercise_type === 'strength' ? 1 : 0),
      cardio: acc.cardio + (ex.exercise_type === 'cardio' ? 1 : 0),
    }),
    { duration: 0, calories: 0, strength: 0, cardio: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">运动记录</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* 今日统计 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-medium text-gray-500 mb-3">今日运动</h2>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-500">{todayStats.duration}</p>
            <p className="text-xs text-gray-500">分钟</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-500">{todayStats.calories}</p>
            <p className="text-xs text-gray-500">消耗kcal</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-500">{todayStats.strength}</p>
            <p className="text-xs text-gray-500">力量</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">{todayStats.cardio}</p>
            <p className="text-xs text-gray-500">有氧</p>
          </div>
        </div>
      </div>

      {/* 运动列表 */}
      <div className="space-y-3">
        {exercises.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-500">
            暂无记录，点击下方按钮添加
          </div>
        ) : (
          exercises.map((ex) => (
            <div key={ex.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    ex.exercise_type === 'strength' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    {ex.exercise_type === 'strength' ? (
                      <Dumbbell className="w-5 h-5 text-purple-500" />
                    ) : (
                      <Heart className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{ex.name}</p>
                    <p className="text-sm text-gray-500">
                      {ex.exercise_type === 'strength' ? '力量训练' : '有氧运动'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(ex.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                {ex.duration_min && <span>{ex.duration_min} 分钟</span>}
                {ex.calories_burned && <span>{ex.calories_burned} kcal</span>}
                {ex.sets && ex.reps && <span>{ex.sets}组 × {ex.reps}次</span>}
                {ex.weight_kg && <span>{ex.weight_kg} kg</span>}
                {ex.distance_km && <span>{ex.distance_km} km</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 输入弹窗 */}
      {showInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">添加运动记录</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 运动类型 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, exercise_type: 'strength' })}
                  className={`p-3 rounded-lg flex items-center justify-center gap-2 ${
                    formData.exercise_type === 'strength'
                      ? 'bg-purple-100 ring-2 ring-purple-500'
                      : 'bg-gray-100'
                  }`}
                >
                  <Dumbbell className="w-5 h-5 text-purple-500" />
                  <span>力量训练</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, exercise_type: 'cardio' })}
                  className={`p-3 rounded-lg flex items-center justify-center gap-2 ${
                    formData.exercise_type === 'cardio'
                      ? 'bg-green-100 ring-2 ring-green-500'
                      : 'bg-gray-100'
                  }`}
                >
                  <Heart className="w-5 h-5 text-green-500" />
                  <span>有氧运动</span>
                </button>
              </div>

              {/* 名称 */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">运动名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={formData.exercise_type === 'strength' ? '例如: 卧推' : '例如: 跑步'}
                  autoFocus
                />
              </div>

              {/* 通用字段 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">时长(分钟)</label>
                  <input
                    type="number"
                    value={formData.duration_min}
                    onChange={(e) => setFormData({ ...formData, duration_min: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">消耗(kcal)</label>
                  <input
                    type="number"
                    value={formData.calories_burned}
                    onChange={(e) => setFormData({ ...formData, calories_burned: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* 力量训练专用 */}
              {formData.exercise_type === 'strength' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">组数</label>
                    <input
                      type="number"
                      value={formData.sets}
                      onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">次数</label>
                    <input
                      type="number"
                      value={formData.reps}
                      onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">重量kg</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* 有氧专用 */}
              {formData.exercise_type === 'cardio' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">距离(km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance_km}
                    onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
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
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
