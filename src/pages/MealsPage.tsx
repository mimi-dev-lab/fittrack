import { useState, useEffect } from 'react';
import { Plus, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import type { MealRecord } from '../types';

const mealTypeConfig = {
  breakfast: { label: '早餐', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-100' },
  lunch: { label: '午餐', icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  dinner: { label: '晚餐', icon: Moon, color: 'text-blue-500', bg: 'bg-blue-100' },
  snack: { label: '加餐', icon: Cookie, color: 'text-pink-500', bg: 'bg-pink-100' },
};

export default function MealsPage() {
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealRecord['mealType']>('breakfast');
  const [formData, setFormData] = useState({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  // TODO: 从 API 获取数据
  useEffect(() => {
    const mockData: MealRecord[] = [
      { id: 1, date: '2026-01-30', mealType: 'breakfast', foodName: '鸡蛋2个 + 牛奶', calories: 300, protein: 20, carbs: 15, fat: 18 },
      { id: 2, date: '2026-01-30', mealType: 'lunch', foodName: '鸡胸肉沙拉', calories: 450, protein: 35, carbs: 25, fat: 20 },
    ];
    setRecords(mockData);
  }, []);

  const todayRecords = records.filter(r => r.date === new Date().toISOString().split('T')[0]);
  const totalCalories = todayRecords.reduce((sum, r) => sum + r.calories, 0);
  const totalProtein = todayRecords.reduce((sum, r) => sum + (r.protein || 0), 0);
  const totalCarbs = todayRecords.reduce((sum, r) => sum + (r.carbs || 0), 0);
  const totalFat = todayRecords.reduce((sum, r) => sum + (r.fat || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.foodName || !formData.calories) return;

    const newRecord: MealRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      mealType: selectedMealType,
      foodName: formData.foodName,
      calories: parseInt(formData.calories),
      protein: formData.protein ? parseInt(formData.protein) : undefined,
      carbs: formData.carbs ? parseInt(formData.carbs) : undefined,
      fat: formData.fat ? parseInt(formData.fat) : undefined,
    };

    // TODO: 发送到 API
    setRecords([...records, newRecord]);
    setFormData({ foodName: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowInput(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">饮食记录</h1>

      {/* 今日汇总 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">今日摄入</h2>
        <div className="text-center mb-4">
          <p className="text-4xl font-bold text-orange-500">{totalCalories}</p>
          <p className="text-sm text-gray-500">千卡</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-gray-800">{totalProtein}g</p>
            <p className="text-xs text-gray-500">蛋白质</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800">{totalCarbs}g</p>
            <p className="text-xs text-gray-500">碳水</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800">{totalFat}g</p>
            <p className="text-xs text-gray-500">脂肪</p>
          </div>
        </div>
      </div>

      {/* 餐次记录 */}
      {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
        const config = mealTypeConfig[mealType];
        const Icon = config.icon;
        const meals = todayRecords.filter(r => r.mealType === mealType);
        const mealCalories = meals.reduce((sum, r) => sum + r.calories, 0);

        return (
          <div key={mealType} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${config.bg} rounded-full flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{config.label}</p>
                  <p className="text-sm text-gray-500">{mealCalories} kcal</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedMealType(mealType);
                  setShowInput(true);
                }}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {meals.length > 0 && (
              <div className="space-y-2 ml-13">
                {meals.map((meal) => (
                  <div key={meal.id} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600">{meal.foodName}</span>
                    <span className="text-gray-800">{meal.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* 输入弹窗 */}
      {showInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              添加{mealTypeConfig[selectedMealType].label}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">食物名称 *</label>
                <input
                  type="text"
                  value={formData.foodName}
                  onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如: 鸡胸肉沙拉"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">卡路里 (kcal) *</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如: 450"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">蛋白质(g)</label>
                  <input
                    type="number"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">碳水(g)</label>
                  <input
                    type="number"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">脂肪(g)</label>
                  <input
                    type="number"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
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
    </div>
  );
}
