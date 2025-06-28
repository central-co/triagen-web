import { useState, useEffect } from 'react';
import { Save, Building, User, CreditCard, Bell, Shield } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import Button from '../../ui/button';
import Card from '../../ui/card';
import StatusMessage from '../../ui/StatusMessage';
import { Company, Plan, Subscription } from '../../../types/company';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [company, setCompany] = useState<Company | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { darkMode } = useDarkMode(true);
  const { user, signOut } = useAuth();

  const [companyForm, setCompanyForm] = useState({
    name: '',
    cnpj: '',
    contact_email: '',
    contact_phone: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get company data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id);

      if (companyError) {
        throw companyError;
      }

      if (companyData && companyData.length > 0) {
        const company = companyData[0];
        setCompany(company);
        setCompanyForm({
          name: company.name || '',
          cnpj: company.cnpj || '',
          contact_email: company.contact_email || '',
          contact_phone: company.contact_phone || '',
          address: company.address || ''
        });

        // Get subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select(`
            *,
            plan:plans(*)
          `)
          .eq('company_id', company.id)
          .eq('status', 'active')
          .single();

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.warn('No active subscription found');
        } else if (subscriptionData) {
          setSubscription(subscriptionData);
          setPlan(subscriptionData.plan);
        }
      }

    } catch (err) {
      console.error('Error fetching settings data:', err);
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (company) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update({
            name: companyForm.name,
            cnpj: companyForm.cnpj || null,
            contact_email: companyForm.contact_email || null,
            contact_phone: companyForm.contact_phone || null,
            address: companyForm.address || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', company.id);

        if (error) throw error;
      } else {
        // Create new company
        const { data, error } = await supabase
          .from('companies')
          .insert({
            user_id: user?.id,
            name: companyForm.name,
            cnpj: companyForm.cnpj || null,
            contact_email: companyForm.contact_email || null,
            contact_phone: companyForm.contact_phone || null,
            address: companyForm.address || null
          })
          .select()
          .single();

        if (error) throw error;
        setCompany(data);
      }

      setSuccess('Dados da empresa salvos com sucesso!');
    } catch (err) {
      console.error('Error saving company data:', err);
      setError('Erro ao salvar dados da empresa');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const tabs = [
    { id: 'company', label: 'Empresa', icon: Building },
    { id: 'account', label: 'Conta', icon: User },
    { id: 'subscription', label: 'Plano', icon: CreditCard },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-triagen-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
          Configurações
        </h1>
        <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
          Gerencie sua conta, empresa e preferências
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card darkMode={darkMode}>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? darkMode
                          ? 'bg-triagen-secondary-green/20 text-triagen-secondary-green border border-triagen-secondary-green/30'
                          : 'bg-triagen-primary-blue/20 text-triagen-primary-blue border border-triagen-primary-blue/30'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                          : 'text-triagen-text-light hover:bg-triagen-border-light hover:text-triagen-text-dark'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Company Settings */}
          {activeTab === 'company' && (
            <Card darkMode={darkMode}>
              <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Dados da Empresa
              </h2>

              <form onSubmit={handleCompanySubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome da sua empresa"
                    className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                      darkMode
                        ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                        : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                    }`}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="cnpj" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                      CNPJ
                    </label>
                    <input
                      type="text"
                      id="cnpj"
                      value={companyForm.cnpj}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0000-00"
                      className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                        darkMode
                          ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                          : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact_phone" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="contact_phone"
                      value={companyForm.contact_phone}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                        darkMode
                          ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                          : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact_email" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                    Email de Contato
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    value={companyForm.contact_email}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="contato@empresa.com"
                    className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                      darkMode
                        ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                        : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="address" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                    Endereço
                  </label>
                  <textarea
                    id="address"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Endereço completo da empresa"
                    rows={3}
                    className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green resize-none ${
                      darkMode
                        ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                        : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                    }`}
                  />
                </div>

                {error && (
                  <StatusMessage
                    type="error"
                    message={error}
                    darkMode={darkMode}
                  />
                )}

                {success && (
                  <StatusMessage
                    type="success"
                    message={success}
                    darkMode={darkMode}
                  />
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={saving}
                  icon={Save}
                  iconPosition="left"
                  className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </Card>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <Card darkMode={darkMode}>
              <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Configurações da Conta
              </h2>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={`font-sans w-full px-4 py-3 rounded-xl border ${
                      darkMode
                        ? 'bg-gray-800/30 border-triagen-border-dark text-gray-400'
                        : 'bg-gray-100 border-triagen-border-light text-triagen-text-light'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-triagen-text-light'}`}>
                    Para alterar o email, entre em contato com o suporte
                  </p>
                </div>

                <div className="pt-6 border-t border-triagen-border-light dark:border-triagen-border-dark">
                  <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    Zona de Perigo
                  </h3>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleSignOut}
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Sair da Conta
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Subscription Settings */}
          {activeTab === 'subscription' && (
            <Card darkMode={darkMode}>
              <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Plano e Assinatura
              </h2>

              {subscription && plan ? (
                <div className="space-y-6">
                  <div className={`p-6 rounded-xl border ${
                    darkMode ? 'border-triagen-border-dark bg-gray-800/30' : 'border-triagen-border-light bg-triagen-light-bg/30'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                        {plan.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        subscription.status === 'active' 
                          ? 'bg-triagen-secondary-green/20 text-triagen-secondary-green'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {plan.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                          {subscription.credits_remaining}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                          Créditos restantes
                        </div>
                      </div>
                      
                      <div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                          {plan.interview_credits}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                          Créditos totais
                        </div>
                      </div>

                      <div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                          {subscription.current_period_end 
                            ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR')
                            : 'N/A'
                          }
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                          Renovação
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      variant="primary"
                      size="md"
                      className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
                    >
                      Comprar Mais Créditos
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      darkMode={darkMode}
                    >
                      Alterar Plano
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-triagen-text-light'}`} />
                  <h3 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    Nenhum plano ativo
                  </h3>
                  <p className={`font-sans mb-6 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                    Escolha um plano para começar a usar a plataforma
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
                  >
                    Escolher Plano
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Other tabs placeholder */}
          {(activeTab === 'notifications' || activeTab === 'security') && (
            <Card darkMode={darkMode}>
              <div className="text-center py-12">
                <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-triagen-text-light'}`}>
                  🚧
                </div>
                <h3 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Em Desenvolvimento
                </h3>
                <p className={`font-sans ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  Esta seção estará disponível em breve
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;