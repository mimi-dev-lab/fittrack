import { useState, useEffect } from 'react';
import { Plus, Dumbbell, Timer, Flame } from 'lucide-react';
import type { WorkoutRecord } from '../types';

export default function WorkoutPage() {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [workoutType, setWorkoutType] = useState<'strength' | 'cardio'>('strength');
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    caloriesBurned: '',
    sets: '',
    reps: '',
    weight: '',
    distance: '',
  });

  // TODO: 从 API 获取数据
  useEffect(() => {
    const mockData: WorkoutRecord[] = [
      { id: 1, date: '2026-01-30', type: 'strength', name: '卧推', duration: 15, sets: 4, reps: 10, weight: 60, caloriesBurned: 80 },
      { id: 2, date: '2026-01-30', type: 'cardio', name: '跑步', duration: 30, distance: 5, caloriesBurned: 300 },
    ];
    setRecords(mockData);
  }, []);

  const todayRecords = records.filter(r => r.date === new Date().toISOString().split('T')[0]);
  const totalDuration = todayRecords.reduce((sum, r) => sum + r.duration, 0);
  const totalCalories = todayRecords.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.duration) return;

    const newRecord: WorkoutRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: workoutType,
      name: formData.name,
      duration: parseInt(formData.duration),
      caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned) : undefined,
      sets: formData.sets ? parseInt(formData.sets) : undefined,
      reps: formData.reps ? parseInt(formData.reps) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      distance: formData.distance ? parseFloat(formData.distance) : undefined,
    };

    // TODO: 发送到 API
    setRecords([...records, newRecord]);
    setFormData({ name: '', duration: '', caloriesBurned: '', sets: '', reps: '', weight: '', distance: '' });
    setShowInput(false);
  };

  const strengthExercises = ['卧推', '深蹲', '硬拉', '引体向上', '肩推', '划船', '卷腹', '二头弯举', '三头下压'];
  const cardioExercises = ['跑步', '快走', '游泳', '骑行', '跳绳', '椭圆机', 'HIIT', '动感单车'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">运动记录</h1>

      {/* 今日汇总 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Timer className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalDuration}</p>
          <p className="text-sm text-gray-500">分钟</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalCalories}</p>
          <p className="text-sm text-gray-500">千卡</p>
        </div>
      </div>

      {/* 今日运动列表 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">今日运动</h2>
        {todayRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">还没有运动记录，开始动起来吧！💪</p>
        ) : (
          <div className="space-y-3">
            {todayRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    record.type === 'strength' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    <Dumbbell className={`w-5 h-5 ${
                      record.type === 'strength' ? 'text-purple-500' : 'text-green-500'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{record.name}</p>
                    <p className="text-sm text-gray-500">
                      {record.type === 'strength' && record.sets && record.reps && (
                        <>{record.sets}组 × {record.reps}次 {record.weight && `@ ${record.weight}kg`}</>
                      )}
                      {record.type === 'cardio' && record.distance && (
                        <>{record.distance}km</>
                      )}
                      {' · '}{record.duration}分钟
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-500">{record.caloriesBurned || '-'}</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 输入弹窗 */}
      {showInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">添加运动</h3>
            
            {/* 类型切换 */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setWorkoutType('strength')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  workoutType === 'strength'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                💪 力量训练
              </button>
              <button
                type="button"
                onClick={() => setWorkoutType('cardio')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  workoutType === 'cardio'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                🏃 有氧运动
              </button>
            </div>

            {/* 快捷选择 */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">快速选择</p>
              <div className="flex flex-wrap gap-2">
                {(workoutType === 'strength' ? strengthExercises : cardioExercises).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormData({ ...formData, name })}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.name === name
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">运动名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如: 卧推"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">时长(分钟) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">消耗(kcal)</label>
                  <input
                    type="number"
                    value={formData.caloriesBurned}
                    onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="200"
                  />
                </div>
              </div>

              {workoutType === 'strength' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">组数</label>
                    <input
                      type="number"
                      value={formData.sets}
                      onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">次数</label>
                    <input
                      type="number"
                      value={formData.reps}
                      onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">重量(kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="60"
                    />
                  </div>
                </div>
              )}

              {workoutType === 'cardio' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">距离(km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="5"
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
