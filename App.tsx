
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import KanbanPage from './pages/KanbanPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import ShopPage from './pages/ShopPage';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';
import { Page, Customer, Product, KanbanBoardData, Order, User, KanbanColumn, OrderItem, Supplier, PurchaseOrder } from './types';
import { initialCustomers, initialProducts, initialKanbanData, initialUsers, initialSuppliers, initialPurchaseOrders } from './data/mockData';
import NewOrderModal from './components/orders/NewOrderModal';
import NewPurchaseOrderModal from './components/orders/NewPurchaseOrderModal';
import EditOrderModal from './components/orders/EditOrderModal';
import EditPurchaseOrderModal from './components/orders/EditPurchaseOrderModal';
import Toast from './components/common/Toast';

// Helper function to load data from LocalStorage or fallback to mock data
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return fallback;
  }
};

const App: React.FC = () => {
  // CRM Auth State (Admins/Sellers)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Shop Customer Auth State
  const [currentShopCustomer, setCurrentShopCustomer] = useState<Customer | null>(null);

  // Navigation & UI State
  const [currentPage, setCurrentPage] = useState<Page>('auth'); // Default to Auth (Public Landing)
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Data State with Persistence
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage('mari_crm_customers', initialCustomers));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('mari_crm_products', initialProducts));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadFromStorage('mari_crm_suppliers', initialSuppliers));
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('mari_crm_users', initialUsers));
  const [boardData, setBoardData] = useState<KanbanBoardData>(() => loadFromStorage('mari_crm_boardData', initialKanbanData));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadFromStorage('mari_crm_purchaseOrders', initialPurchaseOrders));
  
  // Cart State (Lifted from ShopPage)
  const [cart, setCart] = useState<Record<string, number>>({});

  // Modals State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isNewPurchaseOrderModalOpen, setIsNewPurchaseOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- Persistence Effects ---
  useEffect(() => { localStorage.setItem('mari_crm_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('mari_crm_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('mari_crm_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('mari_crm_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('mari_crm_boardData', JSON.stringify(boardData)); }, [boardData]);
  useEffect(() => { localStorage.setItem('mari_crm_purchaseOrders', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);

  // --- Migration Effect for Column Titles ---
  useEffect(() => {
    setBoardData(prev => {
      const newBoard = { ...prev };
      let hasChanges = false;
      
      // Migrate 'Lead' to 'Em Aberto'
      if (newBoard['lead'] && newBoard['lead'].title === 'Lead') {
        newBoard['lead'] = { ...newBoard['lead'], title: 'Em Aberto' };
        hasChanges = true;
      }
      
      // Migrate 'Negociação' to 'Em Negociação'
      if (newBoard['negotiation'] && newBoard['negotiation'].title === 'Negociação') {
        newBoard['negotiation'] = { ...newBoard['negotiation'], title: 'Em Negociação' };
        hasChanges = true;
      }

      return hasChanges ? newBoard : prev;
    });
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('auth');
    setSidebarOpen(false);
    showToast('Você saiu do sistema.');
  };

  // --- Unified Auth Handler ---
  const handleUnifiedLogin = (email: string) => {
    // 1. Check if user is an Admin/Seller (Internal User)
    const internalUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (internalUser) {
        setCurrentUser(internalUser);
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
        showToast(`Bem-vindo ao Sistema, ${internalUser.name}!`);
        return;
    }

    // 2. Check if user is a Shop Customer
    const customer = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    
    if (customer) {
        setCurrentShopCustomer(customer);
        setCurrentPage('shop');
        showToast(`Olá, ${customer.name}! Boas compras.`);
        return;
    }

    // 3. Not found
    showToast('E-mail não encontrado. Verifique seus dados.', 'error');
  };

  const handleCustomerRegister = (data: Omit<Customer, 'id' | 'avatarUrl'>) => {
    const newId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
        id: newId,
        avatarUrl: `https://i.pravatar.cc/150?u=${newId}`,
        ...data
    };
    setCustomers(prev => [...prev, newCustomer]);
    setCurrentShopCustomer(newCustomer);
    setCurrentPage('shop');
    showToast('Cadastro realizado com sucesso! Bem-vindo(a).');
  };

  const handleCustomerLogout = () => {
      setCurrentShopCustomer(null);
      setCurrentPage('auth');
      clearCart();
      showToast('Até logo!');
  };


  // Cart Handlers
  const handleCartQuantityChange = (product: Product, change: number) => {
    const currentQty = cart[product.id] || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    if (newQty > product.stock) {
      showToast(`Estoque insuficiente. Apenas ${product.stock} unidades disponíveis.`, 'error');
      return;
    }

    setCart(prev => {
      const newCart = { ...prev, [product.id]: newQty };
      if (newQty === 0) {
        delete newCart[product.id];
      }
      return newCart;
    });
  };

  const clearCart = () => setCart({});

  // Order Handlers
  const handleAddOrder = (newOrderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    // Step 1: Validate stock before creating the order
    for (const item of newOrderData.items) {
      const productInStock = products.find(p => p.id === item.product.id);
      if (!productInStock || productInStock.stock < item.quantity) {
        showToast(`Estoque insuficiente para ${item.product.name}. Disponível: ${productInStock?.stock ?? 0}.`, 'error');
        return; // Abort order creation
      }
    }

    // Step 2: If validation passes, deduct stock
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const orderItem = newOrderData.items.find(item => item.product.id === p.id);
        if (orderItem) {
          return { ...p, stock: p.stock - orderItem.quantity };
        }
        return p;
      })
    );

    // Step 3: Create the order
    const allCurrentOrders = (Object.values(boardData) as KanbanColumn[]).flatMap(column => column.orders);
    
    const maxId = allCurrentOrders.reduce((max, order) => {
      const idNum = parseInt(order.id.split('-')[1], 10);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 1000);
    
    const newOrderId = `ord-${maxId + 1}`;

    const newOrder: Order = {
      ...newOrderData,
      id: newOrderId,
      createdAt: new Date().toISOString(),
      status: 'lead',
    };
    
    // Update the product objects within the new order to reflect the new stock
    newOrder.items = newOrder.items.map(item => ({
        ...item,
        product: products.find(p => p.id === item.product.id) || item.product
    }));

    setBoardData(prevBoardData => {
      const newBoard = { ...prevBoardData };
      const originalLeadColumn = newBoard.lead || { id: 'lead', title: 'Em Aberto', color: 'bg-blue-200', orders: [] };
      
      const updatedLeadColumn = {
        ...originalLeadColumn,
        orders: [...originalLeadColumn.orders, newOrder]
      };

      newBoard.lead = updatedLeadColumn;
      return newBoard;
    });

    setIsNewOrderModalOpen(false);
    showToast('Pedido criado com sucesso!');
  };

  const handleAddPurchaseOrder = (data: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    const maxId = purchaseOrders.reduce((max, po) => {
        const idNum = parseInt(po.id.split('-')[1], 10);
        return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 5000);
    
    const newId = `po-${maxId + 1}`;
    
    const newPO: PurchaseOrder = {
        id: newId,
        createdAt: new Date().toISOString(),
        ...data
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    setIsNewPurchaseOrderModalOpen(false);
    showToast('Pedido de compra criado com sucesso!');
  };
  
  const handleUpdatePurchaseOrder = (updatedOrder: PurchaseOrder) => {
      // Find the old order to compare statuses
      const oldOrder = purchaseOrders.find(po => po.id === updatedOrder.id);
      
      if (oldOrder) {
          const wasReceived = oldOrder.status === 'received';
          const isNowReceived = updatedOrder.status === 'received';

          // Scenario 1: Changing TO 'received' -> ADD stock
          if (!wasReceived && isNowReceived) {
              setProducts(prevProducts => prevProducts.map(p => {
                  const item = updatedOrder.items.find(i => i.product.id === p.id);
                  if (item) {
                      return { ...p, stock: p.stock + item.quantity };
                  }
                  return p;
              }));
          } 
          // Scenario 2: Changing FROM 'received' TO something else -> REMOVE stock (Revert)
          else if (wasReceived && !isNowReceived) {
              setProducts(prevProducts => prevProducts.map(p => {
                  const item = updatedOrder.items.find(i => i.product.id === p.id);
                  if (item) {
                      // Prevent negative stock if something weird happens, though usually fine
                      return { ...p, stock: Math.max(0, p.stock - item.quantity) };
                  }
                  return p;
              }));
          }
      }

      setPurchaseOrders(prev => prev.map(po => po.id === updatedOrder.id ? updatedOrder : po));
      showToast('Pedido de compra atualizado com sucesso!');
  }

  const handleDeletePurchaseOrder = (id: string) => {
      setPurchaseOrders(prev => prev.filter(p => p.id !== id));
      showToast('Pedido de compra excluído.', 'success');
  }

  const handleShopCreateOrder = (customer: Customer, items: OrderItem[], total: number) => {
    // 1. Validate Stock
    for (const item of items) {
      const productInStock = products.find(p => p.id === item.product.id);
      if (!productInStock || productInStock.stock < item.quantity) {
        showToast(`Estoque insuficiente para ${item.product.name}. Disponível: ${productInStock?.stock ?? 0}.`, 'error');
        return; 
      }
    }

    // 2. Deduct Stock
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const orderItem = items.find(item => item.product.id === p.id);
        if (orderItem) {
          return { ...p, stock: p.stock - orderItem.quantity };
        }
        return p;
      })
    );

    // 3. Find 'Loja' user or fallback to first user
    const assignedUser = users.find(u => u.id === 'user-loja') || users[0];

    // 4. Generate ID
    const allCurrentOrders = (Object.values(boardData) as KanbanColumn[]).flatMap(column => column.orders);
    const maxId = allCurrentOrders.reduce((max, order) => {
      const idNum = parseInt(order.id.split('-')[1], 10);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 1000);
    const newOrderId = `ord-${maxId + 1}`;

    // 5. Create Order Object
    const updatedItems = items.map(item => ({
        ...item,
        product: products.find(p => p.id === item.product.id) || item.product
    }));

    const newOrder: Order = {
      id: newOrderId,
      customer: customer,
      items: updatedItems,
      total: total,
      status: 'paid', // Changed from 'negotiation' to 'paid'
      createdAt: new Date().toISOString(),
      assignedTo: assignedUser,
      tags: ['paid'],
    };

    // 6. Update Board
    setBoardData(prevBoardData => {
      const newBoard = { ...prevBoardData };
      const targetColumnId = 'paid'; // Changed from 'negotiation' to 'paid'
      const targetColumn = newBoard[targetColumnId] || { id: targetColumnId, title: 'Pago', color: 'bg-green-200', orders: [] };
      
      const updatedColumn = {
        ...targetColumn,
        orders: [...targetColumn.orders, newOrder]
      };

      newBoard[targetColumnId] = updatedColumn;
      return newBoard;
    });

    clearCart();
    showToast('Pedido realizado com sucesso!', 'success');
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setBoardData(prevBoard => {
      let originalColumnId: string | undefined;

      // Find the original column of the order
      for (const key in prevBoard) {
        if (prevBoard[key].orders.some(o => o.id === updatedOrder.id)) {
          originalColumnId = key;
          break;
        }
      }

      if (!originalColumnId) {
        return prevBoard;
      }

      const newColumnId = updatedOrder.status;

      if (originalColumnId === newColumnId) {
        return {
          ...prevBoard,
          [originalColumnId]: {
            ...prevBoard[originalColumnId],
            orders: prevBoard[originalColumnId].orders.map(o =>
              o.id === updatedOrder.id ? updatedOrder : o
            ),
          },
        };
      }

      return {
        ...prevBoard,
        [originalColumnId]: {
          ...prevBoard[originalColumnId],
          orders: prevBoard[originalColumnId].orders.filter(o => o.id !== updatedOrder.id),
        },
        [newColumnId]: {
          ...prevBoard[newColumnId],
          orders: [...prevBoard[newColumnId].orders, updatedOrder],
        },
      };
    });
    showToast('Pedido atualizado com sucesso!');
  };

  const handleDeleteOrder = (orderId: string) => {
    const orderToDelete = allOrders.find(o => o.id === orderId);

    if (!orderToDelete) {
      showToast('Erro: Não foi possível encontrar o pedido para excluir.', 'error');
      return;
    }

    setProducts(prevProducts =>
      prevProducts.map(p => {
        const orderItem = orderToDelete.items.find(item => item.product.id === p.id);
        if (orderItem) {
          return { ...p, stock: p.stock + orderItem.quantity };
        }
        return p;
      })
    );
    
    const columnId = Object.keys(boardData).find(key =>
      boardData[key].orders.some(order => order.id === orderId)
    );

    if (!columnId) {
      showToast('Erro: Não foi possível encontrar a coluna do pedido para excluir.', 'error');
      return;
    }

    setBoardData(currentBoard => {
      const newBoard = { ...currentBoard };
      const column = newBoard[columnId];
      if (column) {
         newBoard[columnId] = {
           ...column,
           orders: column.orders.filter(order => order.id !== orderId),
         };
      }
      return newBoard;
    });
    showToast('Pedido excluído e estoque atualizado!');
  };

  const handleDeleteUser = (userIdToDelete: string) => {
    if (users.length <= 1) {
        showToast('Não é possível excluir o único usuário.', 'error');
        return;
    }
    setUsers(prev => prev.filter(u => u.id !== userIdToDelete));
    showToast('Usuário excluído com sucesso.');
  };

  const handleDeleteUserAndMigrateOrders = (userIdToDelete: string, migrationTargetUserId: string) => {
    const targetUser = users.find(u => u.id === migrationTargetUserId);
    if (!targetUser) {
        showToast('Usuário de destino não encontrado.', 'error');
        return;
    }

    setBoardData(prevBoard => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        for (const columnId in newBoard) {
            newBoard[columnId].orders = newBoard[columnId].orders.map((order: Order) => {
                if (order.assignedTo.id === userIdToDelete) {
                    return { ...order, assignedTo: targetUser };
                }
                return order;
            });
        }
        return newBoard;
    });

    setUsers(prevUsers => prevUsers.filter(u => u.id !== userIdToDelete));
    showToast('Usuário excluído e pedidos migrados com sucesso!');
  };

  const allOrders = useMemo(() => {
    return (Object.values(boardData) as KanbanColumn[])
      .flatMap(column => column.orders)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [boardData]);

  // Render Page Content Logic
  const renderPrivatePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage allOrders={allOrders} onNavigate={setCurrentPage} onEditOrder={setEditingOrder} />;
      case 'kanban':
        return <KanbanPage boardData={boardData} setBoardData={setBoardData} onEditOrder={setEditingOrder} />;
      case 'orders':
        return (
            <OrdersPage 
                orders={allOrders} 
                boardData={boardData} 
                onEditOrder={setEditingOrder} 
                onDeleteOrder={handleDeleteOrder} 
                onNewOrderClick={() => setIsNewOrderModalOpen(true)}
                purchaseOrders={purchaseOrders}
                onNewPurchaseOrderClick={() => setIsNewPurchaseOrderModalOpen(true)}
                onDeletePurchaseOrder={handleDeletePurchaseOrder}
                onEditPurchaseOrder={setEditingPurchaseOrder}
            />
        );
      case 'customers':
        return <CustomersPage customers={customers} setCustomers={setCustomers} showToast={showToast} />;
      case 'shop':
        // If logged in as admin, provide a simulated customer object so ShopPage renders correctly
        const shopUser = currentShopCustomer || (currentUser ? {
            id: `admin-view-${currentUser.id}`,
            name: `${currentUser.name} (Admin)`,
            email: currentUser.email,
            phone: '', 
            avatarUrl: currentUser.avatarUrl
        } as Customer : null);

        if (!shopUser) return null;

        return (
          <ShopPage 
            products={products} 
            showToast={showToast} 
            currentShopCustomer={shopUser}
            onCreateOrder={handleShopCreateOrder}
            cart={cart}
            onCartQuantityChange={handleCartQuantityChange}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            boardData={boardData} 
            setBoardData={setBoardData} 
            showToast={showToast} 
            users={users} 
            setUsers={setUsers}
            onDeleteUser={handleDeleteUser}
            onDeleteUserAndMigrateOrders={handleDeleteUserAndMigrateOrders}
            products={products}
            setProducts={setProducts}
            suppliers={suppliers}
            setSuppliers={setSuppliers}
          />
        );
      default:
        return <DashboardPage allOrders={allOrders} onNavigate={setCurrentPage} onEditOrder={setEditingOrder} />;
    }
  };

  // --- Layout Selection ---
  
  // 1. Private CRM Layout (Admin/Seller Logged In)
  if (isLoggedIn) {
    return (
      <div className="flex h-screen bg-neutral-light dark:bg-gray-900 font-sans text-neutral-dark dark:text-neutral-light transition-colors duration-200">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          isOpen={isSidebarOpen} 
          setOpen={setSidebarOpen} 
          user={currentUser || undefined} 
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            isLoggedIn={true}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-light dark:bg-gray-900 p-4 md:p-6 lg:p-8 transition-colors duration-200">
            {renderPrivatePage()}
          </main>
        </div>
        <NewOrderModal
          isOpen={isNewOrderModalOpen}
          onClose={() => setIsNewOrderModalOpen(false)}
          customers={customers}
          products={products}
          users={users}
          onAddOrder={handleAddOrder}
          showToast={showToast}
        />
        <NewPurchaseOrderModal
            isOpen={isNewPurchaseOrderModalOpen}
            onClose={() => setIsNewPurchaseOrderModalOpen(false)}
            suppliers={suppliers}
            products={products}
            users={users}
            onAddOrder={handleAddPurchaseOrder}
            showToast={showToast}
        />
        <EditOrderModal
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          order={editingOrder}
          onUpdateOrder={handleUpdateOrder}
          boardData={boardData}
        />
        <EditPurchaseOrderModal
            isOpen={!!editingPurchaseOrder}
            onClose={() => setEditingPurchaseOrder(null)}
            order={editingPurchaseOrder}
            suppliers={suppliers}
            products={products}
            users={users}
            onUpdateOrder={handleUpdatePurchaseOrder}
            showToast={showToast}
        />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // 2. Public Layout (Auth or Shop)
  return (
        <div className="flex flex-col h-screen bg-neutral-light dark:bg-gray-900 font-sans text-neutral-dark dark:text-neutral-light transition-colors duration-200">
             <Header 
                toggleSidebar={() => {}} // No sidebar in public view
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                isLoggedIn={false}
                currentShopCustomer={currentShopCustomer}
                onShopLogout={handleCustomerLogout}
            />
            <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
                {currentShopCustomer ? (
                     <div className="max-w-7xl mx-auto p-4 md:p-8">
                        <ShopPage 
                            products={products} 
                            showToast={showToast} 
                            currentShopCustomer={currentShopCustomer}
                            onCreateOrder={handleShopCreateOrder}
                            cart={cart}
                            onCartQuantityChange={handleCartQuantityChange}
                        />
                     </div>
                ) : (
                    <AuthPage 
                        customers={customers}
                        users={users} 
                        onLogin={handleUnifiedLogin} 
                        onRegister={handleCustomerRegister}
                        showToast={showToast}
                    />
                )}
            </main>
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default App;
