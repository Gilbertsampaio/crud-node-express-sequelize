import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import "../../styles/NavBar.css";
import ConfirmModal from "./ConfirmModal";
import { FaUser, FaSignOutAlt, FaCog } from "react-icons/fa"; // ícones

export default function NavBar() {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  const handleLogoutClick = () => setShowModal(true);
  const confirmLogout = () => {
    logout();
    setShowModal(false);
  };
  const cancelLogout = () => setShowModal(false);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  // Fecha dropdown ao clicar fora
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

  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/usuarios">Usuários</Link>
        <Link to="/servicos">Serviços</Link>
        <Link to="/categorias">Categorias</Link>

        {user ? (
          <div className={`user-dropdown ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
            <span className="user-name" onClick={toggleDropdown}>
              {user.name}
            </span>
            {dropdownOpen && (
              <ul className="user-menu">
                <li onClick={goToProfile}>
                  <FaUser size={12} style={{ marginRight: '8px' }} />
                  Perfil do USuário
                </li>
                <li onClick={() => { navigate("/meus-servicos"); setDropdownOpen(false); }}>
                  <FaCog size={12} style={{ marginRight: '8px' }} />
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
