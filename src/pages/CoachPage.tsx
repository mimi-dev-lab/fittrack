import { useState, useEffect } from 'react';
import { Bot, Lightbulb, AlertTriangle, Trophy, Dumbbell, Utensils } from 'lucide-react';

interface Advice {
  type: 'tip' | 'warning' | 'achievement' | 'workout' | 'diet';
  title: string;
  content: string;
  priority: number;
}

export default function CoachPage() {
  const [advices, setAdvices] = useState<Advice[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: 从 API 获取 AI 分析结果
  useEffect(() => {
    // 模拟 AI 分析
    setTimeout(() => {
      const mockAdvices: Advice[] = [
        {
          type: 'achievement',
          title: '🎉 连续记录 7 天！',
          content: '你已经连续记录体重 7 天了，保持这个好习惯！数据越多，我能给你的建议就越准确。',
          priority: 1,
        },
        {
          type: 'tip',
          title: '体重下降趋势良好',
          content: '过去一周你减重 1.7kg，这是一个健康的速度（每周 0.5-1kg）。继续保持目前的饮食和运动习惯！',
          priority: 2,
        },
        {
          type: 'diet',
          title: '蛋白质摄入建议',
          content: '根据你的运动量，建议每天摄入 80-100g 蛋白质。可以多吃鸡胸肉、鸡蛋、豆腐等高蛋白食物，有助于保持肌肉量。',
          priority: 3,
        },
        {
          type: 'workout',
          title: '今日训练建议',
          content: '你已经连续两天做力量训练了，建议今天做一些轻度有氧（快走或游泳 30 分钟），让肌肉得到恢复。',
          priority: 4,
        },
        {
          type: 'warning',
          title: '注意休息',
          content: '检测到你昨天运动消耗较大但睡眠可能不足。充足的睡眠对减肥很重要，建议保证 7-8 小时睡眠。',
          priority: 5,
        },
      ];
      setAdvices(mockAdvices);
      setLoading(false);
    }, 1000);
  }, []);

  const getIcon = (type: Advice['type']) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'workout':
        return <Dumbbell className="w-5 h-5 text-purple-500" />;
      case 'diet':
        return <Utensils className="w-5 h-5 text-green-500" />;
    }
  };

  const getBgColor = (type: Advice['type']) => {
    switch (type) {
      case 'tip':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200';
      case 'workout':
        return 'bg-purple-50 border-purple-200';
      case 'diet':
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI 教练</h1>
          <p className="text-sm text-gray-500">基于你的数据，为你提供个性化建议</p>
        </div>
      </div>

      {/* 今日总结 */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">今日总结</h2>
        <p className="text-primary-100 text-sm leading-relaxed">
          你今天表现不错！体重继续下降中，饮食控制得当，运动量适中。
          继续保持这个节奏，预计 <span className="font-semibold text-white">4 周后</span> 可以达到目标体重 70kg！
        </p>
      </div>

      {/* 建议列表 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {advices.sort((a, b) => a.priority - b.priority).map((advice, index) => (
            <div
              key={index}
              className={`rounded-2xl p-4 border ${getBgColor(advice.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  {getIcon(advice.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{advice.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{advice.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 提示 */}
      <div className="bg-gray-100 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500">
          💬 你也可以在 Discord #fitness 频道直接跟我聊天，
          <br />
          快速记录数据或询问建议！
        </p>
      </div>
    </div>
  );
}
