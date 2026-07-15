import { Link } from 'react-router-dom';
import {
  BookOpen,
  BarChart3,
  FolderLock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { announcements } from '../../data/announcements';

const MODULES = [
  {
    path: '/products',
    title: '产品介绍',
    description: '了解组合产品的投资策略、风险收益特征和历史业绩表现',
    icon: BookOpen,
    color: 'primary',
    bgColor: 'bg-primary-light',
    textColor: 'text-primary',
    question: '这是什么产品？为什么值得关注？',
  },
  {
    path: '/marketing',
    title: '客户营销推广资料',
    description: '查看客户规模、资产增长、业绩趋势和营销物料',
    icon: BarChart3,
    color: 'marketing',
    bgColor: 'bg-marketing-light',
    textColor: 'text-marketing',
    question: '产品推广的效果如何？',
  },
  {
    path: '/internal',
    title: '投顾内部资料',
    description: '获取推广话术、客户沟通指南、社群素材和培训材料',
    icon: FolderLock,
    color: 'internal',
    bgColor: 'bg-internal-light',
    textColor: 'text-internal',
    question: '内部人员如何标准化推广和销售？',
  },
];

const HIGHLIGHTS = [
  { icon: TrendingUp, title: '实时数据', desc: '产品业绩和客户数据定期更新，确保信息时效性' },
  { icon: ShieldCheck, title: '合规保障', desc: '所有对外展示内容经过合规审核，风险揭示完整' },
  { icon: Zap, title: '高效协作', desc: '资料统一管理、版本可追溯，告别文件散落和重复传递' },
];

export default function HomePage() {
  const latestAnnouncements = announcements.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white to-primary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              组合产品可视化资料中心
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-500 leading-relaxed">
              面向外部客户和内部投顾团队的一站式产品展示、营销数据查阅与运营资料管理平台
            </p>
            <p className="mt-4 text-sm text-gray-400">
              同一入口 · 不同视图 · 统一维护
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                查看产品
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/marketing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                营销数据看板
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three Module Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODULES.map((mod) => (
            <Link
              key={mod.path}
              to={mod.path}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
            >
              <div className={`w-12 h-12 ${mod.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <mod.icon className={`w-6 h-6 ${mod.textColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{mod.title}</h3>
              <p className="text-sm text-gray-400 mb-3 leading-relaxed">{mod.description}</p>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-300 group-hover:text-gray-500 transition-colors">
                <span>{mod.question}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="text-center">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <h.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{h.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">最新公告</h2>
          </div>
          <Link
            to="/announcements"
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {latestAnnouncements.map((ann) => (
            <Link
              key={ann.id}
              to="/announcements"
              className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                ann.isPinned ? 'bg-primary' : 'bg-gray-300'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{ann.title}</h4>
                  {ann.isPinned && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary-light text-primary shrink-0">
                      置顶
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{ann.publishDate}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
