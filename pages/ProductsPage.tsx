
import React, { useState } from 'react';
import { Product } from '../types';
import { PlusCircle, Edit, Trash2, LayoutGrid, List, Package } from 'lucide-react';
import Modal from '../components/common/Modal';

interface ProductsPageProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ products, setProducts, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>({ id: '', name: '', sku: '', price: 0, imageUrl: '', stock: 0, supplierId: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const openModalForNew = () => {
    setEditingProduct(null);
    const newId = `prod-${Date.now()}`;
    setFormData({ id: newId, name: '', sku: '', price: 0, imageUrl: `https://picsum.photos/seed/${newId}/200`, stock: 0, supplierId: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === formData.id ? formData : p));
      showToast('Produto atualizado com sucesso!');
    } else {
      setProducts(prev => [...prev, formData]);
      showToast('Produto adicionado com sucesso!');
    }
    handleCloseModal();
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      showToast('Produto excluído.', 'success');
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group transition-colors">
          <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="font-semibold text-neutral-dark dark:text-white truncate">{product.name}</h3>
            <p className="text-sm text-neutral-medium dark:text-gray-400">SKU: {product.sku}</p>
            <div className="flex justify-between items-center mt-2">
                <p className="text-lg font-bold text-primary">
                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <div className="flex items-center text-sm text-neutral-medium dark:text-gray-400">
                    <Package size={14} className="mr-1" />
                    <span>{product.stock}</span>
                </div>
            </div>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-2">
              <button onClick={() => openModalForEdit(product)} className="text-primary hover:text-primary/80"><Edit size={18} /></button>
              <button onClick={() => handleDelete(product.id)} className="text-danger hover:text-danger/80"><Trash2 size={18} /></button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3 w-20">Imagem</th>
              <th scope="col" className="px-6 py-3">Nome</th>
              <th scope="col" className="px-6 py-3">SKU</th>
              <th scope="col" className="px-6 py-3">Estoque</th>
              <th scope="col" className="px-6 py-3">Preço</th>
              <th scope="col" className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4">
                  <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover" />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {product.name}
                </td>
                <td className="px-6 py-4">{product.sku}</td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openModalForEdit(product)} className="font-medium text-primary hover:underline mr-4"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(product.id)} className="font-medium text-danger hover:underline"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-neutral-dark dark:text-white transition-colors">Produtos</h1>
            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1 transition-colors">
                <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm dark:bg-gray-600 dark:text-white' : 'text-gray-500 hover:text-primary dark:text-gray-400'}`}
                    aria-label="Visualização em Grade"
                >
                    <LayoutGrid size={20} />
                </button>
                 <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-primary shadow-sm dark:bg-gray-600 dark:text-white' : 'text-gray-500 hover:text-primary dark:text-gray-400'}`}
                    aria-label="Visualização em Lista"
                >
                    <List size={20} />
                </button>
            </div>
        </div>
        <button
          onClick={openModalForNew}
          className="bg-action hover:bg-action/90 text-white font-bold py-2 px-4 rounded-full flex items-center transition-colors duration-200"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Novo Produto
        </button>
      </div>

      {viewMode === 'grid' ? renderGridView() : renderListView()}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Editar Produto' : 'Novo Produto'}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Produto</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
              <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estoque</label>
              <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço</label>
            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
           <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL da Imagem</label>
            <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={handleCloseModal} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
