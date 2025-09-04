import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded || Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem('token');
      navigate('/login?sessionExpired=1');
    }
  }, [navigate]);
}
