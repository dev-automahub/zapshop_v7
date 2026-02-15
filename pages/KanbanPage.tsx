
import React from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent, closestCenter } from '@dnd-kit/core';
import KanbanColumnComponent from '../components/kanban/KanbanColumn';
import KanbanCard from '../components/kanban/KanbanCard';
import { KanbanBoardData, Order, KanbanColumn } from '../types';
import { Filter, RotateCcw } from 'lucide-react';

interface KanbanPageProps {
  boardData: KanbanBoardData;
  setBoardData: React.Dispatch<React.SetStateAction<KanbanBoardData>>;
  onEditOrder: (order: Order) => void;
}

const KanbanPage: React.FC<KanbanPageProps> = ({ boardData, setBoardData, onEditOrder }) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    setBoardData((board) => {
      let activeColumnKey: string | undefined;
      let overColumnKey: string | undefined;
      let draggedOrder: Order | undefined;

      // Find active column and the dragged order
      for (const key in board) {
        const column = board[key];
        const order = column.orders.find(o => o.id === activeId);
        if (order) {
          activeColumnKey = key;
          draggedOrder = order;
          break;
        }
      }

      // Find the destination column key
      // `over.id` can be a column ID (droppable) or a card ID (sortable)
      if (board[overId]) {
        // Dropped on a column
        overColumnKey = overId;
      } else {
        // Dropped on a card, find which column that card is in
        for (const key in board) {
          if (board[key].orders.some(o => o.id === overId)) {
            overColumnKey = key;
            break;
          }
        }
      }

      // If we can't determine the columns/order, or if they are the same, do nothing
      if (!activeColumnKey || !overColumnKey || !draggedOrder) {
        return board;
      }
      
      const sourceColumn = board[activeColumnKey];
      const destinationColumn = board[overColumnKey];

      if (!sourceColumn || !destinationColumn) return board;

      // If moving within the same column, we need to handle sorting
      if (activeColumnKey === overColumnKey) {
        const activeIndex = sourceColumn.orders.findIndex(o => o.id === activeId);
        const overIndex = destinationColumn.orders.findIndex(o => o.id === overId);
        
        // Don't do anything if we're not actually changing position
        if(activeIndex === overIndex) return board;

        const newOrders = Array.from(sourceColumn.orders);
        const [movedOrder] = newOrders.splice(activeIndex, 1);
        newOrders.splice(overIndex, 0, movedOrder);
        
        return {
            ...board,
            [activeColumnKey]: {
                ...sourceColumn,
                orders: newOrders,
            }
        }
      }
      
      // If moving to a different column
      const updatedDraggedOrder = { ...draggedOrder, status: overColumnKey };

      return {
        ...board,
        [activeColumnKey]: {
          ...sourceColumn,
          orders: sourceColumn.orders.filter(o => o.id !== activeId),
        },
        [overColumnKey]: {
          ...destinationColumn,
          orders: [...destinationColumn.orders, updatedDraggedOrder],
        },
      };
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-neutral-dark dark:text-white transition-colors">Vendas (Kanban)</h1>
        <div className="flex items-center space-x-2">
           <button className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-neutral-medium dark:text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
             <Filter size={16} className="mr-2"/>
             Filtros
           </button>
           <button className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-neutral-medium dark:text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
             <RotateCcw size={16} className="mr-2"/>
             Desfazer
           </button>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex h-full space-x-4 pb-4">
            {(Object.values(boardData) as KanbanColumn[]).map((column) => (
              <KanbanColumnComponent key={column.id} id={column.id} title={column.title} color={column.color} count={column.orders.length}>
                {column.orders.map((order) => (
                  <KanbanCard key={order.id} order={order} onEditOrder={() => onEditOrder(order)} />
                ))}
              </KanbanColumnComponent>
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanPage;
