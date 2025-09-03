import { useEffect, useState } from 'react';
import { FaUsers, FaCog, FaListOl } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import '../../assets/styles.css';

export default function Home() {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalServicos, setTotalServicos] = useState(0);
  const [totalCategorias, setTotalCategorias] = useState(0);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [resUsuarios, resServicos, resCategorias] = await Promise.all([
          api.get('/users'),
          api.get('/services'),
          api.get('/categories')
        ]);

        setTotalUsuarios(resUsuarios.data.length);
        setTotalServicos(resServicos.data.length);
        setTotalCategorias(resCategorias.data.length);
      } catch (err) {
        console.error('Erro ao buscar totais:', err);
      }
    };

    fetchTotals();
  }, []);

  const formatBadge = (count) => count === 0 ? 'Nenhum registro' : `${count} ${count === 1 ? 'registro' : 'registros'}`;

  return (
    <div className="container">
      <h2>Bem-vindo ao Sistema</h2>
      <p>Use o menu acima para gerenciar Usuários, Serviços e Categorias.</p>

      <div className="card-container">
        <Link to="/usuarios" className="card">
          <FaUsers size={40} />
          <h3>Usuários</h3>
          <span className="badge">{formatBadge(totalUsuarios)}</span>
          <p>Visualize, adicione ou edite usuários cadastrados.</p>
        </Link>

        <Link to="/servicos" className="card">
          <FaCog size={40} />
          <h3>Serviços</h3>
          <span className="badge">{formatBadge(totalServicos)}</span>
          <p>Gerencie os serviços disponíveis e suas informações.</p>
        </Link>

        <Link to="/categorias" className="card">
          <FaListOl size={40} />
          <h3>Categorias</h3>
          <span className="badge">{formatBadge(totalCategorias)}</span>
          <p>Gerencie as categorias de serviços disponíveis.</p>
        </Link>
      </div>
    </div>
  );
}
