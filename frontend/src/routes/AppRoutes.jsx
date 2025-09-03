import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import UsuarioList from "../pages/Usuario/UsuarioList";
import UsuarioForm from "../pages/Usuario/UsuarioForm";
import UsuarioView from '../pages/Usuario/UsuarioView';
import ServicoList from "../pages/Servico/ServicoList";
import ServicoForm from "../pages/Servico/ServicoForm";
import CategoriaList from '../pages/Categorias/CategoriaList';
import CategoriaForm from '../pages/Categorias/CategoriaForm';
import Login from "../pages/Login";
import PrivateRoute from "../components/PrivateRoute";
import PrivateLayout from "../layouts/PrivateLayout";
import PublicLayout from "../layouts/PublicLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública com layout */}
        <Route
          path="/login"
          element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          }
        />

        {/* Rotas privadas com layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <Home />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <UsuarioList />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/novo"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <UsuarioForm />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/editar/:id"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <UsuarioForm />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <UsuarioView />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil/editar"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <UsuarioForm />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/servicos"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <ServicoList tipo="geral"/>
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/servicos/novo"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <ServicoForm />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/servicos/editar/:id"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <ServicoForm />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/meus-servicos"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <ServicoList tipo="meus"/>
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <CategoriaList />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categorias/novo"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <CategoriaForm />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categorias/editar/:id"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <CategoriaForm />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
