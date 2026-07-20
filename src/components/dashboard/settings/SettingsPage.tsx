import { useState, useEffect } from 'react';
import { Save, User, Building, Palette } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { Input, Textarea } from '../../ui/Field';

interface CompanyProfile {
  name: string;
  cnpj: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

function SettingsPage() {
  const [userName, setUserName] = useState('');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: '',
    cnpj: '',
    contact_email: '',
    contact_phone: '',
    address: ''
  });

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const loadUserData = async () => {
      try {
        const { data: companies, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (companyError && companyError.code !== 'PGRST116') {
          throw companyError;
        }

        if (!cancelled && companies) {
          setCompanyId(companies.id);
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
        if (!cancelled) setError('Erro ao carregar dados do usuário');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setUserName(user?.user_metadata?.name || '');
    loadUserData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCompanyChange = (field: keyof CompanyProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setCompanyProfile(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    setError('');

    try {
      if (!userId) throw new Error('Usuário não encontrado');

      const { error: userError } = await supabase.auth.updateUser({
        data: { name: userName }
      });
      if (userError) throw userError;

      const companyData = {
        user_id: userId,
        name: companyProfile.name,
        cnpj: companyProfile.cnpj || null,
        contact_email: companyProfile.contact_email || null,
        contact_phone: companyProfile.contact_phone || null,
        address: companyProfile.address || null,
        updated_at: new Date().toISOString()
      };

      const { error: companyError } = companyId
        ? await supabase.from('companies').update(companyData).eq('id', companyId)
        : await supabase.from('companies').insert(companyData);

      if (companyError) throw companyError;

      setSuccess('Configurações salvas com sucesso!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const sectionHeading = (Icon: typeof User, title: string, description?: string) => (
    <div className="mb-6">
      <h2 className={`flex items-center gap-2 font-heading text-xl ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
        {title}
      </h2>
      {description && (
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
          {description}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="mt-4 mb-10">
        <h1 className={`text-4xl md:text-5xl font-heading font-normal tracking-tight mb-3 ${darkMode ? 'text-gray-100' : 'text-triagen-primary'}`}>
          Configurações
        </h1>
        <p className={`text-lg font-sans ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
          Gerencie seu perfil, os dados da empresa e a aparência da plataforma.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* User Profile */}
        <Card darkMode={darkMode} padding="lg">
          {sectionHeading(User, 'Perfil do usuário')}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome completo"
              darkMode={darkMode}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Seu nome completo"
              autoComplete="name"
              required
            />

            <Input
              label="E-mail"
              type="email"
              darkMode={darkMode}
              value={user?.email || ''}
              disabled
              hint="O e-mail de acesso não pode ser alterado."
            />
          </div>
        </Card>

        {/* Company Profile */}
        <Card darkMode={darkMode} padding="lg">
          {sectionHeading(Building, 'Empresa', 'Essas informações aparecem para os candidatos nas vagas publicadas.')}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome da empresa *"
              darkMode={darkMode}
              value={companyProfile.name}
              onChange={handleCompanyChange('name')}
              placeholder="Nome da sua empresa"
              required
            />

            <Input
              label="CNPJ"
              darkMode={darkMode}
              value={companyProfile.cnpj}
              onChange={handleCompanyChange('cnpj')}
              placeholder="00.000.000/0000-00"
            />

            <Input
              label="E-mail de contato"
              type="email"
              darkMode={darkMode}
              value={companyProfile.contact_email}
              onChange={handleCompanyChange('contact_email')}
              placeholder="contato@empresa.com"
            />

            <Input
              label="Telefone de contato"
              type="tel"
              darkMode={darkMode}
              value={companyProfile.contact_phone}
              onChange={handleCompanyChange('contact_phone')}
              placeholder="(11) 99999-9999"
            />

            <div className="md:col-span-2">
              <Textarea
                label="Endereço"
                darkMode={darkMode}
                value={companyProfile.address}
                onChange={handleCompanyChange('address')}
                rows={3}
                placeholder="Endereço completo da empresa"
              />
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card darkMode={darkMode} padding="lg">
          {sectionHeading(Palette, 'Aparência')}

          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
                Modo escuro
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                Usar tema escuro em toda a plataforma
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              aria-label="Alternar modo escuro"
              onClick={toggleDarkMode}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${darkMode ? 'bg-triagen-secondary-green' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white border border-gray-200 transition-transform ${darkMode ? 'translate-x-full' : ''}`}
              />
            </button>
          </div>
        </Card>

        {/* Messages */}
        {success && (
          <StatusMessage type="success" message={success} darkMode={darkMode} />
        )}
        {error && (
          <StatusMessage type="error" message={error} darkMode={darkMode} />
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            icon={Save}
            iconPosition="left"
          >
            {isSaving ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPage;
