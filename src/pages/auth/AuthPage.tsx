import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type AuthTab = 'login' | 'register';

export default function AuthPage() {
  const { user, signIn, signUp, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<AuthTab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, show account info
  const isLoggedIn = !!user;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('请填写邮箱和密码');
      return;
    }
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      navigate('/');
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password || !name.trim()) {
      setError('请填写所有必填项');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少 6 位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    setSubmitting(true);
    const { error: err } = await signUp(email.trim(), password, name.trim());
    setSubmitting(false);

    if (err) {
      setError(err);
    } else {
      setSuccessMsg('注册成功！如已开启邮箱验证，请检查邮箱确认链接。');
      setTab('login');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const ROLE_NAME_MAP: Record<string, string> = {
    visitor: '访客', client: '授权客户', advisor: '投顾经理', operator: '运营人员', admin: '系统管理员',
  };

  // --- Logged In View ---
  if (isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-400 mt-1">{user.email}</p>
          <p className="text-sm text-gray-400 mt-0.5">
            角色：{ROLE_NAME_MAP[user.role] || user.role}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            返回首页
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            退出登录
          </button>
        </div>

        {/* Role explanation */}
        <div className="mt-10 bg-gray-50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">角色使用说明</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>• <strong>访客/客户</strong>：可浏览产品介绍和营销数据，无法查看内部资料</li>
            <li>• <strong>投顾经理</strong>：可查看全部内容，包括内部资料</li>
            <li>• <strong>运营人员</strong>：可管理内容，上传/编辑资料</li>
            <li>• <strong>系统管理员</strong>：拥有全部权限，可管理用户和系统配置</li>
          </ul>
        </div>
      </div>
    );
  }

  // --- Login / Register Forms ---
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {tab === 'login' ? '登录账号' : '注册账号'}
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          {tab === 'login' ? '登录以访问全部功能' : '创建账号以获取更多权限'}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
        <button
          onClick={() => { setTab('login'); setError(null); setSuccessMsg(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          登录
        </button>
        <button
          onClick={() => { setTab('register'); setError(null); setSuccessMsg(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          注册
        </button>
      </div>

      {/* Error / Success messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-600">
          {successMsg}
        </div>
      )}

      {/* Login Form */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {submitting ? '登录中...' : '登录'}
          </button>
        </form>
      )}

      {/* Register Form */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">姓名</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="您的姓名"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="至少 6 位"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">确认密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {submitting ? '注册中...' : '注册'}
          </button>
        </form>
      )}
    </div>
  );
}
