
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { User } from '../../types';

interface UserMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetUserId: string) => void;
  userToDelete: User | null;
  orderCount: number;
  otherUsers: User[];
}

const UserMigrationModal: React.FC<UserMigrationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userToDelete,
  orderCount,
  otherUsers,
}) => {
  const [targetUserId, setTargetUserId] = useState<string>('');

  useEffect(() => {
    if (isOpen && otherUsers.length > 0) {
      setTargetUserId(otherUsers[0].id);
    } else if (isOpen && otherUsers.length === 0) {
        setTargetUserId('');
    }
  }, [isOpen, otherUsers]);

  const handleConfirmClick = () => {
    if (targetUserId) {
      onConfirm(targetUserId);
    }
  };

  if (!isOpen || !userToDelete) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Migrar Pedidos e Excluir Usuário">
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          O usuário <strong>{userToDelete.name}</strong> possui <strong>{orderCount}</strong> pedido(s) atribuído(s).
        </p>
        <p className="text-sm text-gray-700">
          Para excluí-lo, por favor, selecione um novo usuário para receber estes pedidos.
        </p>
        <div>
          <label htmlFor="migrationUser" className="block text-sm font-medium text-gray-700">
            Transferir pedidos para:
          </label>
          <select
            id="migrationUser"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary/50 focus:border-primary/50 sm:text-sm rounded-md"
          >
            {otherUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={!targetUserId}
            className="py-2 px-4 bg-danger text-white font-bold rounded-lg hover:bg-danger/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Migrar e Excluir
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UserMigrationModal;
