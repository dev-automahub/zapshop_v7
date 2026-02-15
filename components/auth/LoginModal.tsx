
import React, { useState } from 'react';
import Modal from '../common/Modal';
import { User } from '../../types';
import { initialUsers } from '../../data/mockData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUsers[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = initialUsers.find(u => u.id === selectedUserId);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Acesso Restrito">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selecione um usuário para simular o login no sistema CRM.
          </p>
        </div>

        <div>
          <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Usuário
          </label>
          <select
            id="user-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            {initialUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.role}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="py-2 px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Entrar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;
