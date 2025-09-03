import { FaUsers, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../../assets/styles.css';

export default function Home() {
  return (
    <div className="container">
      <h2>Bem-vindo ao Sistema</h2>
      <p>Use o menu acima para gerenciar Usuários e Serviços.</p>

      <div className="card-container">
        <Link to="/usuarios" className="card">
          <FaUsers size={40} />
          <h3>Usuários</h3>
          <p>Visualize, adicione ou edite usuários cadastrados.</p>
        </Link>

        <Link to="/servicos" className="card">
          <FaCog size={40} />
          <h3>Serviços</h3>
          <p>Gerencie os serviços disponíveis e suas informações.</p>
        </Link>

        <Link to="/categorias" className="card">
          <FaCog size={40} />
          <h3>Categorias</h3>
          <p>Gerencie as categorias de serviços disponiveis.</p>
        </Link>
      </div>
    </div>
  );
}
