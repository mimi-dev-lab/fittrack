import { Outlet, NavLink } from 'react-router-dom';
import { Home, Scale, Utensils, Dumbbell, BarChart3, Bot } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/weight', icon: Scale, label: '体重' },
  { to: '/meals', icon: Utensils, label: '饮食' },
  { to: '/workout', icon: Dumbbell, label: '运动' },
  { to: '/stats', icon: BarChart3, label: '统计' },
  { to: '/chat', icon: Bot, label: 'Mimi' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 主内容区域 */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-1 text-xs transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <Icon className="w-6 h-6 mb-1" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
