import { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import api from '../api/api';

function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (err) {
    console.log(err)
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login do usuário
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout do usuário
  const logout = async () => {
    try {
      // Tentar notificar o servidor sobre o logout
      await api.post('/users/logout');
    } catch (err) {
      console.error('Erro ao registrar logout:', err);
    } finally {
      // Limpa o estado e o localStorage SEMPRE,
      // garantindo que o usuário seja deslogado
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  // Atualiza dados do usuário logado
  const updateUser = (updatedData) => {
    if (!user) return;

    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Carrega o usuário do localStorage e verifica o token
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // Se não houver token, não há usuário logado
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const decoded = parseJwt(token);
    
    // Se o token for inválido ou expirado, limpa tudo e para
    if (!decoded || Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return;
    }

    // Se o token é válido, carrega o usuário
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Atualiza last_active periodicamente APENAS se o usuário estiver logado
  useEffect(() => {
    let interval;
    if (user) {
      const ping = async () => {
        try {
          await api.post('/users/ping');
        } catch (err) {
          console.error('Erro ao enviar ping de atividade:', err);
        }
      };
      ping(); // ping imediato
      interval = setInterval(ping, 60000);
    }
    return () => clearInterval(interval);
  }, [user]);

  // Atualiza a validade do token a cada mudança de rota
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = parseJwt(token);
        if (!decoded || Date.now() >= decoded.exp * 1000) {
          logout(); // Chama o logout para limpar tudo
        }
      }
    }, 10000); // Verifica a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}