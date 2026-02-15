
import React, { useState } from 'react';
import { Customer, User } from '../types';
import { ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';

interface AuthPageProps {
  customers: Customer[];
  users: User[];
  onLogin: (email: string) => void;
  onRegister: (data: Omit<Customer, 'id' | 'avatarUrl'>) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ customers, users, onLogin, onRegister, showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Visual loading state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a brief "processing" feel for UX smoothness
    await new Promise(resolve => setTimeout(resolve, 600));

    if (isLogin) {
      const userExists = users.some(u => u.email.toLowerCase() === formData.email.toLowerCase());
      const customerExists = customers.some(c => c.email.toLowerCase() === formData.email.toLowerCase());

      if (userExists || customerExists) {
        onLogin(formData.email);
      } else {
        showToast('E-mail não encontrado. Verifique ou crie uma conta.', 'error');
        setIsLoading(false);
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        showToast('As senhas não coincidem.', 'error');
        setIsLoading(false);
        return;
      }
      
      const emailExists = customers.some(c => c.email.toLowerCase() === formData.email.toLowerCase());
      const userEmailExists = users.some(u => u.email.toLowerCase() === formData.email.toLowerCase());
      
      if (emailExists || userEmailExists) {
        showToast('Este e-mail já está cadastrado. Faça login.', 'error');
        setIsLogin(true);
        setIsLoading(false);
        return;
      }

      onRegister({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Decorative Background Elements (Subtle blobs) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-action/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md animate-fade-in-down z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="mx-auto h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg mb-6 transform rotate-3">
            <ShoppingBag size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Clube de Compras<br/>da Mari
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
            {isLogin 
              ? 'Bem-vindo de volta. Acesse sua conta para ver as novidades.' 
              : 'Junte-se ao clube e tenha acesso a ofertas exclusivas.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/20 dark:border-gray-700 p-8 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-1 gap-5 animate-fade-in-down">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nome Completo</label>
                    <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                    placeholder="Ex: Maria Silva"
                    required={!isLogin}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Telefone / WhatsApp</label>
                    <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                    placeholder="(00) 00000-0000"
                    required={!isLogin}
                    />
                </div>
              </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">E-mail</label>
                <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                placeholder="nome@exemplo.com"
                required
                />
            </div>

            <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Senha</label>
                <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                />
            </div>

            {!isLogin && (
               <div className="animate-fade-in-down">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Confirmar Senha</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required={!isLogin}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 transition-all duration-200 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-700 pt-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isLogin ? 'Ainda não faz parte do clube?' : 'Já possui cadastro?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-bold ml-1.5 hover:text-primary/80 focus:outline-none transition-colors"
              >
                {isLogin ? 'Cadastre-se agora' : 'Faça Login'}
              </button>
            </p>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-gray-400 text-xs mt-8">
          &copy; {new Date().getFullYear()} Mari Zap Shop. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
