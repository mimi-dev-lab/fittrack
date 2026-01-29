import { useState, useEffect } from 'react';
import { Plus, Trash2, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import { mealsApi, type Meal } from '../api/client';

const mealTypeConfig = {
  breakfast: { label: '早餐', icon: Coffee, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  lunch: { label: '午餐', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100' },
  dinner: { label: '晚餐', icon: Moon, color: 'text-purple-500', bg: 'bg-purple-100' },
  snack: { label: '零食', icon: Cookie, color: 'text-pink-500', bg: 'bg-pink-100' },
};

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 表单状态
  const [formData, setFormData] = useState({
    meal_type: 'lunch' as Meal['meal_type'],
    description: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
  });

  const loadMeals = async () => {
    try {
      const data = await mealsApi.list(selectedDate);
      setMeals(data);
    } catch (err) {
      console.error('Failed to load meals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeals();
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    try {
      await mealsApi.create({
        meal_type: formData.meal_type,
        description: formData.description,
        calories: formData.calories ? parseInt(formData.calories) : null,
        protein_g: formData.protein_g ? parseFloat(formData.protein_g) : null,
        carbs_g: formData.carbs_g ? parseFloat(formData.carbs_g) : null,
        fat_g: formData.fat_g ? parseFloat(formData.fat_g) : null,
        recorded_at: new Date().toISOString(),
        notes: null,
      });
      setFormData({
        meal_type: 'lunch',
        description: '',
        calories: '',
        protein_g: '',
        carbs_g: '',
        fat_g: '',
      });
      setShowInput(false);
      loadMeals();
    } catch (err) {
      console.error('Failed to save meal:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这条记录？')) return;
    try {
      await mealsApi.delete(id);
      loadMeals();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // 今日统计
  const todayStats = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein_g || 0),
      carbs: acc.carbs + (meal.carbs_g || 0),
      fat: acc.fat + (meal.fat_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
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
        <h1 className="text-2xl font-bold text-gray-800">饮食记录</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* 今日统计 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-medium text-gray-500 mb-3">今日摄入</h2>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold text-orange-500">{todayStats.calories}</p>
            <p className="text-xs text-gray-500">卡路里</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">{todayStats.protein.toFixed(0)}</p>
            <p className="text-xs text-gray-500">蛋白质g</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-500">{todayStats.carbs.toFixed(0)}</p>
            <p className="text-xs text-gray-500">碳水g</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-500">{todayStats.fat.toFixed(0)}</p>
            <p className="text-xs text-gray-500">脂肪g</p>
          </div>
        </div>
      </div>

      {/* 餐食列表 */}
      <div className="space-y-3">
        {meals.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-500">
            暂无记录，点击下方按钮添加
          </div>
        ) : (
          meals.map((meal) => {
            const config = mealTypeConfig[meal.meal_type];
            const Icon = config.icon;
            return (
              <div key={meal.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${config.bg} rounded-full flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{meal.description}</p>
                      <p className="text-sm text-gray-500">{config.label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {(meal.calories || meal.protein_g || meal.carbs_g || meal.fat_g) && (
                  <div className="mt-3 flex gap-4 text-sm text-gray-500">
                    {meal.calories && <span>{meal.calories} kcal</span>}
                    {meal.protein_g && <span>蛋白 {meal.protein_g}g</span>}
                    {meal.carbs_g && <span>碳水 {meal.carbs_g}g</span>}
                    {meal.fat_g && <span>脂肪 {meal.fat_g}g</span>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 输入弹窗 */}
      {showInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">添加饮食记录</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 餐食类型 */}
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(mealTypeConfig) as Meal['meal_type'][]).map((type) => {
                  const config = mealTypeConfig[type];
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, meal_type: type })}
                      className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
                        formData.meal_type === type
                          ? `${config.bg} ring-2 ring-primary-500`
                          : 'bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <span className="text-xs">{config.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">吃了什么</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如: 鸡胸肉沙拉"
                  autoFocus
                />
              </div>

              {/* 营养信息 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">卡路里</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="kcal"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">蛋白质</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.protein_g}
                    onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="g"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">碳水</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.carbs_g}
                    onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="g"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">脂肪</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fat_g}
                    onChange={(e) => setFormData({ ...formData, fat_g: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="g"
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

      {/* 添加按钮 */}
      <button
        onClick={() => setShowInput(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
