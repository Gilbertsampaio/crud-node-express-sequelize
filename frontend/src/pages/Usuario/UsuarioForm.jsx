// src/pages/UsuarioForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api/api';
import Input from '../../components/common/Input';
import FileInput from '../../components/common/FileInput';
import Button from '../../components/common/Button';
import { FaSave, FaTimes, FaPlus, FaEdit, FaUserEdit, FaTrash } from 'react-icons/fa';
import ImageModal from '../../components/common/ImageModal';
import LoadingModal from '../../components/common/LoadingModal';
import useAuth from "../../context/useAuth";
import './UsuarioList.css';

export default function UsuarioForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [resetFileInput, setResetFileInput] = useState(false);
  const [fileInputTitle, setFileInputTitle] = useState("Escolher Arquivo");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isPerfil = location.pathname === '/perfil/editar';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';
  const { user } = useAuth();

  const openImageModal = (imageUrl) => setSelectedImage(imageUrl);
  const closeImageModal = () => setSelectedImage(null);

  // Buscar usuário existente
  useEffect(() => {
    if (id || isPerfil) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const endpoint = id ? `/users/${id}` : `/users/me`;
          const res = await api.get(endpoint);
          setNome(res.data.name);
          setEmail(res.data.email);
          if (res.data.image) {
            setPreview(`${API_URL}/uploads/${res.data.image}`);
            setFileInputTitle(res.data.image);
          }
        } catch (err) {
          console.error(err);
          if (err.response.data.error === 'logout') {
            setError(err.response.data.error);
          } else {
            setError(err.response?.status === 404 ? 'Usuário não encontrado.' : 'Erro ao carregar usuário.');
          }
        } finally {
          setTimeout(() => setLoading(false), 0);
        }
      };
      fetchUser();
    }
  }, [id, isPerfil, API_URL]);

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && closeImageModal();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setError('');
    if (preview) setRemoveExistingImage(true);
    setFileInputTitle("Escolher Arquivo");
    setResetFileInput(true);
    setTimeout(() => setResetFileInput(false), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setError('Nome e email são obrigatórios.');
      return;
    }

    const formData = new FormData();
    formData.append('name', nome);
    formData.append('email', email);
    if (senha.trim()) formData.append('password', senha);
    if (image) formData.append('image', image);
    if (removeExistingImage) formData.append('removeImage', 'true');

    try {
      setLoading(true);
      if (id) {
        await api.put(`/users/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        navigate('/usuarios', { state: { successMessage: 'Usuário atualizado com sucesso!' } });
      } else if (isPerfil) {
        await api.put(`/users/${user.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        navigate('/', { state: { successMessage: 'Perfil atualizado com sucesso!' } });
      } else {
        await api.post('/users', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        navigate('/usuarios', { state: { successMessage: 'Usuário criado com sucesso!' } });
      }
    } catch (err) {
      console.error(err);
      if (err.response.data.error === 'logout') {
        setError(err.response.data.error);
      } else {
        setError(err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Erro ao salvar usuário.');
      }
    } finally {
      setTimeout(() => setLoading(false), 0); // delay de 2s para efeito visual
    }
  };

  const handleCancel = () => {
    if (id) navigate('/usuarios');
    else if (isPerfil) navigate('/');
    else navigate('/usuarios');
  };

  const title = id ? 'Editar Usuário' : isPerfil ? 'Editar Meu Perfil' : 'Novo Usuário';

  return (
    <div className="user-form-container">
      <LoadingModal show={loading} /> {/* modal de loading acima do conteúdo */}

      <h2 style={{ textAlign: 'center', marginBottom: '0px' }}>
        {id ? <FaEdit size={18} style={{ marginRight: '5px' }} />
          : isPerfil ? <FaUserEdit size={18} style={{ marginRight: '5px' }} />
            : <FaPlus size={18} style={{ marginRight: '5px' }} />}
        {title}
      </h2>

      {error && error !== 'logout' && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <Input
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome do usuário"
            error={error}
          />
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite o email do usuário"
            error={error}
          />
        </div>

        <div className="form-row mb-0">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder={id || isPerfil ? 'Preencha apenas se quiser alterar a senha' : 'Digite a senha'}
            error={error}
          />
          <FileInput
            label="Imagem do Usuário"
            titulo={fileInputTitle}
            onChange={handleFileChange}
            accept="image/*"
            error={error}
            reset={resetFileInput}
          />
        </div>

        <div className="form-row mb-0">
          <div style={{ marginTop: '0px', marginBottom: '0px', fontSize: '14px' }}>
            <label style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                style={{ marginRight: '5px' }}
              />
              Mostrar senha
            </label>
          </div>
        </div>

        {preview && (
          <div className="form-row mb-0">
            <div className="input-group preview-container">
              <img
                src={preview}
                alt="Pré-visualização"
                className="img-preview"
                onClick={() => openImageModal(preview)}
                onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="100%" height="100%" fill="%23eee"/></svg>'; }}
              />
              <button
                type="button"
                className="remove-image-btn"
                onClick={handleRemoveImage}
                title="Remover imagem"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '0px', justifyContent: 'end' }}>
          <Button className="btn-danger" type="button" onClick={handleCancel}>
            <FaTimes style={{ marginRight: '5px' }} /> Cancelar
          </Button>
          <Button type="submit">
            <FaSave style={{ marginRight: '5px' }} /> {id || isPerfil ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>

      <ImageModal
        show={!!selectedImage}
        imageUrl={selectedImage}
        onClose={closeImageModal}
      />
    </div>
  );
}
