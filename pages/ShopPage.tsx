
import React, { useState, useMemo } from 'react';
import { Product, Customer, OrderItem } from '../types';
import { LayoutGrid, List, Package, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Modal from '../components/common/Modal';

interface ShopPageProps {
  products: Product[];
  currentShopCustomer: Customer;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onCreateOrder: (customer: Customer, items: OrderItem[], total: number) => void;
  cart: Record<string, number>;
  onCartQuantityChange: (product: Product, change: number) => void;
}

const ShopPage: React.FC<ShopPageProps> = ({ 
    products, 
    currentShopCustomer,
    showToast, 
    onCreateOrder, 
    cart, 
    onCartQuantityChange 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const totalItems = useMemo(() => {
    return (Object.values(cart) as number[]).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const totalValue = useMemo(() => {
    return (Object.entries(cart) as [string, number][]).reduce((sum, [id, qty]) => {
      const product = products.find(p => p.id === id);
      return sum + (product ? product.price * qty : 0);
    }, 0);
  }, [cart, products]);

  const handleInitiateFinishOrder = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmOrder = () => {
    if (!currentShopCustomer) {
        showToast('Erro de autenticação. Faça login novamente.', 'error');
        return;
    }

    const items: OrderItem[] = [];
    
    // Construct order items
    for (const [productId, quantity] of Object.entries(cart)) {
        const product = products.find(p => p.id === productId);
        if (product) {
            items.push({ product, quantity: quantity as number });
        }
    }

    if (items.length === 0) return;

    onCreateOrder(currentShopCustomer, items, totalValue);
    setIsConfirmModalOpen(false);
  };

  const QuantitySelector = ({ product, size = 'md' }: { product: Product, size?: 'sm' | 'md' }) => {
    const qty = cart[product.id] || 0;
    const isOutOfStock = product.stock === 0;
    const btnSize = size === 'sm' ? 'p-1' : 'p-1.5';
    const iconSize = size === 'sm' ? 14 : 16;
    const textSize = size === 'sm' ? 'w-6 text-sm' : 'w-8 text-base';

    return (
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button 
          onClick={() => onCartQuantityChange(product, -1)}
          disabled={qty === 0}
          className={`${btnSize} rounded-full transition-colors ${qty === 0 ? 'bg-gray-100 text-gray-300 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}
        >
          <Minus size={iconSize} />
        </button>
        <span className={`${textSize} text-center font-semibold ${qty > 0 ? 'text-primary' : 'text-gray-400'}`}>
          {qty}
        </span>
        <button 
          onClick={() => onCartQuantityChange(product, 1)}
          disabled={qty >= product.stock || isOutOfStock}
          className={`${btnSize} rounded-full transition-colors ${qty >= product.stock || isOutOfStock ? 'bg-gray-100 text-gray-300 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}
        >
          <Plus size={iconSize} />
        </button>
      </div>
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-24">
      {products.map(product => (
        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group flex flex-col h-full transition-colors">
          <div className="relative">
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
            {product.stock === 0 && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm">Esgotado</span>
                </div>
            )}
            <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                 <p className="font-bold text-primary">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </p>
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-semibold text-neutral-dark dark:text-white truncate text-lg mb-1" title={product.name}>{product.name}</h3>
            <p className="text-sm text-neutral-medium dark:text-gray-400 mb-4 flex items-center">
                <Package size={14} className="mr-1" />
                Estoque: {product.stock}
            </p>
            
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs text-neutral-medium dark:text-gray-400 font-mono">{product.sku}</span>
                <QuantitySelector product={product} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white dark:bg-gray-800 p-2 md:p-4 rounded-lg shadow-md pb-4 mb-24 transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
            <tr>
              <th scope="col" className="px-3 md:px-6 py-3 w-16 md:w-20">Img</th>
              <th scope="col" className="px-3 md:px-6 py-3">Produto</th>
              <th scope="col" className="hidden md:table-cell px-6 py-3">Estoque</th>
              <th scope="col" className="hidden md:table-cell px-6 py-3">Preço</th>
              <th scope="col" className="px-3 md:px-6 py-3 text-right">Qtd</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                <td className="px-3 md:px-6 py-4">
                  <div className="relative w-10 h-10 md:w-12 md:h-12">
                     <img src={product.imageUrl} alt={product.name} className={`h-full w-full rounded object-cover ${product.stock === 0 ? 'opacity-50' : ''}`} />
                     {product.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                             <span className="bg-red-500 text-white text-[8px] md:text-[10px] px-1 rounded">Esgotado</span>
                        </div>
                     )}
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px] md:max-w-none">{product.name}</span>
                        <span className="text-xs text-gray-400">{product.sku}</span>
                        {/* Mobile Only Details */}
                        <div className="md:hidden flex flex-col mt-1 text-xs">
                             <span className={`${product.stock < 5 ? 'text-orange-600 font-medium' : ''}`}>Est: {product.stock}</span>
                             <span className="font-semibold text-primary">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4">
                    <span className={`${product.stock < 5 ? 'text-orange-600 font-medium' : ''}`}>{product.stock}</span>
                </td>
                <td className="hidden md:table-cell px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-3 md:px-6 py-4 text-right">
                  <div className="flex justify-end">
                    <QuantitySelector product={product} size={window.innerWidth < 768 ? 'sm' : 'md'} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark dark:text-white transition-colors">Loja</h1>
        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1 transition-colors self-end sm:self-auto">
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

      {viewMode === 'grid' ? renderGridView() : renderListView()}

      {/* Floating Cart Footer */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[95%] md:w-auto z-40 animate-fade-in-down">
            <div className="bg-neutral-dark dark:bg-black text-white p-3 md:p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 md:gap-6 md:min-w-[400px]">
                <div className="flex items-center">
                    <div className="bg-primary p-2 md:p-3 rounded-lg mr-3 md:mr-4 relative">
                        <ShoppingBag size={20} className="md:h-6 md:w-6" />
                        <span className="absolute -top-2 -right-2 bg-action text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-neutral-dark dark:border-black">
                            {totalItems}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-gray-400">Total do Pedido</p>
                        <p className="text-lg md:text-xl font-bold">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>
                <button 
                    onClick={handleInitiateFinishOrder}
                    className="bg-white text-neutral-dark font-bold py-2 px-4 md:px-6 rounded-lg hover:bg-gray-100 transition-colors flex items-center text-sm md:text-base whitespace-nowrap"
                >
                    Ver Carrinho
                </button>
            </div>
        </div>
      )}

      {/* Cart Review Modal (formerly Confirmation Modal) */}
      <Modal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)} 
        title="Meu Carrinho"
      >
        <div className="flex flex-col h-full max-h-[80vh]">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6">
                {Object.keys(cart).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Seu carrinho está vazio.</p>
                ) : (
                    Object.entries(cart).map(([productId, qty]) => {
                        const product = products.find(p => p.id === productId);
                        if (!product) return null;
                        return (
                            <div key={productId} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                     <div className="relative w-12 h-12 flex-shrink-0">
                                        <img src={product.imageUrl} className="w-12 h-12 rounded-md object-cover" alt={product.name} />
                                     </div>
                                     <div className="min-w-0 flex-1">
                                         <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                                         <p className="text-xs text-gray-500">{product.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                                     </div>
                                </div>
                                <div className="flex items-center space-x-2 md:space-x-4 ml-2">
                                     <QuantitySelector product={product} size="sm" />
                                     <span className="text-sm font-bold w-16 md:w-20 text-right">
                                        {(product.price * qty).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                     </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold text-neutral-dark dark:text-white">
                    <span>Total</span>
                    <span className="text-primary">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Pedido para: <span className="font-bold">{currentShopCustomer.name}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Email: {currentShopCustomer.email}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button 
                        onClick={() => setIsConfirmModalOpen(false)} 
                        className="py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-medium order-2 sm:order-1"
                    >
                        Continuar Comprando
                    </button>
                    <button 
                        onClick={handleConfirmOrder} 
                        disabled={totalItems === 0}
                        className="py-3 px-4 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                    >
                        Finalizar Pedido <ArrowRight size={18} className="ml-2" />
                    </button>
                </div>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShopPage;
