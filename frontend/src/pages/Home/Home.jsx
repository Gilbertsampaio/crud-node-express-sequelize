import React from "react";
import { useEffect, useState } from 'react';
import { FaUsers, FaCogs, FaListOl, FaNewspaper } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import '../../assets/styles.css';

import SectionTitle from '../../components/common/SectionTitle';
import CarrosselServicos from '../../components/common/CarrosselServicos';
import AccordionList from '../../components/common/AccordionList';

export default function Home() {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalServicos, setTotalServicos] = useState(0);
  const [totalCategorias, setTotalCategorias] = useState(0);
  const [totalNovidades, setTotalNovidades] = useState(0);
  const [servicos, setServicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [resUsuarios, resServicos, resCategorias, resNovidades] = await Promise.all([
          api.get('/users'),
          api.get('/services'),
          api.get('/categories'),
          api.get('/news')
        ]);

        setTotalUsuarios(resUsuarios.data.length);
        setTotalServicos(resServicos.data.length);
        setTotalCategorias(resCategorias.data.length);
        setTotalNovidades(resNovidades.data.length);
        setServicos(resServicos.data);
        setUsuarios(resUsuarios.data);
      } catch (err) {
        console.error('Erro ao buscar totais:', err);
      }
    };

    fetchTotals();
  }, []);

  const formatBadge = (count) =>
    count === 0 ? 'Nenhum registro' : `${count} ${count === 1 ? 'registro' : 'registros'}`;

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
          <FaCogs size={40} />
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

        <Link to="/news" className="card">
          <FaNewspaper size={40} />
          <h3>Novidades</h3>
          <span className="badge">{formatBadge(totalNovidades)}</span>
          <p>Gerencie as novidades disponíveis.</p>
        </Link>
      </div>

      {/* Carrossel de serviços */}
      {servicos.length > 0 && (
        <>
          <SectionTitle align="center" text="Serviços em destaque" />
          <CarrosselServicos servicos={servicos} autoScrollTime={3000} infinite={true}/>
        </>
      )}

      {/* Usuários */}
      {usuarios.length > 0 && (
        <>
          <SectionTitle align="center" text="Usuários do Sistema" />
          <AccordionList items={usuarios} />
        </>
      )}
    </div>
  );
}
