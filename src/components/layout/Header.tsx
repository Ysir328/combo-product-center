import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Grid3X3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { useMarketingMaterials } from '../../hooks/useMarketingMaterials';
import { useInternalDocuments } from '../../hooks/useInternalDocuments';

export default function Header() {
  const { user, signOut, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch latest items for mega menu
  const { data: products } = useProducts();
  const { data: materials } = useMarketingMaterials();
  const { data: docs } = useInternalDocuments();

  const latestProducts = products.slice(0, 4);
  const latestMaterials = materials.slice(0, 4);
  const latestDocs = docs.slice(0, 4);

  // Close mega menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMegaEnter = () => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaMenuOpen(true);
  };
  const handleMegaLeave = () => {
    megaTimeout.current = setTimeout(() => setMegaMenuOpen(false), 200);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const closeAll = () => {
    setUserMenuOpen(false);
    setMegaMenuOpen(false);
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    closeAll();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={closeAll}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm hidden lg:block">
              组合产品可视化资料中心
            </span>
          </Link>

          {/* Desktop Nav + Mega Menu */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link
              to="/products"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              产品中心
            </Link>
            <Link
              to="/marketing"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              营销资料
            </Link>
            <Link
              to="/internal"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              内部文档
            </Link>

            {/* Mega Menu: 资料中心 */}
            <div className="relative" ref={megaMenuRef} onMouseEnter={handleMegaEnter} onMouseLeave={handleMegaLeave}>
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Grid3X3 className="w-4 h-4" />
                <span>资料中心</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {megaMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-[680px] bg-white border border-gray-200 rounded-xl shadow-xl p-6 z-50">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Products Column */}
                    <div>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-primary/10">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">产品中心</span>
                      </div>
                      {latestProducts.map(p => (
                        <Link
                          key={p.id}
                          to={`/products/${p.id}`}
                          onClick={closeAll}
                          className="block py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-700 truncate">{p.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{p.type} · {p.riskLevel}</div>
                        </Link>
                      ))}
                      <Link
                        to="/products"
                        onClick={closeAll}
                        className="block mt-2 text-xs text-primary hover:underline font-medium"
                      >
                        查看全部产品 →
                      </Link>
                    </div>

                    {/* Marketing Column */}
                    <div>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-marketing/10">
                        <BarChart3 className="w-4 h-4 text-marketing" />
                        <span className="text-sm font-semibold text-marketing">营销资料</span>
                      </div>
                      {latestMaterials.map(m => (
                        <Link
                          key={m.id}
                          to="/marketing"
                          onClick={closeAll}
                          className="block py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-700 truncate">{m.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{m.format} · {m.version}</div>
                        </Link>
                      ))}
                      <Link
                        to="/marketing"
                        onClick={closeAll}
                        className="block mt-2 text-xs text-marketing hover:underline font-medium"
                      >
                        查看全部资料 →
                      </Link>
                    </div>

                    {/* Internal Docs Column */}
                    <div>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-internal/10">
                        <FileText className="w-4 h-4 text-internal" />
                        <span className="text-sm font-semibold text-internal">内部文档</span>
                      </div>
                      {user && hasPermission('internal:view') ? (
                        <>
                          {latestDocs.map(d => (
                            <Link
                              key={d.id}
                              to={`/internal/${d.id}`}
                              onClick={closeAll}
                              className="block py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="text-sm font-medium text-gray-700 truncate">{d.title}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{d.category} · v{d.version}</div>
                            </Link>
                          ))}
                          <Link
                            to="/internal"
                            onClick={closeAll}
                            className="block mt-2 text-xs text-internal hover:underline font-medium"
                          >
                            查看全部文档 →
                          </Link>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400 py-4 text-center">
                          <User className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                          登录后查看内部文档
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索产品、资料..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link to="/announcements" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {latestDocs.length > 0 ? '●' : ''}
              </span>
            </Link>

            {/* Admin Settings */}
            {hasPermission('internal:edit') && (
              <Link to="/admin" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5 text-gray-500" />
              </Link>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition-colors"
              >
                <div className="w-7 h-7 bg-primary-light rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden sm:inline font-medium">
                  {user?.name || '未登录'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user?.name || '访客'}</div>
                      <div className="text-xs text-gray-400">{user?.email || user?.role ? {visitor:'访客',client:'授权客户',advisor:'投顾经理',operator:'运营人员',admin:'系统管理员'}[user.role] : ''}</div>
                    </div>
                    {user?.email && (
                      <Link
                        to="/auth"
                        onClick={closeAll}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" />个人设置
                      </Link>
                    )}
                    {hasPermission('internal:edit') && (
                      <Link
                        to="/admin"
                        onClick={closeAll}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />管理后台
                      </Link>
                    )}
                    {user ? (
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />退出登录
                      </button>
                    ) : (
                      <Link
                        to="/auth"
                        onClick={closeAll}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary-light"
                      >
                        <User className="w-4 h-4" />登录 / 注册
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索产品、资料..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </form>
          </div>

          <nav className="px-2 pb-3 space-y-1">
            <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">导航</div>
            <Link to="/products" onClick={closeAll} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
              <Briefcase className="w-5 h-5 text-primary" />产品中心
            </Link>
            <Link to="/marketing" onClick={closeAll} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
              <BarChart3 className="w-5 h-5 text-marketing" />营销资料
            </Link>
            <Link to="/internal" onClick={closeAll} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
              <FileText className="w-5 h-5 text-internal" />内部文档
            </Link>

            <div className="border-t border-gray-100 my-2" />
            <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">最新资料</div>
            {latestProducts.slice(0, 2).map(p => (
              <Link key={p.id} to={`/products/${p.id}`} onClick={closeAll} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Briefcase className="w-4 h-4 text-gray-400" />{p.name}
              </Link>
            ))}
            {latestMaterials.slice(0, 2).map(m => (
              <Link key={m.id} to="/marketing" onClick={closeAll} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <BarChart3 className="w-4 h-4 text-gray-400" />{m.title}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
