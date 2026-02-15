
import React, { useState, useMemo } from 'react';
import { Order, KanbanBoardData, PurchaseOrder } from '../types';
import { Search, Edit, Trash2, PlusCircle, ShoppingCart, Truck, Calendar, User, Package } from 'lucide-react';
import ConfirmationModal from '../components/common/ConfirmationModal';

interface OrdersPageProps {
  orders: Order[];
  boardData: KanbanBoardData;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onNewOrderClick: () => void;
  // Purchase Order Props
  purchaseOrders: PurchaseOrder[];
  onNewPurchaseOrderClick: () => void;
  onDeletePurchaseOrder: (id: string) => void;
  onEditPurchaseOrder: (order: PurchaseOrder) => void;
}

const StatusBadge: React.FC<{ status: string; boardData?: KanbanBoardData; isPurchase?: boolean }> = ({ status, boardData, isPurchase }) => {
  if (isPurchase) {
      const purchaseStyles: Record<string, string> = {
          'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
          'ordered': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          'received': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      };
      const labels: Record<string, string> = {
          'pending': 'Pendente',
          'ordered': 'Pedido Realizado',
          'received': 'Recebido',
          'cancelled': 'Cancelado'
      };
      
      const style = purchaseStyles[status] || 'bg-gray-100 text-gray-800';
      const label = labels[status] || status;
      
      return (
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
          {label}
        </span>
      );
  }

  const column = boardData ? boardData[status] : null;
  if (!column) {
    return <span className="px-2 py-0.5 text-xs font-medium text-gray-800 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-full">{status}</span>;
  }
  
  const colorMapping: Record<string, string> = {
    'bg-blue-200': 'text-blue-800 dark:text-blue-200',
    'bg-yellow-200': 'text-yellow-800 dark:text-yellow-200',
    'bg-orange-200': 'text-orange-800 dark:text-orange-200',
    'bg-green-200': 'text-green-800 dark:text-green-200',
    'bg-purple-200': 'text-purple-800 dark:text-purple-200',
    'bg-gray-300': 'text-gray-800 dark:text-gray-200',
  }

  const textColor = colorMapping[column.color] || 'text-gray-800 dark:text-gray-200';
  
  return (
    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${column.color} ${textColor}`}>
      {column.title}
    </span>
  );
};

const OrderTable: React.FC<{ 
    orders: (Order | PurchaseOrder)[]; 
    boardData?: KanbanBoardData; 
    onEditOrder?: (order: Order) => void; 
    onEditPurchaseOrder?: (order: PurchaseOrder) => void;
    onDeleteClick: (orderId: string) => void;
    isPurchase?: boolean;
}> = ({ orders, boardData, onEditOrder, onEditPurchaseOrder, onDeleteClick, isPurchase }) => {
    
    // --- Mobile Card View Component ---
    const MobileCard = ({ order }: { order: Order | PurchaseOrder }) => {
        const entityName = isPurchase 
            ? (order as PurchaseOrder).supplier.name 
            : (order as Order).customer.name;
        
        return (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 mb-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">#{order.id.split('-')[1]}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{entityName}</span>
                    </div>
                    <StatusBadge status={order.status} boardData={boardData} isPurchase={isPurchase} />
                </div>
                
                <div className="space-y-2 mb-3">
                    <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                        <Package size={16} className="mr-2 mt-0.5 text-gray-400" />
                        <span className="truncate max-w-[200px]">
                            {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                     <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <User size={16} className="mr-2 text-gray-400" />
                        <span className="flex items-center">
                            <img src={order.assignedTo.avatarUrl} alt="" className="w-4 h-4 rounded-full mr-1"/>
                            {order.assignedTo.name}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-600">
                     <span className="font-bold text-primary">
                        {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <div className="flex space-x-3">
                        <button 
                            onClick={() => isPurchase && onEditPurchaseOrder ? onEditPurchaseOrder(order as PurchaseOrder) : onEditOrder && onEditOrder(order as Order)} 
                            className="p-1.5 text-primary bg-primary/10 rounded-md" 
                        >
                            <Edit size={16} />
                        </button>
                        <button 
                            onClick={() => onDeleteClick(order.id)} 
                            className="p-1.5 text-danger bg-danger/10 rounded-md"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
                    <tr>
                    <th scope="col" className="px-6 py-3">ID Pedido</th>
                    <th scope="col" className="px-6 py-3">{isPurchase ? 'Fornecedor' : 'Cliente'}</th>
                    <th scope="col" className="px-6 py-3">Produtos</th>
                    <th scope="col" className="px-6 py-3">Valor</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Data</th>
                    <th scope="col" className="px-6 py-3">{isPurchase ? 'Responsável' : 'Vendedor'}</th>
                    <th scope="col" className="px-6 py-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => {
                        const entityName = isPurchase 
                            ? (order as PurchaseOrder).supplier.name 
                            : (order as Order).customer.name;
                        
                        return (
                            <tr key={order.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">
                                #{order.id.split('-')[1]}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                {entityName}
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate" title={order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}>
                                {order.items.map(i => i.product.name).join(', ')}
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={order.status} boardData={boardData} isPurchase={isPurchase} />
                                </td>
                                <td className="px-6 py-4">
                                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <img src={order.assignedTo.avatarUrl} alt={order.assignedTo.name} className="h-6 w-6 rounded-full mr-2" />
                                    <span>{order.assignedTo.name}</span>
                                </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-4">
                                    <button 
                                        onClick={() => isPurchase && onEditPurchaseOrder ? onEditPurchaseOrder(order as PurchaseOrder) : onEditOrder && onEditOrder(order as Order)} 
                                        className="font-medium text-primary hover:underline" 
                                        title="Editar Pedido"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => onDeleteClick(order.id)} className="font-medium text-danger hover:underline" title="Excluir Pedido">
                                    <Trash2 size={16} />
                                    </button>
                                </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
                </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden">
                {orders.map(order => (
                    <MobileCard key={order.id} order={order} />
                ))}
            </div>

            {orders.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum pedido encontrado.</p>}
        </>
    );
};


const OrdersPage: React.FC<OrdersPageProps> = ({ 
    orders, 
    boardData, 
    onEditOrder, 
    onDeleteOrder, 
    onNewOrderClick,
    purchaseOrders,
    onNewPurchaseOrderClick,
    onDeletePurchaseOrder,
    onEditPurchaseOrder
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering Logic
  const filteredSalesOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const lowercasedQuery = searchQuery.toLowerCase();
    return orders.filter(order =>
      order.customer.name.toLowerCase().includes(lowercasedQuery) ||
      order.id.toLowerCase().includes(lowercasedQuery) ||
      order.assignedTo.name.toLowerCase().includes(lowercasedQuery) ||
      order.items.some(item => item.product.name.toLowerCase().includes(lowercasedQuery))
    );
  }, [orders, searchQuery]);

  const filteredPurchaseOrders = useMemo(() => {
      if (!searchQuery) return purchaseOrders;
      const lowercasedQuery = searchQuery.toLowerCase();
      return purchaseOrders.filter(po => 
        po.supplier.name.toLowerCase().includes(lowercasedQuery) ||
        po.id.toLowerCase().includes(lowercasedQuery) ||
        po.assignedTo.name.toLowerCase().includes(lowercasedQuery) ||
        po.items.some(item => item.product.name.toLowerCase().includes(lowercasedQuery))
      );
  }, [purchaseOrders, searchQuery]);

  
  const activeSales = filteredSalesOrders.filter(order => order.status !== 'completed');
  const completedSales = filteredSalesOrders.filter(order => order.status === 'completed');

  const handleConfirmDelete = () => {
    if (deletingId) {
        if (activeTab === 'sales') {
            onDeleteOrder(deletingId);
        } else {
            onDeletePurchaseOrder(deletingId);
        }
      setDeletingId(null);
    }
  };

  const getDeletingOrderLabel = () => {
      if (!deletingId) return '';
      const idPart = deletingId.split('-')[1];
      return idPart;
  }

  return (
    <div className="space-y-6 pb-20">
        
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4">
         <div className="flex flex-col md:flex-row md:justify-between md:items-center">
             <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark dark:text-white transition-colors mb-4 md:mb-0">Gerenciamento de Pedidos</h1>
         </div>
         
         <div className="overflow-x-auto pb-2">
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 min-w-max">
                <button 
                    onClick={() => setActiveTab('sales')}
                    className={`pb-2 px-1 flex items-center font-medium transition-colors ${activeTab === 'sales' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <ShoppingCart size={18} className="mr-2" />
                    Pedidos de Venda
                </button>
                <button 
                    onClick={() => setActiveTab('purchases')}
                    className={`pb-2 px-1 flex items-center font-medium transition-colors ${activeTab === 'purchases' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Truck size={18} className="mr-2" />
                    Fornecedores (Compras)
                </button>
             </div>
         </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-grow md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-medium dark:text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'sales' ? "Buscar vendas..." : "Buscar compras..."}
                className="w-full pl-10 pr-4 py-2 border rounded-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={activeTab === 'sales' ? onNewOrderClick : onNewPurchaseOrderClick}
              className="bg-action hover:bg-action/90 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              <span>{activeTab === 'sales' ? 'Nova Venda' : 'Nova Compra'}</span>
            </button>
        </div>
      </div>
      
      {/* Content */}
      {activeTab === 'sales' ? (
          <>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
                <h2 className="text-xl font-bold text-neutral-dark dark:text-white mb-4">Vendas Ativas</h2>
                <OrderTable 
                orders={activeSales} 
                boardData={boardData} 
                onEditOrder={onEditOrder} 
                onDeleteClick={(id) => setDeletingId(id)}
                isPurchase={false}
                />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
                <h2 className="text-xl font-bold text-neutral-dark dark:text-white mb-4">Histórico Concluído</h2>
                <OrderTable 
                orders={completedSales} 
                boardData={boardData} 
                onEditOrder={onEditOrder} 
                onDeleteClick={(id) => setDeletingId(id)}
                isPurchase={false}
                />
            </div>
          </>
      ) : (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
            <h2 className="text-xl font-bold text-neutral-dark dark:text-white mb-4">Pedidos aos Fornecedores</h2>
            <OrderTable 
                orders={filteredPurchaseOrders} 
                onDeleteClick={(id) => setDeletingId(id)}
                onEditPurchaseOrder={onEditPurchaseOrder}
                isPurchase={true}
            />
          </div>
      )}

      {deletingId && (
        <ConfirmationModal
          isOpen={!!deletingId}
          onClose={() => setDeletingId(null)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir permanentemente o pedido #${getDeletingOrderLabel()}? Esta ação não pode ser desfeita.`}
        />
      )}
    </div>
  );
};

export default OrdersPage;
