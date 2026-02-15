
import React from 'react';
import { Menu, Search, Sun, Moon, LogIn, User, LogOut } from 'lucide-react';
import { Customer } from '../../types';

interface HeaderProps {
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isLoggedIn: boolean;
  onLoginClick?: () => void;
  currentShopCustomer?: Customer | null;
  onShopLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    toggleSidebar, 
    isDarkMode, 
    toggleTheme, 
    isLoggedIn, 
    currentShopCustomer,
    onShopLogout
}) => {

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm p-4 h-16 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center flex-1">
        {/* Only show hamburger in Logged In CRM mode */}
        {isLoggedIn ? (
            <button onClick={toggleSidebar} className="text-neutral-medium dark:text-gray-400 md:hidden mr-4">
            <Menu size={24} />
            </button>
        ) : (
             <div className="flex items-center mr-6">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-neutral-dark dark:text-white hidden sm:block">Mari Zap Shop</span>
             </div>
        )}

        <div className="relative w-full max-w-xs hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-medium dark:text-gray-400" />
          <input
            type="text"
            placeholder={isLoggedIn ? "Busca global..." : "Buscar produtos..."}
            className="w-full pl-10 pr-4 py-2 border rounded-full bg-neutral-light dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {currentShopCustomer && (
            <div className="hidden md:flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="mr-2">Olá, {currentShopCustomer.name.split(' ')[0]}</span>
                {onShopLogout && (
                    <button onClick={onShopLogout} className="text-xs text-danger hover:underline flex items-center">
                        <LogOut size={14} className="mr-1"/> Sair
                    </button>
                )}
            </div>
        )}

        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-neutral-medium dark:text-gray-400 transition-colors duration-200"
          aria-label="Alternar tema"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {!isLoggedIn && currentShopCustomer && onShopLogout && (
             <button 
                onClick={onShopLogout}
                className="md:hidden p-2 text-neutral-medium dark:text-gray-400"
            >
                <LogOut size={20} />
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;
