import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_NAMES: Record<UserRole, string> = {
  visitor: '访客',
  client: '张客户',
  advisor: '李明（投顾经理）',
  operator: '王运营',
  admin: '系统管理员',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: 'u-001',
    name: USER_NAMES.advisor,
    role: 'advisor',
  });

  const login = useCallback((role: UserRole) => {
    setUser({
      id: `u-${Date.now()}`,
      name: USER_NAMES[role],
      role,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUser({
      id: `u-${Date.now()}`,
      name: USER_NAMES[role],
      role,
    });
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      const perms = ROLE_PERMISSIONS[user.role];
      return perms.includes('*') || perms.includes(permission);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, logout, hasPermission, switchRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
