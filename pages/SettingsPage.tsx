
import React, { useState } from 'react';
import { KanbanBoardData, KanbanColumn, Order, User, Product, Supplier } from '../types';
import { Trash2, Save, PlusCircle, Settings, Users, Link, Bell, Edit, ArrowUp, ArrowDown, Package, LayoutGrid, List, Truck, Mail, Phone, Contact } from 'lucide-react';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Modal from '../components/common/Modal';
import UserMigrationModal from '../components/settings/UserMigrationModal';

interface SettingsPageProps {
  boardData: KanbanBoardData;
  setBoardData: React.Dispatch<React.SetStateAction<KanbanBoardData>>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onDeleteUser: (userId: string) => void;
  onDeleteUserAndMigrateOrders: (userIdToDelete: string, migrationTargetUserId: string) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  boardData, 
  setBoardData, 
  showToast, 
  users, 
  setUsers, 
  onDeleteUser, 
  onDeleteUserAndMigrateOrders, 
  products, 
  setProducts,
  suppliers,
  setSuppliers
}) => {
  const [activeTab, setActiveTab] = useState('kanban');
  
  // --- Kanban Settings State ---
  const [editableBoard, setEditableBoard] = useState<KanbanBoardData>(JSON.parse(JSON.stringify(boardData)));
  const [deletingPhaseId, setDeletingPhaseId] = useState<string | null>(null);
  const [isPhaseEditModalOpen, setIsPhaseEditModalOpen] = useState(false);
  const [phaseEditFormData, setPhaseEditFormData] = useState<KanbanColumn | null>(null);


  // --- User Settings State ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<User>({ id: '', name: '', email: '', avatarUrl: '', role: 'Vendedor' });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [migrationInfo, setMigrationInfo] = useState<{ user: User; orderCount: number } | null>(null);

  // --- Product Settings State ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Product>({ id: '', name: '', sku: '', price: 0, imageUrl: '', stock: 0, supplierId: '' });
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('list');

  // --- Supplier Settings State ---
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierFormData, setSupplierFormData] = useState<Supplier>({ id: '', name: '', contactName: '', email: '', phone: '' });


  // --- Kanban Settings Handlers ---
  const handleAddPhase = () => {
    const newId = `phase-${Date.now()}`;
    const newPhase: KanbanColumn = {
        id: newId,
        title: 'Nova Fase',
        color: 'bg-gray-200',
        orders: []
    };
    setPhaseEditFormData(newPhase);
    setIsPhaseEditModalOpen(true);
  };

  const handleConfirmDeletePhase = () => {
    if (!deletingPhaseId) return;
    
    const boardKeys = Object.keys(editableBoard);
    const deletingIndex = boardKeys.indexOf(deletingPhaseId);

    if (deletingIndex <= 0 || deletingIndex >= boardKeys.length - 1) {
      showToast('A primeira e a última fase não podem ser excluídas.', 'error');
      setDeletingPhaseId(null);
      return;
    }

    const previousPhaseId = boardKeys[deletingIndex - 1];
    const ordersToMove = editableBoard[deletingPhaseId].orders;
    
    const newBoard = { ...editableBoard };
    
    if (newBoard[previousPhaseId] && ordersToMove.length > 0) {
      const updatedOrdersToMove = ordersToMove.map(order => ({...order, status: previousPhaseId}));
      newBoard[previousPhaseId].orders.push(...updatedOrdersToMove);
    }
    
    delete newBoard[deletingPhaseId];
    
    setEditableBoard(newBoard);
    setDeletingPhaseId(null);
  };
  
  const handleSaveChanges = () => {
    if (Object.keys(editableBoard).length < 2) {
      showToast('O Kanban deve ter pelo menos duas fases.', 'error');
      return;
    }
    setBoardData(editableBoard);
    showToast('Configurações salvas com sucesso!', 'success');
  };

  const handleMovePhase = (phaseId: string, direction: 'up' | 'down') => {
      const keys = Object.keys(editableBoard);
      const index = keys.indexOf(phaseId);

      if ((direction === 'up' && index <= 0) || (direction === 'down' && index >= keys.length - 1)) {
          return;
      }

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [keys[index], keys[newIndex]] = [keys[newIndex], keys[index]]; // Swap

      const newBoard: KanbanBoardData = {};
      keys.forEach(key => {
          newBoard[key] = editableBoard[key];
      });

      setEditableBoard(newBoard);
  };

  const openPhaseEditModal = (phase: KanbanColumn) => {
    setPhaseEditFormData({ ...phase });
    setIsPhaseEditModalOpen(true);
  };

  const handleClosePhaseEditModal = () => {
    setIsPhaseEditModalOpen(false);
    setPhaseEditFormData(null);
  };

  const handleUpdatePhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phaseEditFormData) return;
    
    setEditableBoard(prev => ({
        ...prev,
        [phaseEditFormData.id]: { ...prev[phaseEditFormData.id], ...phaseEditFormData }
    }));

    handleClosePhaseEditModal();
  };


  // --- User Settings Handlers ---
  const openUserModalForNew = () => {
    setEditingUser(null);
    const newId = `user-${Date.now()}`;
    setUserFormData({ id: newId, name: '', email: '', avatarUrl: `https://i.pravatar.cc/150?u=${newId}`, role: 'Vendedor' });
    setIsUserModalOpen(true);
  };

  const openUserModalForEdit = (user: User) => {
    setEditingUser(user);
    setUserFormData(user);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  };
  
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({ ...prev, [name]: value as User['role'] | string }));
  };
  
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === userFormData.id ? userFormData : u));
      showToast('Usuário atualizado com sucesso!');
    } else {
      setUsers(prev => [...prev, userFormData]);
      showToast('Usuário adicionado com sucesso!');
    }
    handleCloseUserModal();
  };
  
  const handleInitiateUserDeletion = (userToDelete: User) => {
    if (users.length <= 1) {
        showToast('Não é possível excluir o único usuário.', 'error');
        return;
    }
    const assignedOrders = (Object.values(boardData) as KanbanColumn[])
        .flatMap(column => column.orders)
        .filter(order => order.assignedTo.id === userToDelete.id);

    if (assignedOrders.length > 0) {
        setMigrationInfo({ user: userToDelete, orderCount: assignedOrders.length });
    } else {
        setDeletingUserId(userToDelete.id);
    }
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUserId) return;
    onDeleteUser(deletingUserId);
    setDeletingUserId(null);
  };

  // --- Product Settings Handlers ---
  const openProductModalForNew = () => {
    setEditingProduct(null);
    const newId = `prod-${Date.now()}`;
    const defaultSupplierId = suppliers.length > 0 ? suppliers[0].id : '';
    setProductFormData({ id: newId, name: '', sku: '', price: 0, imageUrl: `https://picsum.photos/seed/${newId}/200`, stock: 0, supplierId: defaultSupplierId });
    setIsProductModalOpen(true);
  };

  const openProductModalForEdit = (product: Product) => {
    setEditingProduct(product);
    setProductFormData(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseFloat(value) || 0 : value;
    setProductFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === productFormData.id ? productFormData : p));
      showToast('Produto atualizado com sucesso!');
    } else {
      setProducts(prev => [...prev, productFormData]);
      showToast('Produto adicionado com sucesso!');
    }
    handleCloseProductModal();
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      showToast('Produto excluído.', 'success');
    }
  };
  
  const getSupplierName = (supplierId: string) => {
      const supplier = suppliers.find(s => s.id === supplierId);
      return supplier ? supplier.name : 'N/A';
  }

  // --- Supplier Settings Handlers ---
  const openSupplierModalForNew = () => {
    setEditingSupplier(null);
    const newId = `sup-${Date.now()}`;
    setSupplierFormData({ id: newId, name: '', contactName: '', email: '', phone: '' });
    setIsSupplierModalOpen(true);
  };

  const openSupplierModalForEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierFormData(supplier);
    setIsSupplierModalOpen(true);
  };

  const handleCloseSupplierModal = () => {
    setIsSupplierModalOpen(false);
    setEditingSupplier(null);
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSupplierFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === supplierFormData.id ? supplierFormData : s));
      showToast('Fornecedor atualizado com sucesso!');
    } else {
      setSuppliers(prev => [...prev, supplierFormData]);
      showToast('Fornecedor adicionado com sucesso!');
    }
    handleCloseSupplierModal();
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      setSuppliers(prev => prev.filter(s => s.id !== supplierId));
      showToast('Fornecedor excluído.', 'success');
    }
  };


  // --- Render Functions ---
  const availableColors = [
    'bg-blue-200', 'bg-yellow-200', 'bg-orange-200', 'bg-green-200', 
    'bg-purple-200', 'bg-teal-200', 'bg-pink-200', 'bg-gray-300'
  ];
  
  const renderKanbanSettings = () => {
    const phaseArray = Object.values(editableBoard) as KanbanColumn[];
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h2 className="text-xl font-bold text-neutral-dark dark:text-white">Gerenciar Fases</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={handleAddPhase} className="flex items-center bg-action text-white font-bold py-2 px-4 rounded-lg hover:bg-action/90 text-sm">
                        <PlusCircle size={16} className="mr-2"/>
                        Nova Fase
                    </button>
                    <button onClick={handleSaveChanges} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary/90 text-sm">
                        <Save size={16} className="mr-2"/>
                        Salvar
                    </button>
                </div>
            </div>
            <div className="space-y-3">
                {phaseArray.map((phase, index) => (
                    <div key={phase.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg transition-colors">
                        <div className={`w-8 h-8 rounded-md ${phase.color} shrink-0`}></div>
                        <div className="flex-grow min-w-[120px]">
                             <p className="p-2 text-gray-800 dark:text-gray-200 font-medium truncate">{phase.title}</p>
                        </div>
                        <div className="flex items-center text-neutral-medium dark:text-gray-400 ml-auto sm:ml-0">
                            <button
                                onClick={() => handleMovePhase(phase.id, 'up')}
                                disabled={index === 0}
                                className="p-2 hover:text-primary disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed"
                                title="Mover para cima"
                            >
                                <ArrowUp size={20} />
                            </button>
                             <button
                                onClick={() => handleMovePhase(phase.id, 'down')}
                                disabled={index === phaseArray.length - 1}
                                className="p-2 hover:text-primary disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed"
                                title="Mover para baixo"
                            >
                                <ArrowDown size={20} />
                            </button>
                            <button
                                onClick={() => openPhaseEditModal(phase)}
                                className="p-2 hover:text-primary"
                                title="Editar nome da fase"
                            >
                                <Edit size={20} />
                            </button>
                            <button 
                              onClick={() => setDeletingPhaseId(phase.id)} 
                              disabled={index === 0 || index === phaseArray.length - 1}
                              className="text-danger hover:text-danger/80 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed p-2"
                              title={index === 0 || index === phaseArray.length - 1 ? 'A primeira e a última fase não podem ser excluídas' : 'Excluir fase'}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }
  
  const renderUserSettings = () => (
     <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-neutral-dark dark:text-white">Usuários</h2>
            <button onClick={openUserModalForNew} className="flex items-center bg-action text-white font-bold py-2 px-4 rounded-lg hover:bg-action/90 text-sm">
                <PlusCircle size={16} className="mr-2"/>
                <span className="hidden sm:inline">Adicionar Usuário</span>
                <span className="sm:hidden">Add</span>
            </button>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3">Nome</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Perfil</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap flex items-center">
                    <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full mr-3" />
                    {user.name}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Admin' ? 'bg-primary/20 text-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openUserModalForEdit(user)} className="font-medium text-primary hover:underline mr-4"><Edit size={16} /></button>
                    <button onClick={() => handleInitiateUserDeletion(user)} className="font-medium text-danger hover:underline"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
             {users.map(user => (
                 <div key={user.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 flex flex-col gap-3">
                     <div className="flex items-center space-x-3">
                         <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full" />
                         <div>
                             <h3 className="font-bold text-gray-900 dark:text-white">{user.name}</h3>
                             <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                         </div>
                         <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${user.role === 'Admin' ? 'bg-primary/20 text-primary' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-300'}`}>
                            {user.role}
                         </span>
                     </div>
                     <div className="flex justify-end border-t border-gray-200 dark:border-gray-600 pt-2 gap-3">
                        <button onClick={() => openUserModalForEdit(user)} className="text-primary flex items-center text-sm"><Edit size={16} className="mr-1"/> Editar</button>
                        <button onClick={() => handleInitiateUserDeletion(user)} className="text-danger flex items-center text-sm"><Trash2 size={16} className="mr-1"/> Excluir</button>
                     </div>
                 </div>
             ))}
        </div>
    </div>
  );

  const renderProductsSettings = () => (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div className="flex items-center justify-between w-full sm:w-auto space-x-4">
                <h2 className="text-xl font-bold text-neutral-dark dark:text-white">Produtos</h2>
                <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1 transition-colors">
                    <button 
                        onClick={() => setProductViewMode('grid')} 
                        className={`p-1.5 rounded-md transition-colors ${productViewMode === 'grid' ? 'bg-white text-primary shadow-sm dark:bg-gray-600 dark:text-white' : 'text-gray-500 hover:text-primary dark:text-gray-400'}`}
                        aria-label="Visualização em Grade"
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button 
                        onClick={() => setProductViewMode('list')} 
                        className={`p-1.5 rounded-md transition-colors ${productViewMode === 'list' ? 'bg-white text-primary shadow-sm dark:bg-gray-600 dark:text-white' : 'text-gray-500 hover:text-primary dark:text-gray-400'}`}
                        aria-label="Visualização em Lista"
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>
            <button onClick={openProductModalForNew} className="w-full sm:w-auto flex items-center justify-center bg-action text-white font-bold py-2 px-4 rounded-lg hover:bg-action/90 text-sm">
                <PlusCircle size={16} className="mr-2"/>
                Adicionar Produto
            </button>
        </div>

        {productViewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
                <div key={product.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden group transition-colors">
                <img src={product.imageUrl} alt={product.name} className="w-full h-32 md:h-40 object-cover" />
                <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-neutral-dark dark:text-white truncate">{product.name}</h3>
                    <p className="text-sm text-neutral-medium dark:text-gray-400">SKU: {product.sku}</p>
                    <p className="text-xs text-neutral-medium dark:text-gray-500 mt-1 flex items-center truncate">
                        <Truck size={12} className="mr-1 shrink-0" />
                        {getSupplierName(product.supplierId)}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-base md:text-lg font-bold text-primary">
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <div className="flex items-center text-sm text-neutral-medium dark:text-gray-400">
                            <Package size={14} className="mr-1" />
                            <span>{product.stock}</span>
                        </div>
                    </div>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-600 flex justify-end space-x-2">
                    <button onClick={() => openProductModalForEdit(product)} className="text-primary hover:text-primary/80"><Edit size={18} /></button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="text-danger hover:text-danger/80"><Trash2 size={18} /></button>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <>
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
                        <tr>
                        <th scope="col" className="px-6 py-3 w-20">Imagem</th>
                        <th scope="col" className="px-6 py-3">Nome</th>
                        <th scope="col" className="px-6 py-3">SKU</th>
                        <th scope="col" className="px-6 py-3">Fornecedor</th>
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
                            <td className="px-6 py-4">{getSupplierName(product.supplierId)}</td>
                            <td className="px-6 py-4">{product.stock}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-6 py-4 text-right">
                            <button onClick={() => openProductModalForEdit(product)} className="font-medium text-primary hover:underline mr-4"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="font-medium text-danger hover:underline"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                
                 {/* Mobile Product List */}
                 <div className="md:hidden space-y-3">
                    {products.map(product => (
                        <div key={product.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600 flex gap-3">
                            <img src={product.imageUrl} alt={product.name} className="h-16 w-16 rounded object-cover bg-gray-100" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
                                    <span className="font-bold text-primary text-sm">
                                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-1">
                                    <p>SKU: {product.sku}</p>
                                    <p>Estoque: {product.stock}</p>
                                    <p className="truncate">Forn: {getSupplierName(product.supplierId)}</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between items-end pl-2 border-l border-gray-100 dark:border-gray-600">
                                 <button onClick={() => openProductModalForEdit(product)} className="text-primary p-1"><Edit size={18} /></button>
                                 <button onClick={() => handleDeleteProduct(product.id)} className="text-danger p-1"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                 </div>
            </>
        )}
    </div>
  );

  const renderSuppliersSettings = () => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-neutral-dark dark:text-white">Fornecedores</h2>
            <button onClick={openSupplierModalForNew} className="flex items-center bg-action text-white font-bold py-2 px-4 rounded-lg hover:bg-action/90 text-sm">
                <PlusCircle size={16} className="mr-2"/>
                <span className="hidden sm:inline">Adicionar Fornecedor</span>
                <span className="sm:hidden">Add</span>
            </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
                <tr>
                <th scope="col" className="px-6 py-3">Fornecedor</th>
                <th scope="col" className="px-6 py-3">Contato</th>
                <th scope="col" className="px-6 py-3">Telefone</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                </tr>
            </thead>
            <tbody>
                {suppliers.map(supplier => (
                <tr key={supplier.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {supplier.name}
                    </td>
                    <td className="px-6 py-4">{supplier.contactName}</td>
                    <td className="px-6 py-4">{supplier.phone}</td>
                    <td className="px-6 py-4">{supplier.email}</td>
                    <td className="px-6 py-4 text-right">
                    <button onClick={() => openSupplierModalForEdit(supplier)} className="font-medium text-primary hover:underline mr-4"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteSupplier(supplier.id)} className="font-medium text-danger hover:underline"><Trash2 size={16} /></button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
             {suppliers.map(supplier => (
                 <div key={supplier.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600 flex flex-col gap-2">
                     <div className="flex justify-between items-start">
                         <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{supplier.name}</h3>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                                <Contact size={14} className="mr-1" />
                                {supplier.contactName}
                            </div>
                         </div>
                         <div className="flex space-x-2">
                             <button onClick={() => openSupplierModalForEdit(supplier)} className="text-primary bg-primary/10 p-1.5 rounded-md"><Edit size={16} /></button>
                             <button onClick={() => handleDeleteSupplier(supplier.id)} className="text-danger bg-danger/10 p-1.5 rounded-md"><Trash2 size={16} /></button>
                         </div>
                     </div>
                     <div className="border-t border-gray-100 dark:border-gray-600 pt-2 mt-1 space-y-1">
                         <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                             <Phone size={14} className="mr-2" />
                             {supplier.phone}
                         </div>
                         <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                             <Mail size={14} className="mr-2" />
                             <span className="truncate">{supplier.email}</span>
                         </div>
                     </div>
                 </div>
             ))}
        </div>
    </div>
  );
  
  const renderPlaceholderTab = (title: string, description: string) => (
      <div>
        <h2 className="text-xl font-bold text-neutral-dark dark:text-white mb-4">{title}</h2>
        <p className="text-neutral-medium dark:text-gray-400">{description}</p>
      </div>
  );
  
  const tabs = [
      { id: 'kanban', label: 'Fases', icon: Settings },
      { id: 'products', label: 'Produtos', icon: Package },
      { id: 'suppliers', label: 'Forn.', icon: Truck },
      { id: 'users', label: 'Usuários', icon: Users },
      { id: 'integrations', label: 'Integ.', icon: Link },
      { id: 'notifications', label: 'Notif.', icon: Bell },
  ];

  const phaseModalTitle = phaseEditFormData && Object.keys(editableBoard).some(k => k === phaseEditFormData.id)
    ? 'Editar Fase'
    : 'Adicionar Nova Fase';

  return (
    <div className="pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark dark:text-white mb-6 transition-colors">Configurações</h1>
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 flex items-center py-2 px-3 md:px-4 text-base md:text-lg font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-neutral-medium dark:text-gray-400 hover:text-neutral-dark dark:hover:text-white'}`}>
                <tab.icon size={18} className="mr-2"/>
                {tab.label}
            </button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md transition-colors min-h-[400px]">
          {activeTab === 'kanban' && renderKanbanSettings()}
          {activeTab === 'products' && renderProductsSettings()}
          {activeTab === 'suppliers' && renderSuppliersSettings()}
          {activeTab === 'users' && renderUserSettings()}
          {activeTab === 'integrations' && renderPlaceholderTab('Gerenciar Integrações', 'Em breve: conecte-se com WhatsApp, gateways de pagamento e outras ferramentas.')}
          {activeTab === 'notifications' && renderPlaceholderTab('Templates de Notificação', 'Em breve: personalize as mensagens automáticas enviadas aos seus clientes em cada fase.')}
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={!!deletingPhaseId}
        onClose={() => setDeletingPhaseId(null)}
        onConfirm={handleConfirmDeletePhase}
        title="Confirmar Exclusão de Fase"
        message={`Tem certeza que deseja excluir esta fase? Todos os pedidos nela serão movidos para a fase anterior. Esta ação não pode ser desfeita.`}
      />
      <ConfirmationModal
        isOpen={!!deletingUserId}
        onClose={() => setDeletingUserId(null)}
        onConfirm={handleConfirmDeleteUser}
        title="Confirmar Exclusão de Usuário"
        message={`Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.`}
      />
       <Modal isOpen={isUserModalOpen} onClose={handleCloseUserModal} title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}>
        <form onSubmit={handleUserSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
            <input type="text" name="name" id="name" value={userFormData.name} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" name="email" id="email" value={userFormData.email} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfil</label>
            <select name="role" id="role" value={userFormData.role} onChange={handleUserChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white">
                <option value="Vendedor">Vendedor</option>
                <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={handleCloseUserModal} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90">Salvar</button>
          </div>
        </form>
      </Modal>

      {/* Product Modal */}
      <Modal isOpen={isProductModalOpen} onClose={handleCloseProductModal} title={editingProduct ? 'Editar Produto' : 'Novo Produto'}>
        <form onSubmit={handleProductSubmit}>
          <div className="mb-4">
            <label htmlFor="prod-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Produto</label>
            <input type="text" name="name" id="prod-name" value={productFormData.name} onChange={handleProductChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="prod-sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
              <input type="text" name="sku" id="prod-sku" value={productFormData.sku} onChange={handleProductChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
              <label htmlFor="prod-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estoque</label>
              <input type="number" name="stock" id="prod-stock" value={productFormData.stock} onChange={handleProductChange} min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
            </div>
          </div>
          <div className="mb-4">
              <label htmlFor="prod-supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fornecedor</label>
              <select 
                name="supplierId" 
                id="prod-supplier" 
                value={productFormData.supplierId} 
                onChange={handleProductChange} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white"
                required
              >
                  <option value="" disabled>Selecione um fornecedor</option>
                  {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
              </select>
          </div>
          <div className="mb-4">
            <label htmlFor="prod-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço</label>
            <input type="number" name="price" id="prod-price" value={productFormData.price} onChange={handleProductChange} step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
           <div className="mb-4">
            <label htmlFor="prod-imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL da Imagem</label>
            <input type="text" name="imageUrl" id="prod-imageUrl" value={productFormData.imageUrl} onChange={handleProductChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={handleCloseProductModal} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90">Salvar</button>
          </div>
        </form>
      </Modal>

      {/* Supplier Modal */}
      <Modal isOpen={isSupplierModalOpen} onClose={handleCloseSupplierModal} title={editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}>
        <form onSubmit={handleSupplierSubmit}>
          <div className="mb-4">
            <label htmlFor="sup-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Empresa</label>
            <input type="text" name="name" id="sup-name" value={supplierFormData.name} onChange={handleSupplierChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
          <div className="mb-4">
            <label htmlFor="sup-contactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Contato</label>
            <input type="text" name="contactName" id="sup-contactName" value={supplierFormData.contactName} onChange={handleSupplierChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="sup-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
              <input type="tel" name="phone" id="sup-phone" value={supplierFormData.phone} onChange={handleSupplierChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label htmlFor="sup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" name="email" id="sup-email" value={supplierFormData.email} onChange={handleSupplierChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={handleCloseSupplierModal} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90">Salvar</button>
          </div>
        </form>
      </Modal>

      {phaseEditFormData && (
        <Modal isOpen={isPhaseEditModalOpen} onClose={handleClosePhaseEditModal} title={phaseModalTitle}>
            <form onSubmit={handleUpdatePhase}>
                <div className="mb-4">
                    <label htmlFor="phase-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Fase</label>
                    <input 
                        type="text" 
                        name="title" 
                        id="phase-title" 
                        value={phaseEditFormData.title} 
                        onChange={(e) => setPhaseEditFormData({...phaseEditFormData, title: e.target.value})} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" 
                        required 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {availableColors.map(color => (
                            <div 
                                key={color} 
                                onClick={() => setPhaseEditFormData({...phaseEditFormData, color: color})}
                                className={`w-8 h-8 rounded-full cursor-pointer transition-all ${color} ${phaseEditFormData.color === color ? 'ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'}`}
                            ></div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={handleClosePhaseEditModal} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                    <button type="submit" className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90">Confirmar</button>
                </div>
            </form>
        </Modal>
      )}
      <UserMigrationModal
        isOpen={!!migrationInfo}
        onClose={() => setMigrationInfo(null)}
        onConfirm={(targetUserId) => {
          if (migrationInfo) {
            onDeleteUserAndMigrateOrders(migrationInfo.user.id, targetUserId);
          }
          setMigrationInfo(null);
        }}
        userToDelete={migrationInfo?.user ?? null}
        orderCount={migrationInfo?.orderCount ?? 0}
        otherUsers={users.filter(u => u.id !== migrationInfo?.user?.id)}
      />
    </div>
  );
};

export default SettingsPage;
