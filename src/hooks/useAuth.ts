import { useState, useEffect } from 'react';

export type UserType = 'mestre' | 'aluno' | 'responsavel';

interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular verificação de autenticação
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: UserType): Promise<User> => {
    // Simular login
    const user: User = {
      id: '1',
      name: userType === 'mestre' ? 'Mestre Kim' : userType === 'aluno' ? 'João Silva' : 'Ana Silva',
      email,
      type: userType,
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}