import { Link } from 'react-router-dom';
import { FaHome, FaUserPlus, FaCog } from 'react-icons/fa';
import './NavBar.css';

export default function NavBar() {
  return (
    <nav>
      <Link to="/">
        <FaHome style={{ marginRight: '5px' }} /> Home
      </Link>
      <Link to="/usuarios">
        <FaUserPlus style={{ marginRight: '5px' }} /> Usuários
      </Link>
      <Link to="/servicos">
        <FaCog style={{ marginRight: '5px' }} /> Serviços
      </Link>
    </nav>
  );
}
