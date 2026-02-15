
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Order, KanbanBoardData, KanbanColumn } from '../../types';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateOrder: (order: Order) => void;
  boardData: KanbanBoardData;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ isOpen, onClose, order, onUpdateOrder, boardData }) => {
  const [currentStatus, setCurrentStatus] = useState<string>('');

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
    }
  }, [order]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (order) {
      onUpdateOrder({
        ...order,
        status: currentStatus,
      });
      onClose(); // Close modal on successful update
    }
  };

  if (!order) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Editar Pedido #${order.id.split('-')[1]}`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-neutral-dark">
              <p><span className="font-semibold">Cliente:</span> {order.customer.name}</p>
              <div>
                <span className="font-semibold">Produtos:</span>
                <div className="mt-1 space-y-1 pl-2 border-l-2 border-gray-200">
                  {order.items.map(item => (
                    <div key={item.product.id} className="flex items-center text-sm text-neutral-medium">
                      <span className="font-mono text-xs mr-3">{String(item.quantity).padStart(2, '0')}</span>
                      <p className="truncate" title={item.product.name}>
                        {item.product.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <p><span className="font-semibold">Total:</span> {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p><span className="font-semibold">Atribuído a:</span> {order.assignedTo.name}</p>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status do Pedido</label>
            <select
              id="status"
              value={currentStatus}
              onChange={e => setCurrentStatus(e.target.value)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary/50 focus:border-primary/50 sm:text-sm rounded-md"
            >
              {(Object.values(boardData) as KanbanColumn[]).map(column => (
                <option key={column.id} value={column.id}>{column.title}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end items-center pt-4">
            <div className="flex space-x-2">
              <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
              <button type="submit" className="py-2 px-4 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">Salvar Alterações</button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default EditOrderModal;
