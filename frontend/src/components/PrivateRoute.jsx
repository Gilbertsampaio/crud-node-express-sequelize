// PrivateRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import LoadingModal from '../components/common/LoadingModal';

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingModal show={true} />; 

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
