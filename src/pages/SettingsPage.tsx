import { useState, useEffect } from 'react';
import { Settings, User, Target, Flame, Save } from 'lucide-react';
import { userApi, type User as UserType } from '../api/client';
import { useToast } from '../components/Toast';

export default function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    height_cm: '',
    target_weight_kg: '',
    daily_calorie_goal: '',
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await userApi.get();
        setUser(userData);
        setFormData({
          height_cm: userData.height_cm?.toString() || '',
          target_weight_kg: userData.target_weight_kg?.toString() || '',
          daily_calorie_goal: userData.daily_calorie_goal?.toString() || '',
        });
      } catch (err) {
        console.error('Failed to load user:', err);
        showToast('error', '加载设置失败');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.update({
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : null,
        daily_calorie_goal: formData.daily_calorie_goal ? parseInt(formData.daily_calorie_goal) : null,
      });
      showToast('success', '设置已保存 ⚙️');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('error', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Settings className="w-7 h-7 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-800">设置</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 身体信息 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-800">身体信息</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                身高 (cm)
              </label>
              <input
                type="number"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="例如: 175"
              />
              <p className="text-xs text-gray-500 mt-1">用于计算 BMI</p>
            </div>
          </div>
        </div>

        {/* 目标设置 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-800">目标设置</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目标体重 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.target_weight_kg}
                onChange={(e) => setFormData({ ...formData, target_weight_kg: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="例如: 70"
              />
              <p className="text-xs text-gray-500 mt-1">你想达到的体重</p>
            </div>
          </div>
        </div>

        {/* 营养目标 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">营养目标</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                每日卡路里目标 (kcal)
              </label>
              <input
                type="number"
                value={formData.daily_calorie_goal}
                onChange={(e) => setFormData({ ...formData, daily_calorie_goal: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="例如: 2000"
              />
              <p className="text-xs text-gray-500 mt-1">建议: 减重 1500-1800, 维持 2000, 增肌 2500+</p>
            </div>

            {/* 快速选择 */}
            <div className="flex flex-wrap gap-2">
              {[1500, 1800, 2000, 2500].map((cal) => (
                <button
                  key={cal}
                  type="button"
                  onClick={() => setFormData({ ...formData, daily_calorie_goal: cal.toString() })}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    formData.daily_calorie_goal === cal.toString()
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cal} kcal
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <Save className="w-5 h-5" />
          {saving ? '保存中...' : '保存设置'}
        </button>
      </form>

      {/* 用户 ID */}
      <div className="text-center text-xs text-gray-400">
        用户 ID: {user?.id?.slice(0, 8)}...
      </div>
    </div>
  );
}
