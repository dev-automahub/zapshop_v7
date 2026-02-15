
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Order } from '../../types';
import { Clock, AlertTriangle, CheckCircle, Package, GripVertical } from 'lucide-react';

interface KanbanCardProps {
  order: Order;
  onEditOrder: () => void;
}

const Tag: React.FC<{ type: Order['tags'][number] }> = ({ type }) => {
  const tagStyles = {
    urgent: { icon: AlertTriangle, text: 'Urgente', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    paid: { icon: CheckCircle, text: 'Pago', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    low_stock: { icon: Package, text: 'Estoque Baixo', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  };

  const { icon: Icon, text, color } = tagStyles[type];
  if (!Icon) return null;

  return (
    <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      <Icon size={12} className="mr-1" />
      {text}
    </span>
  );
};


const KanbanCard: React.FC<KanbanCardProps> = ({ order, onEditOrder }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: order.id,
    data: { order },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    boxShadow: isDragging ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    transformOrigin: '50% 50%',
  };
  
  const timeInStage = Math.round((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 3600 * 24));


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 flex transition-colors"
    >
      <div 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 pr-2 flex items-center"
        onClick={(e) => e.stopPropagation()} // Prevent card click when grabbing
      >
        <GripVertical size={18} />
      </div>

      <div className="flex-1" onClick={onEditOrder} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <p className="text-sm font-semibold text-neutral-dark dark:text-white">{order.customer.name}</p>
          <span className="text-xs font-mono text-neutral-medium dark:text-gray-400">#{order.id.split('-')[1]}</span>
        </div>
        <div className="text-xs text-neutral-medium dark:text-gray-400 mt-2 space-y-1">
          {order.items.map(item => (
            <div key={item.product.id} className="flex items-center text-xs">
              <span className="font-mono mr-2">{String(item.quantity).padStart(2, '0')}</span>
              <p className="truncate" title={item.product.name}>
                {item.product.name}
              </p>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
              <img src={order.assignedTo.avatarUrl} alt={order.assignedTo.name} className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-600" />
              <p className="text-xs ml-2 text-neutral-medium dark:text-gray-300">{order.assignedTo.name}</p>
          </div>
          <p className="text-sm font-bold text-primary">
              {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between text-xs text-neutral-medium dark:text-gray-400">
          <div className="flex items-center">
              <Clock size={12} className="mr-1"/>
              <span>{timeInStage}d nesta fase</span>
          </div>
          <div className="flex space-x-1">
              {order.tags.map(tag => <Tag key={tag} type={tag} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
