import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../context/useAuth";
import "../../styles/NavBar.css";
import ConfirmModal from "./ConfirmModal";

export default function NavBar() {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleLogoutClick = () => {
    setShowModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowModal(false);
  };

  const cancelLogout = () => {
    setShowModal(false);
  };

  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/usuarios">Usuários</Link>
        <Link to="/servicos">Serviços</Link>
        <Link to="/categorias">Categorias</Link>
        
        {user ? (
          <button className="logout" onClick={handleLogoutClick}>
            Sair
          </button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>

      {/* Modal de confirmação */}
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
