import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import UsuarioList from '../pages/Usuario/UsuarioList';
import UsuarioForm from '../pages/Usuario/UsuarioForm';
import ServicoList from '../pages/Servico/ServicoList';
import ServicoForm from '../pages/Servico/ServicoForm';
import NavBar from '../components/common/NavBar';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/usuarios" element={<UsuarioList />} />
        <Route path="/usuarios/novo" element={<UsuarioForm />} />
        <Route path="/usuarios/editar/:id" element={<UsuarioForm />} />
        <Route path="/servicos" element={<ServicoList />} />
        <Route path="/servicos/novo" element={<ServicoForm />} />
        <Route path="/servicos/editar/:id" element={<ServicoForm />} />
      </Routes>
    </BrowserRouter>
  );
}
