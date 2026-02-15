
import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../common/Modal';
import { Customer, Product, Order, OrderItem, User } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

type NewOrderData = Omit<Order, 'id' | 'createdAt' | 'status'>;

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  products: Product[];
  users: User[];
  onAddOrder: (order: NewOrderData) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, customers, products, users, onAddOrder, showToast }) => {
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [items, setItems] = useState<OrderItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [assignedToId, setAssignedToId] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            // Reset the form for a new order
            setItems([]);
            if (products.length > 0) {
                setSelectedProductId(products[0].id);
            }
            if(customers.length > 0) {
                setSelectedCustomerId(customers[0].id);
            }
            if(users.length > 0) {
                setAssignedToId(users[0].id);
            }
        }
    }, [products, customers, users, isOpen]);


    const total = useMemo(() => {
        return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }, [items]);
    
    const selectedProduct = useMemo(() => {
      return products.find(p => p.id === selectedProductId);
    }, [selectedProductId, products]);

    const resetForm = () => {
        setSelectedCustomerId(customers.length > 0 ? customers[0].id : '');
        setItems([]);
        setSelectedProductId(products.length > 0 ? products[0].id : '');
        setAssignedToId(users.length > 0 ? users[0].id : '');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    }

    const handleAddProduct = () => {
        if (!selectedProduct) return;

        const existingItem = items.find(item => item.product.id === selectedProductId);
        const newQuantity = (existingItem?.quantity || 0) + 1;

        if (newQuantity > selectedProduct.stock) {
            showToast(`Estoque insuficiente para ${selectedProduct.name}. Disponível: ${selectedProduct.stock}`, 'error');
            return;
        }

        if (existingItem) {
            setItems(items.map(item => item.product.id === selectedProductId ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setItems([...items, { product: selectedProduct, quantity: 1 }]);
        }
    };

    const handleRemoveItem = (productId: string) => {
        setItems(items.filter(item => item.product.id !== productId));
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        const productInStock = products.find(p => p.id === productId);
        if (!productInStock) return;

        if (quantity > productInStock.stock) {
            showToast(`Estoque insuficiente para ${productInStock.name}. Disponível: ${productInStock.stock}`, 'error');
            return;
        }

        if (quantity < 1) {
            handleRemoveItem(productId);
        } else {
            setItems(items.map(item => item.product.id === productId ? { ...item, quantity } : item));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const customer = customers.find(c => c.id === selectedCustomerId);
        const assignedTo = users.find(u => u.id === assignedToId);

        let currentItems = [...items];

        if (currentItems.length === 0 && selectedProduct) {
             if (1 > selectedProduct.stock) {
                showToast(`Estoque insuficiente para ${selectedProduct.name}. Disponível: ${selectedProduct.stock}`, 'error');
                return;
            }
            currentItems.push({ product: selectedProduct, quantity: 1 });
        }

        if (!customer || currentItems.length === 0 || !assignedTo) {
            showToast('Selecione um cliente e adicione pelo menos um produto.', 'error');
            return;
        }

        const finalTotal = currentItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

        onAddOrder({
            customer,
            items: currentItems,
            total: finalTotal,
            assignedTo,
            tags: [],
        });
        
        // Don't call handleClose here, as App.tsx will close it on success
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Criar Novo Pedido">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Cliente</label>
                    <select id="customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary/50 focus:border-primary/50 sm:text-sm rounded-md">
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Produtos</label>
                    <div className="mt-1">
                      <div className="flex items-center space-x-2">
                          <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary/50 focus:border-primary/50 sm:text-sm rounded-md">
                              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Estoque: {p.stock})</option>)}
                          </select>
                          <button type="button" onClick={handleAddProduct} className="p-2 bg-primary text-white rounded-md hover:bg-primary/90 flex-shrink-0">
                              <Plus size={20} />
                          </button>
                      </div>
                      {selectedProduct && (
                        <p className="text-right text-sm text-neutral-medium mt-1 pr-12">
                          {selectedProduct.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      )}
                    </div>
                </div>

                {items.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border rounded-md p-2">
                        {items.map(item => (
                            <div key={item.product.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                <div>
                                    <p className="font-semibold text-sm">{item.product.name}</p>
                                    <p className="text-xs text-neutral-medium">{item.product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="number" value={item.quantity} onChange={e => handleQuantityChange(item.product.id, parseInt(e.target.value, 10) || 1)} min="1" className="w-16 p-1 border border-gray-300 rounded-md text-center" />
                                    <button type="button" onClick={() => handleRemoveItem(item.product.id)} className="text-danger hover:text-danger/80">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-4 border-t">
                     <div className="mb-4">
                        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Atribuir a</label>
                        <select id="assignedTo" value={assignedToId} onChange={e => setAssignedToId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary/50 focus:border-primary/50 sm:text-sm rounded-md">
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-between items-center text-right">
                        <span className="text-lg font-semibold text-neutral-dark">Total:</span>
                        <span className="text-xl font-bold text-primary">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={handleClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="py-2 px-4 bg-action text-white font-bold rounded-lg hover:bg-action/90">Criar Pedido</button>
                </div>
            </form>
        </Modal>
    );
};

export default NewOrderModal;
