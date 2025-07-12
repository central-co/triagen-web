import { useState, useEffect } from 'react';
import { Save, User, Building, Mail, Phone, Shield, Key, Bell, Globe, Palette } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';

interface UserProfile {
  name: string;
  email: string;
}

interface CompanyProfile {
  name: string;
  cnpj: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: ''
  });
  
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: '',
    cnpj: '',
    contact_email: '',
    contact_phone: '',
    address: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    marketingEmails: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useDarkMode(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        throw new Error('User not found');
      }

      // Load user profile
      setUserProfile({
        name: user.user_metadata?.name || '',
        email: user.email || ''
      });

      // Load company profile
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        throw companyError;
      }

      if (companies) {
        setCompanyProfile({
          name: companies.name || '',
          cnpj: companies.cnpj || '',
          contact_email: companies.contact_email || '',
          contact_phone: companies.contact_phone || '',
          address: companies.address || ''
        });
      }

    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleUserProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    setError('');

    try {
      if (!user?.id) {
        throw new Error('User not found');
      }

      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { name: userProfile.name }
      });

      if (userError) {
        throw userError;
      }

      // Update or create company profile
      const { error: companyError } = await supabase
        .from('companies')
        .upsert({
          user_id: user.id,
          name: companyProfile.name,
          cnpj: companyProfile.cnpj || null,
          contact_email: companyProfile.contact_email || null,
          contact_phone: companyProfile.contact_phone || null,
          address: companyProfile.address || null,
          updated_at: new Date().toISOString()
        });

      if (companyError) {
        throw companyError;
      }

      setSuccess('Configurações salvas com sucesso!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

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
          Gerencie suas informações de perfil e preferências
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* User Profile */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            <User className="h-5 w-5 inline mr-2" />
            Perfil do Usuário
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Nome Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={userProfile.name}
                onChange={handleUserProfileChange}
                placeholder="Seu nome completo"
                className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userProfile.email}
                disabled
                className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 ${
                  darkMode
                    ? 'bg-gray-800/30 border-triagen-border-dark text-gray-500'
                    : 'bg-gray-100 border-triagen-border-light text-gray-500'
                }`}
              />
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-triagen-text-light'}`}>
                O email não pode ser alterado
              </p>
            </div>
          </div>
        </Card>

        {/* Company Profile */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            <Building className="h-5 w-5 inline mr-2" />
            Informações da Empresa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Nome da Empresa *
              </label>
              <input
                type="text"
                id="companyName"
                name="name"
                value={companyProfile.name}
                onChange={handleCompanyProfileChange}
                placeholder="Nome da sua empresa"
                className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                required
              />
            </div>

            <div>
              <label htmlFor="cnpj" className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                CNPJ
              </label>
              <input
                type="text"
                id="cnpj"
                name="cnpj"
                value={companyProfile.cnpj}
                onChange={handleCompanyProfileChange}
                placeholder="00.000.000/0000-00"
                className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
              />
            </div>

            <div>
              <label htmlFor="contact_email" className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                <Mail className="h-4 w-4 inline mr-1" />
                Email de Contato
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                value={companyProfile.contact_email}
                onChange={handleCompanyProfileChange}
                placeholder="contato@empresa.com"
                className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
              />
            </div>

            <div>
              <label htmlFor="contact_phone" className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                <Phone className="h-4 w-4 inline mr-1" />
                Telefone de Contato
              </label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={companyProfile.contact_phone}
                onChange={handleCompanyProfileChange}
                placeholder="(11) 99999-9999"
                className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                <Globe className="h-4 w-4 inline mr-1" />
                Endereço
              </label>
              <textarea
                id="address"
                name="address"
                value={companyProfile.address}
                onChange={handleCompanyProfileChange}
                rows={3}
                placeholder="Endereço completo da empresa"
                className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green resize-none ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
              />
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            <Bell className="h-5 w-5 inline mr-2" />
            Preferências de Notificação
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Notificações por Email
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  Receber notificações sobre novos candidatos e entrevistas
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={() => handlePreferenceChange('emailNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-triagen-secondary-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-triagen-secondary-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Relatórios Semanais
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  Receber resumo semanal das atividades
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.weeklyReports}
                  onChange={() => handlePreferenceChange('weeklyReports')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-triagen-secondary-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-triagen-secondary-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Emails de Marketing
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  Receber novidades e dicas sobre recrutamento
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.marketingEmails}
                  onChange={() => handlePreferenceChange('marketingEmails')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-triagen-secondary-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-triagen-secondary-green"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            <Palette className="h-5 w-5 inline mr-2" />
            Aparência
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Modo Escuro
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Usar tema escuro na interface
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={toggleDarkMode}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-triagen-secondary-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-triagen-secondary-green"></div>
            </label>
          </div>
        </Card>

        {/* Messages */}
        {success && (
          <StatusMessage
            type="success"
            message={success}
            darkMode={darkMode}
          />
        )}

        {error && (
          <StatusMessage
            type="error"
            message={error}
            darkMode={darkMode}
          />
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            icon={Save}
          >
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>

      {/* Security Settings */}
      <Card darkMode={darkMode}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              <Shield className="h-5 w-5 inline mr-2" />
              Segurança
            </h2>
            <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Gerencie suas configurações de segurança e senha
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={Key}
            darkMode={darkMode}
            onClick={() => {
              // TODO: Implement password change functionality
              alert('Funcionalidade de alteração de senha será implementada em breve');
            }}
          >
            Alterar Senha
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default SettingsPage;