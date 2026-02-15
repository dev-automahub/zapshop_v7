
import { Customer, Product, Order, KanbanBoardData, User, Supplier, PurchaseOrder } from '../types';

export const initialCustomers: Customer[] = [
  { id: 'cust-1', name: 'Ana Silva', phone: '11987654321', email: 'ana.silva@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=cust-1' },
  { id: 'cust-2', name: 'Bruno Costa', phone: '2123456789', email: 'bruno.costa@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=cust-2' },
  { id: 'cust-3', name: 'Carla Dias', phone: '31955558888', email: 'carla.dias@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=cust-3' },
  { id: 'cust-4', name: 'Daniel Alves', phone: '41999991111', email: 'daniel.alves@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=cust-4' },
  { id: 'cust-5', name: 'Junior Taiz', phone: '27999881234', email: 'junior.taiz@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=cust-5' },
];

export const initialSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Eletrônicos Global Ltda', contactName: 'Roberto Almeida', email: 'vendas@eglobal.com', phone: '(11) 3333-4444' },
  { id: 'sup-2', name: 'Importadora Tech', contactName: 'Fernanda Souza', email: 'contato@importtech.com.br', phone: '(41) 98888-7777' },
  { id: 'sup-3', name: 'Distribuidora São Paulo', contactName: 'Carlos Oliveira', email: 'carlos@dsp.com', phone: '(11) 99999-1234' },
];

export const initialProducts: Product[] = [
  { id: 'prod-1', name: 'Fone de Ouvido Bluetooth', sku: 'FONE-BT-001', price: 249.90, imageUrl: 'https://picsum.photos/seed/prod-1/200', stock: 50, supplierId: 'sup-1' },
  { id: 'prod-2', name: 'Capa de Silicone para Celular', sku: 'CAPA-SIL-002', price: 49.90, imageUrl: 'https://picsum.photos/seed/prod-2/200', stock: 120, supplierId: 'sup-1' },
  { id: 'prod-3', name: 'Carregador Portátil 10000mAh', sku: 'POWER-10K-003', price: 129.90, imageUrl: 'https://picsum.photos/seed/prod-3/200', stock: 75, supplierId: 'sup-2' },
  { id: 'prod-4', name: 'Teclado Mecânico RGB', sku: 'TECL-MEC-004', price: 499.90, imageUrl: 'https://picsum.photos/seed/prod-4/200', stock: 25, supplierId: 'sup-3' },
];

export const initialUsers: User[] = [
  { id: 'user-1', name: 'Rafaela', email: 'rafaela@email.com', avatarUrl: 'https://i.pravatar.cc/150?img=3', role: 'Vendedor' },
  { id: 'user-2', name: 'Lucas', email: 'lucas@email.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-2', role: 'Vendedor' },
  { id: 'user-3', name: 'Mariana', email: 'mari@email.com', avatarUrl: 'https://i.pravatar.cc/150?img=5', role: 'Admin' },
  { id: 'user-loja', name: 'Loja', email: 'contato@loja.com', avatarUrl: 'https://ui-avatars.com/api/?name=Loja&background=11678E&color=fff', role: 'Admin' },
];

const orders: Order[] = [
  { id: 'ord-1001', customer: initialCustomers[0], items: [{ product: initialProducts[0], quantity: 1 }], total: 249.90, status: 'lead', createdAt: '2023-10-27T10:00:00Z', assignedTo: initialUsers[0], tags: ['urgent'] },
  { id: 'ord-1002', customer: initialCustomers[1], items: [{ product: initialProducts[1], quantity: 2 }, { product: initialProducts[2], quantity: 1 }], total: 229.70, status: 'lead', createdAt: '2023-10-27T11:30:00Z', assignedTo: initialUsers[1], tags: [] },
  { id: 'ord-1003', customer: initialCustomers[2], items: [{ product: initialProducts[3], quantity: 1 }], total: 499.90, status: 'paid', createdAt: '2023-10-26T14:00:00Z', assignedTo: initialUsers[0], tags: ['paid'] },
  { id: 'ord-1004', customer: initialCustomers[3], items: [{ product: initialProducts[0], quantity: 1 }], total: 249.90, status: 'negotiation', createdAt: '2023-10-25T09:15:00Z', assignedTo: initialUsers[1], tags: ['low_stock'] },
  { id: 'ord-1005', customer: initialCustomers[0], items: [{ product: initialProducts[2], quantity: 1 }], total: 129.90, status: 'paid', createdAt: '2023-10-24T18:00:00Z', assignedTo: initialUsers[0], tags: ['paid'] },
  { id: 'ord-1006', customer: initialCustomers[1], items: [{ product: initialProducts[1], quantity: 1 }], total: 49.90, status: 'sent', createdAt: '2023-10-23T16:45:00Z', assignedTo: initialUsers[1], tags: ['paid'] },
  { id: 'ord-1007', customer: initialCustomers[3], items: [{ product: initialProducts[3], quantity: 1 }], total: 499.90, status: 'completed', createdAt: '2023-10-20T12:00:00Z', assignedTo: initialUsers[0], tags: ['paid'] },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  { id: 'po-5001', supplier: initialSuppliers[0], items: [{ product: initialProducts[0], quantity: 20 }], total: 4000.00, status: 'pending', createdAt: '2023-10-28T09:00:00Z', assignedTo: initialUsers[2] },
  { id: 'po-5002', supplier: initialSuppliers[1], items: [{ product: initialProducts[2], quantity: 50 }], total: 5000.00, status: 'received', createdAt: '2023-10-20T14:00:00Z', assignedTo: initialUsers[2] },
];

export const initialKanbanData: KanbanBoardData = {
  'lead': { id: 'lead', title: 'Em Aberto', color: 'bg-blue-200', orders: orders.filter(o => o.status === 'lead') },
  'negotiation': { id: 'negotiation', title: 'Em Negociação', color: 'bg-orange-200', orders: orders.filter(o => o.status === 'negotiation') },
  'paid': { id: 'paid', title: 'Pago', color: 'bg-green-200', orders: orders.filter(o => o.status === 'paid') },
  'sent': { id: 'sent', title: 'Enviado', color: 'bg-purple-200', orders: orders.filter(o => o.status === 'sent') },
  'completed': { id: 'completed', title: 'Concluído', color: 'bg-gray-300', orders: orders.filter(o => o.status === 'completed') },
};
