
import React, { useState, useRef, useEffect } from 'react';
import { Customer } from '../types';
import { PlusCircle, Edit, Trash2, Phone, Mail } from 'lucide-react';
import Modal from '../components/common/Modal';

interface CustomersPageProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const formatPhoneNumber = (phone: string) => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return phone;
};

const CustomersPage: React.FC<CustomersPageProps> = ({ customers, setCustomers, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', phone: '', email: '', avatarUrl: '' });
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isModalOpen]);

  const openModalForNew = () => {
    setEditingCustomer(null);
    setFormData({ id: `cust-${Date.now()}`, name: '', phone: '', email: '', avatarUrl: `https://i.pravatar.cc/150?u=cust-${Date.now()}` });
    setIsModalOpen(true);
  };

  const openModalForEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ ...customer, phone: formatPhoneNumber(customer.phone) });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
        let input = value.replace(/\D/g, '');
        input = input.substring(0, 11);
        
        let masked = '';
        if (input.length === 0) {
            masked = '';
        } else if (input.length <= 2) {
            masked = `(${input}`;
        } else if (input.length <= 6) {
            masked = `(${input.substring(0, 2)}) ${input.substring(2)}`;
        } else if (input.length <= 10) {
            masked = `(${input.substring(0, 2)}) ${input.substring(2, 6)}-${input.substring(6)}`;
        } else { // 11 digits
            masked = `(${input.substring(0, 2)}) ${input.substring(2, 7)}-${input.substring(7)}`;
        }
        
        setFormData(prev => ({ ...prev, phone: masked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerToSave = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ''), // Store raw digits
    };

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === customerToSave.id ? customerToSave : c));
      showToast('Cliente atualizado com sucesso!');
    } else {
      setCustomers(prev => [...prev, customerToSave]);
      showToast('Cliente adicionado com sucesso!');
    }
    handleCloseModal();
  };

  const handleDelete = (customerId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      showToast('Cliente excluído.', 'success');
    }
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark dark:text-white transition-colors">Clientes</h1>
        <button
          onClick={openModalForNew}
          className="w-full sm:w-auto bg-action hover:bg-action/90 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center transition-colors duration-200"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3">Nome</th>
                <th scope="col" className="px-6 py-3">Telefone</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap flex items-center">
                    <img src={customer.avatarUrl} alt={customer.name} className="h-8 w-8 rounded-full mr-3" />
                    {customer.name}
                  </td>
                  <td className="px-6 py-4">{formatPhoneNumber(customer.phone)}</td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModalForEdit(customer)} className="font-medium text-primary hover:underline mr-4"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(customer.id)} className="font-medium text-danger hover:underline"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
           {customers.map(customer => (
             <div key={customer.id} className="border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex flex-col gap-3">
               <div className="flex items-center space-x-3">
                 <img src={customer.avatarUrl} alt={customer.name} className="h-12 w-12 rounded-full" />
                 <div>
                   <h3 className="font-bold text-gray-900 dark:text-white">{customer.name}</h3>
                   <span className="text-xs text-gray-500 dark:text-gray-400">ID: {customer.id.split('-')[1]}</span>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Phone size={16} className="mr-2 text-gray-400" />
                    {formatPhoneNumber(customer.phone)}
                 </div>
                 <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Mail size={16} className="mr-2 text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                 </div>
               </div>

               <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-600 gap-3">
                  <button 
                    onClick={() => openModalForEdit(customer)} 
                    className="flex items-center text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-md"
                  >
                    <Edit size={16} className="mr-1.5" /> Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(customer.id)} 
                    className="flex items-center text-sm font-medium text-danger bg-danger/10 px-3 py-1.5 rounded-md"
                  >
                    <Trash2 size={16} className="mr-1.5" /> Excluir
                  </button>
               </div>
             </div>
           ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
            <input ref={nameInputRef} type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required placeholder="(XX) XXXXX-XXXX" maxLength={15} />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary/50 focus:border-primary/50 bg-white dark:bg-gray-700 dark:text-white" required />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={handleCloseModal} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomersPage;
