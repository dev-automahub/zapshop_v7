
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  imageUrl: string;
  stock: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Admin' | 'Vendedor';
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: string; // This will correspond to a Kanban column ID
  createdAt: string; // ISO date string
  assignedTo: User;
  tags: ('urgent' | 'paid' | 'low_stock')[];
}

export interface PurchaseOrder {
  id: string;
  supplier: Supplier;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  createdAt: string;
  assignedTo: User;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  orders: Order[];
}

export type KanbanBoardData = Record<string, KanbanColumn>;

export type Page = 'dashboard' | 'kanban' | 'orders' | 'customers' | 'products' | 'settings' | 'shop' | 'auth';
