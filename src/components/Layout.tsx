import { Outlet, NavLink } from 'react-router-dom';
import { Home, Scale, Utensils, Dumbbell, BarChart3, Bot } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: '首页', color: 'primary' },
  { to: '/weight', icon: Scale, label: '体重', color: 'green' },
  { to: '/meals', icon: Utensils, label: '饮食', color: 'orange' },
  { to: '/workout', icon: Dumbbell, label: '运动', color: 'blue' },
  { to: '/stats', icon: BarChart3, label: '统计', color: 'indigo' },
  { to: '/chat', icon: Bot, label: 'Mimi', color: 'purple' },
];

const colorClasses: Record<string, { active: string; inactive: string }> = {
  primary: { active: 'text-primary-600', inactive: 'text-gray-400' },
  green: { active: 'text-green-600', inactive: 'text-gray-400' },
  orange: { active: 'text-orange-500', inactive: 'text-gray-400' },
  blue: { active: 'text-blue-500', inactive: 'text-gray-400' },
  indigo: { active: 'text-indigo-500', inactive: 'text-gray-400' },
  purple: { active: 'text-purple-500', inactive: 'text-gray-400' },
};

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 主内容区域 */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg safe-area-pb">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label, color }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? colorClasses[color].active
                    : `${colorClasses[color].inactive} hover:text-gray-600`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-gray-100' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="mt-0.5">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
