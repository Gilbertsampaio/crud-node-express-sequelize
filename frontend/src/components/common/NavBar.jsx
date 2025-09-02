import { Link } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/usuarios">Usuários</Link>
      {/* <Link to="/usuarios/novo">Novo Usuário</Link> */}
      <Link to="/servicos">Serviços</Link>
      {/* <Link to="/servicos/novo">Novo Serviço</Link> */}
    </nav>
  );
}
