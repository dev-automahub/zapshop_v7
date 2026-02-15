
import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { PurchaseOrder, Supplier, Product, OrderItem, User } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface EditPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder | null;
  suppliers: Supplier[];
  products: Product[];
  users: User[];
  onUpdateOrder: (order: PurchaseOrder) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const EditPurchaseOrderModal: React.FC<EditPurchaseOrderModalProps> = ({ 
    isOpen, 
    onClose, 
    order, 
    suppliers, 
    products, 
    users, 
    onUpdateOrder, 
    showToast 
}) => {
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
    const [items, setItems] = useState<OrderItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [assignedToId, setAssignedToId] = useState<string>('');
    const [status, setStatus] = useState<PurchaseOrder['status']>('pending');

    // Load order data when modal opens
    useEffect(() => {
        if (isOpen && order) {
            setSelectedSupplierId(order.supplier.id);
            setItems([...order.items]);
            setAssignedToId(order.assignedTo.id);
            setStatus(order.status);
            
            if (products.length > 0) {
                setSelectedProductId(products[0].id);
            }
        }
    }, [isOpen, order, products]);

    const total = useMemo(() => {
        return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }, [items]);
    
    const selectedProduct = useMemo(() => {
      return products.find(p => p.id === selectedProductId);
    }, [selectedProductId, products]);

    const handleAddProduct = () => {
        if (!selectedProduct) return;

        const existingItem = items.find(item => item.product.id === selectedProductId);

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
        if (quantity < 1) {
            handleRemoveItem(productId);
        } else {
            setItems(items.map(item => item.product.id === productId ? { ...item, quantity } : item));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;

        const supplier = suppliers.find(s => s.id === selectedSupplierId);
        const assignedTo = users.find(u => u.id === assignedToId);

        if (!supplier || items.length === 0 || !assignedTo) {
            showToast('Verifique os dados do pedido.', 'error');
            return;
        }

        const updatedOrder: PurchaseOrder = {
            ...order,
            supplier,
            items,
            total,
            assignedTo,
            status
        };

        onUpdateOrder(updatedOrder);
        onClose();
    };

    if (!order) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Pedido de Compra #${order.id.split('-')[1]}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="edit-supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fornecedor</label>
                        <select id="edit-supplier" value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary/50 focus:border-primary/50 sm:text-sm rounded-md">
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                         <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                         <select id="edit-status" value={status} onChange={e => setStatus(e.target.value as PurchaseOrder['status'])} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary/50 focus:border-primary/50 sm:text-sm rounded-md">
                            <option value="pending">Pendente</option>
                            <option value="ordered">Pedido Realizado</option>
                            <option value="received">Recebido</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Produtos</label>
                    <div className="mt-1">
                      <div className="flex items-center space-x-2">
                          <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary/50 focus:border-primary/50 sm:text-sm rounded-md">
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <button type="button" onClick={handleAddProduct} className="p-2 bg-primary text-white rounded-md hover:bg-primary/90 flex-shrink-0">
                              <Plus size={20} />
                          </button>
                      </div>
                    </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border dark:border-gray-600 rounded-md p-2">
                    {items.map(item => (
                        <div key={item.product.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                            <div>
                                <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.product.name}</p>
                                <p className="text-xs text-neutral-medium dark:text-gray-400">{item.product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="number" value={item.quantity} onChange={e => handleQuantityChange(item.product.id, parseInt(e.target.value, 10) || 1)} min="1" className="w-16 p-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md text-center" />
                                <button type="button" onClick={() => handleRemoveItem(item.product.id)} className="text-danger hover:text-danger/80">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-center text-sm text-gray-500">Nenhum produto adicionado.</p>}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                     <div className="mb-4">
                        <label htmlFor="edit-assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Responsável</label>
                        <select id="edit-assignedTo" value={assignedToId} onChange={e => setAssignedToId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary/50 focus:border-primary/50 sm:text-sm rounded-md">
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-between items-center text-right">
                        <span className="text-lg font-semibold text-neutral-dark dark:text-white">Total:</span>
                        <span className="text-xl font-bold text-primary">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                    <button type="submit" className="py-2 px-4 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">Salvar Alterações</button>
                </div>
            </form>
        </Modal>
    );
};

export default EditPurchaseOrderModal;
