import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FaSave, FaTimes, FaPlus, FaEdit, FaUserEdit } from 'react-icons/fa';
import ImageModal from '../../components/common/ImageModal';

export default function UsuarioForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams(); // id de outro usuário
  const location = useLocation();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const openImageModal = (imageUrl) => setSelectedImage(imageUrl);
  const closeImageModal = () => setSelectedImage(null);
  const isPerfil = location.pathname === '/perfil/editar';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

  useEffect(() => {
    if (id || isPerfil) {
      const endpoint = id ? `/users/${id}` : `/users/me`;
      api.get(endpoint)
        .then(res => {
          setNome(res.data.name);
          setEmail(res.data.email);

          if (res.data.image) {
            setPreview(`${API_URL}/uploads/${res.data.image}`);
          }
        })
        .catch(err => {
          console.error(err);
          setError(err.response?.status === 404 ? 'Usuário não encontrado.' : 'Erro ao carregar usuário.');
        });
    }
  }, [id, isPerfil, API_URL]);

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && closeImageModal();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

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

    try {
      if (id) {
        await api.put(`/users/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        navigate('/usuarios', { state: { successMessage: 'Usuário atualizado com sucesso!' } });
      } else if (isPerfil) {
        await api.put('/users/me', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        navigate('/', { state: { successMessage: 'Perfil atualizado com sucesso!' } });
      } else {
        await api.post('/users', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        navigate('/usuarios', { state: { successMessage: 'Usuário criado com sucesso!' } });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Erro ao salvar usuário.');
    }
  };

  const handleCancel = () => {
    if (id) navigate('/usuarios');
    else if (isPerfil) navigate('/');
    else navigate('/usuarios');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const title = id ? 'Editar Usuário' : isPerfil ? 'Editar Meu Perfil' : 'Novo Usuário';

  return (
    <div className="user-form-container">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {id ? <FaEdit size={18} style={{ marginRight: '5px' }} /> : isPerfil ? <FaUserEdit size={18} style={{ marginRight: '5px' }} /> : <FaPlus size={18} style={{ marginRight: '5px' }} />}
        {title}
      </h2>
      <form onSubmit={handleSubmit}>
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
        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder={id || isPerfil ? 'Preencha apenas se quiser alterar a senha' : 'Digite a senha'}
          error={error}
        />
        <div style={{ marginTop: '5px', marginBottom: '15px', fontSize: '14px' }}>
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

        <div style={{ marginBottom: '15px' }}>
          <label>Imagem do usuário</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'block', marginTop: '5px' }}
          />
          {preview && (
            <img
              src={preview}
              alt="Pré-visualização"
              style={{ width: 100, height: 100, objectFit: 'cover', marginTop: 10, borderRadius: 5, cursor: 'zoom-in' }}
              onClick={() => openImageModal(preview)}
              onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="100%" height="100%" fill="%23eee"/></svg>'; }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'center' }}>
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
