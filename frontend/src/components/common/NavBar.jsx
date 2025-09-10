import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../context/useAuth";
import "../../styles/NavBar.css";
import ConfirmModal from "./ConfirmModal";
import { FaSignOutAlt, FaUsers, FaCogs, FaListOl, FaHome, FaUser, FaUserCog } from "react-icons/fa";

export default function NavBar() {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const location = useLocation();

  const handleLogoutClick = () => setShowModal(true);
  const confirmLogout = () => {
    logout();
    setShowModal(false);
  };
  const cancelLogout = () => setShowModal(false);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToProfile = () => {
    navigate("/perfil");
    setDropdownOpen(false);
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

  const avatarUrl = user?.image
    ? `${API_URL}/uploads/${user.image}`
    : "/images/avatar.png";

  const menuItems = [
    { label: 'Home', path: '/', icon: <FaHome size={14} /> },
    { label: 'Usuários', path: '/usuarios', icon: <FaUsers size={14} /> },
    { label: 'Serviços', path: '/servicos', icon: <FaCogs size={14} /> },
    { label: 'Categorias', path: '/categorias', icon: <FaListOl size={14} /> },
    { label: 'Novidades', path: '/news', icon: <FaListOl size={14} /> },
  ];

  return (
    <>
      <header className="topbar">
        <nav>
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              <span style={{ marginRight: '8px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {user ? (
            <div className={`user-dropdown ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
              <img
                src={avatarUrl}
                alt="Avatar do usuário"
                className="user-avatar"
                onClick={toggleDropdown}
                style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
              />
              {dropdownOpen && (
                <ul className="user-menu">
                  <li onClick={goToProfile}>
                    <FaUser size={12} style={{ marginRight: '8px' }} />
                    Perfil de {user.name.split(' ')[0]}
                  </li>
                  <li onClick={() => { navigate("/meus-servicos"); setDropdownOpen(false); }}>
                    <FaUserCog size={12} style={{ marginRight: '8px' }} />
                    Meus Serviços
                  </li>
                  <li onClick={handleLogoutClick}>
                    <FaSignOutAlt size={12} style={{ marginRight: '8px' }} />
                    Sair do Sistema
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>

      <ConfirmModal
        show={showModal}
        title="Confirmar saída"
        message="Tem certeza que deseja sair do sistema?"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
}
