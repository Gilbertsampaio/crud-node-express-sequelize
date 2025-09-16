import { useState, useEffect } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';

function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload); // decodifica Base64
    return JSON.parse(payload);
  } catch (err) {
    console.log(err)
    return null;
  }
}

export default function useAuthCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (location.pathname === '/login') return;

    const token = localStorage.getItem('token');
    if (user && !token) {
      setUser(null);
      navigate('/login');
      return;
    }

    const decoded = parseJwt(token);

    if (user && (!decoded || Date.now() >= decoded.exp * 1000)) {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login?sessionExpired=1');
    }
  }, [navigate, location, user]);
}
