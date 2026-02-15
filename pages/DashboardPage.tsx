
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, FunnelChart, Funnel, LabelList } from 'recharts';
import { DollarSign, ShoppingCart, Users, Activity, AlertCircle } from 'lucide-react';
import { Order, Page } from '../types';

const funnelData = [
  { value: 100, name: 'Lead', fill: '#8884d8' },
  { value: 80, name: 'Contactado', fill: '#83a6ed' },
  { value: 50, name: 'Negociação', fill: '#8dd1e1' },
  { value: 40, name: 'Pago', fill: '#82ca9d' },
  { value: 30, name: 'Concluído', fill: '#a4de6c' },
];

const salesData = [
  { name: 'Seg', Vendas: 2400 },
  { name: 'Ter', Vendas: 1398 },
  { name: 'Qua', Vendas: 9800 },
  { name: 'Qui', Vendas: 3908 },
  { name: 'Sex', Vendas: 4800 },
  { name: 'Sáb', Vendas: 3800 },
  { name: 'Dom', Vendas: 4300 },
];

const MetricCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string; }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md flex items-center transition-colors duration-200">
    <div className={`p-3 rounded-full mr-4 ${color} shrink-0`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-neutral-medium dark:text-gray-400 font-medium truncate">{title}</p>
      <p className="text-xl md:text-2xl font-bold text-neutral-dark dark:text-white truncate">{value}</p>
    </div>
  </div>
);

interface DashboardPageProps {
  allOrders: Order[];
  onNavigate: (page: Page) => void;
  onEditOrder: (order: Order) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ allOrders, onNavigate, onEditOrder }) => {

  const handleViewOrder = (orderId: string) => {
    const orderToEdit = allOrders.find(o => o.id === orderId);
    if (orderToEdit) {
      onEditOrder(orderToEdit);
    } else {
      console.error(`Order with ID ${orderId} not found.`);
    }
  };

  const handleViewProducts = () => {
    onNavigate('settings');
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark dark:text-white transition-colors">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard title="Vendas Hoje" value="R$ 1.250" icon={DollarSign} color="bg-green-500" />
        <MetricCard title="Pedidos Pendentes" value="12" icon={ShoppingCart} color="bg-yellow-500" />
        <MetricCard title="Novos Clientes" value="8" icon={Users} color="bg-blue-500" />
        <MetricCard title="Taxa de Conversão" value="35%" icon={Activity} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md transition-colors duration-200">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-neutral-dark dark:text-white">Vendas na Semana</h2>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                <XAxis dataKey="name" stroke="#6B7280" tick={{fontSize: 12}} />
                <YAxis stroke="#6B7280" tick={{fontSize: 12}} width={35} />
                <Tooltip wrapperClassName="!bg-white dark:!bg-gray-700 !border-gray-200 dark:!border-gray-600 !rounded-lg !shadow-lg dark:!text-white" labelStyle={{ color: 'inherit' }} />
                <Legend wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="Vendas" fill="#11678E" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md transition-colors duration-200">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-neutral-dark dark:text-white">Funil de Vendas</h2>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                <Tooltip wrapperClassName="!bg-white dark:!bg-gray-700 !border-gray-200 dark:!border-gray-600 !rounded-lg !shadow-lg dark:!text-white" />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="#888" stroke="none" dataKey="name" />
                </Funnel>
                </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md transition-colors duration-200">
        <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center text-neutral-dark dark:text-white"><AlertCircle className="mr-2 text-action"/> Ações Urgentes</h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            <li className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center text-neutral-dark dark:text-gray-300 gap-2">
                <span className="text-sm md:text-base">Pedido #1001 (Ana Silva) sem resposta há 48h.</span>
                <button onClick={() => handleViewOrder('ord-1001')} className="text-sm font-semibold text-primary hover:underline text-left sm:text-right">Ver Pedido</button>
            </li>
             <li className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center text-neutral-dark dark:text-gray-300 gap-2">
                <span className="text-sm md:text-base">Produto 'Teclado Mecânico RGB' com estoque baixo (2 unidades).</span>
                <button onClick={handleViewProducts} className="text-sm font-semibold text-primary hover:underline text-left sm:text-right">Ver Produto</button>
            </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
