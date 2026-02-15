
import React from 'react';
import { Page, User } from '../../types';
import { LayoutDashboard, ShoppingCart, Users, Package, Settings, KanbanSquare, X, Store, LogOut } from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  user?: User;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'shop', label: 'Loja', icon: Store },
  { id: 'kanban', label: 'Vendas (Kanban)', icon: KanbanSquare },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings },
] as const;

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setOpen, user, onLogout }) => {
  const NavLink: React.FC<{ item: typeof navItems[number] }> = ({ item }) => (
    <li key={item.id}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setCurrentPage(item.id as Page);
          if (window.innerWidth < 768) {
            setOpen(false);
          }
        }}
        className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
          currentPage === item.id
            ? 'bg-primary/90 text-white'
            : 'text-gray-300 hover:bg-primary/80 hover:text-white'
        }`}
      >
        <item.icon className="h-5 w-5 mr-3" />
        <span className="font-medium">{item.label}</span>
      </a>
    </li>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full bg-neutral-dark text-white flex flex-col z-40 w-64 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16">
          <h1 className="text-xl font-bold text-white">Mari Zap Shop</h1>
          <button onClick={() => setOpen(false)} className="md:hidden text-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4">
          <ul>
            {navItems.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
            {user ? (
              <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                      <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full" />
                      <div className="ml-3 overflow-hidden">
                          <p className="font-semibold text-sm truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.role}</p>
                      </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 text-center mb-2">v1.0.6</p>
                    <button 
                      onClick={onLogout}
                      className="flex items-center justify-center w-full p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors text-gray-300 hover:text-white"
                    >
                        <LogOut size={16} className="mr-2" />
                        Sair
                    </button>
                  </div>
              </div>
            ) : (
              <div className="flex items-center animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                <div className="ml-3 space-y-2">
                    <div className="h-3 w-24 bg-gray-700 rounded"></div>
                    <div className="h-2 w-32 bg-gray-700 rounded"></div>
                </div>
              </div>
            )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
