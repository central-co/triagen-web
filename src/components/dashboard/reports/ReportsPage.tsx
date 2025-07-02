import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Search,
  Star,
  StarOff,
  Eye,
  FileText
} from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';
import { Report } from '../../../types/company';

function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        throw new Error('User not found');
      }
      
      // Get reports for user's company jobs
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      if (companyError) {
        throw companyError;
      }

      if (!companies || companies.length === 0) {
        setReports([]);
        return;
      }

      const company = companies[0];

      const { data: reportsData, error: reportsError } = await supabase
        .from('interview_reports')
        .select(`
          *,
          candidate:candidates(
            name,
            job:jobs(
              title
            )
          )
        `)
        .in('candidate_id', [])  // This would need proper subquery
        .order('created_at', { ascending: false });

      if (reportsError) {
        throw reportsError;
      }

      // Transform the data
      const transformedReports: Report[] = (reportsData || []).map(report => ({
        id: report.id,
        candidate_name: report.candidate?.name || 'N/A',
        job_title: report.candidate?.job?.title || 'N/A',
        overall_score: report.overall_score || 0,
        created_at: report.created_at || '',
        alignment_analysis: report.alignment_analysis || '',
        summary: report.summary || '',
        category_scores: (report.category_scores as Record<string, number>) || {}
      }));

      setReports(transformedReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Relatórios
          </h1>
          <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
            Visualize análises e relatórios das entrevistas
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card darkMode={darkMode}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                darkMode ? 'text-gray-400' : 'text-triagen-text-light'
              }`} />
              <input
                type="text"
                placeholder="Buscar relatórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`font-sans w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <StatusMessage
          type="error"
          message="Erro ao carregar relatórios"
          darkMode={darkMode}
        />
      )}

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card darkMode={darkMode}>
          <div className="text-center py-12">
            <FileText className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-triagen-text-light'}`} />
            <h3 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Nenhum relatório encontrado
            </h3>
            <p className={`font-sans mb-6 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Tente ajustar os filtros de busca ou realize mais entrevistas
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} darkMode={darkMode} hoverEffect>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {report.candidate_name} - {report.job_title}
                    </h3>
                  </div>
                  <p className={`font-sans text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'} line-clamp-2`}>
                    {report.summary}
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      <Star className="h-4 w-4" />
                      <span>{report.overall_score} / 10</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(report.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/reports/${report.id}`)}
                    icon={Eye}
                    darkMode={darkMode}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
