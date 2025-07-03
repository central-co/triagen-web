
import { useState } from 'react';
import { Save, User, Building, Mail, Phone, Shield } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';

function SettingsPage() {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    companyName: 'Acme Corp',
    email: 'john.doe@example.com',
    phone: '(11) 99999-9999'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { darkMode } = useDarkMode(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess('Configurações salvas com sucesso!');
    } catch (err) {
      setError('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
          Configurações
        </h1>
        <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
          Atualize suas informações de perfil e empresa
        </p>
      </div>

      {/* Form */}
      <Card darkMode={darkMode}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
              <User className="h-4 w-4 inline mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
            <label htmlFor="companyName" className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
              <Building className="h-4 w-4 inline mr-2" />
              Nome da Empresa
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Sua empresa"
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
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                darkMode
                  ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                  : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
              }`}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
              <Phone className="h-4 w-4 inline mr-2" />
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                darkMode
                  ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                  : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
              }`}
              required
            />
          </div>

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

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isSaving}
            icon={Save}
            className="h-12 px-6 text-base whitespace-nowrap bg-triagen-dark-bg hover:bg-triagen-primary-blue"
          >
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>
      </Card>

      {/* Security Settings (Example) */}
      <Card darkMode={darkMode}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Segurança
            </h2>
            <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Gerencie suas configurações de segurança
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={Shield}
            darkMode={darkMode}
          >
            Alterar Senha
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default SettingsPage;
