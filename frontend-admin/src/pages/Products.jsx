import { useState } from 'react';
import { useProductsQuery, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatImageUrl } from '../services/imageService';

const Products = () => {
  const { data: products, isLoading: isFetching, isError } = useProductsQuery();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', image: '' });
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const isWorking = isCreating || isUpdating || isDeleting || isUploading;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload automático ao selecionar
    await handleUpload(file);
  };

  const handleUpload = async (file) => {
    const uploadData = new FormData();
    uploadData.append('image', file);

    setIsUploading(true);
    try {
      const response = await api.post('/products/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormData(prev => ({ ...prev, image: response.data.url }));
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      const msg = error.response?.data?.error || 'Erro ao fazer upload da imagem';
      toast.error(msg);
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      updateProduct({ id: editingId, ...formData }, {
        onSuccess: () => {
          toast.success('Produto atualizado com sucesso!');
          handleCancelEdit();
        },
        onError: () => toast.error('Erro ao atualizar produto.')
      });
    } else {
      createProduct(formData, {
        onSuccess: () => {
          toast.success('Produto criado com sucesso!');
          setFormData({ name: '', description: '', price: '', stock: '', image: '' });
          setImagePreview(null);
          // Reset file input
          const fileInput = document.getElementById('product-image-input');
          if (fileInput) fileInput.value = '';
        },
        onError: () => toast.error('Erro ao criar produto.')
      });
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      image: product.image || ''
    });
    setImagePreview(product.image || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', stock: '', image: '' });
    setImagePreview(null);
    const fileInput = document.getElementById('product-image-input');
    if (fileInput) fileInput.value = '';
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id, {
        onSuccess: () => toast.success('Produto deletado.'),
        onError: () => toast.error('Erro ao deletar produto.')
      });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Produtos</h1>
        <p className="page-subtitle">Gerencie o inventário e os detalhes dos produtos da sua loja.</p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontWeight: 600 }}>{editingId ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', alignItems: 'start' }}>
          <div>
            <label className="input-label">Nome do Produto</label>
            <input
              placeholder="Ex: Teclado Mecânico RGB"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isWorking}
            />
          </div>
          <div>
            <label className="input-label">Descrição</label>
            <input
              placeholder="Descrição curta do produto"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isWorking}
            />
          </div>
          <div>
            <label className="input-label">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              disabled={isWorking}
            />
          </div>
          <div>
            <label className="input-label">Estoque</label>
            <input
              type="number"
              placeholder="Quantidade disponível"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
              disabled={isWorking}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Imagem do Produto</label>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '12px', 
                  border: '2px dashed var(--border-color)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background: 'var(--bg-secondary)',
                  position: 'relative'
                }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem' }}>Sem imagem</span>
                )}
                {isUploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>
                    Enviando...
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  id="product-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isWorking}
                  style={{ marginBottom: '0.5rem' }}
                />
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Formatos aceitos: JPG, PNG. Tamanho máx: 2MB.
                </p>
                {formData.image && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--success)', wordBreak: 'break-all' }}>
                    ✓ URL: {formData.image}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={isWorking} className="btn-primary">
              {isCreating ? 'Criando...' : isUpdating ? 'Atualizando...' : isUploading ? 'Aguarde o Upload...' : editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handleCancelEdit} 
                disabled={isWorking}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-container">
        {isError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>Erro ao carregar produtos.</div>}
        
        <table className="table">
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Produto</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <>
                <tr><td colSpan="5"><div className="skeleton-row"></div></td></tr>
                <tr><td colSpan="5"><div className="skeleton-row"></div></td></tr>
              </>
            ) : products?.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Nenhum produto cadastrado até o momento.</td>
              </tr>
            ) : (
              products?.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                      {p.image ? (
                        <img src={formatImageUrl(p.image)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>N/A</div>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>R$ {parseFloat(p.price).toFixed(2)}</td>
                  <td>
                    <span style={{ 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '2rem', 
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      background: p.stock > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: p.stock > 0 ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {p.stock} em estoque
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleEditClick(p)} 
                      disabled={isWorking}
                      style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', marginRight: '0.5rem' }}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => handleDelete(p.id)} 
                      disabled={isWorking}
                      style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
