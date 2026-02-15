
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, count, color, children }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col w-72 md:w-80 bg-gray-100 dark:bg-gray-800/50 rounded-lg shadow-sm h-full flex-shrink-0 transition-colors"
    >
      <div className={`p-3 flex justify-between items-center rounded-t-lg ${color}`}>
        <h2 className="font-bold text-gray-800 dark:text-gray-900">{title}</h2>
        <span className="bg-gray-600/20 text-gray-800 dark:text-gray-900 text-xs font-semibold px-2 py-1 rounded-full">
          {count}
        </span>
      </div>
      <div className="p-2 flex-1 overflow-y-auto space-y-2">
        <SortableContext items={React.Children.map(children, child => (child as React.ReactElement).key as string) || []} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
