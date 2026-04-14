import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useJobsData } from '../../hooks/useJobsData';
import { DashboardReportListItem, fetchDashboardReports } from '../../api/reports/dashboardReports';
import StatCard from '../ui/StatCard';
import Button from '../ui/Button';
import DashboardHeader from './DashboardHeader';
import LoadingSpinner from '../ui/LoadingSpinner';

function DashboardHome() {
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { jobs, loading: jobsLoading } = useJobsData();
  const navigate = useNavigate();
  const [recentReports, setRecentReports] = useState<DashboardReportListItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentReports();
    }
  }, [user]);

  const fetchRecentReports = async () => {
    try {
      if (!user?.id) return;
      const transformedReports = await fetchDashboardReports(user.id, 4);
      setRecentReports(transformedReports);
    } catch (err) {
      console.error('Error fetching recent reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  if (statsLoading) {
    return <LoadingSpinner />;
  }

  // Get top 3 active jobs
  const priorityJobs = jobs.filter(j => j.status === 'open').slice(0, 3);

  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto pb-12">
      {/* Header Area */}
      <DashboardHeader
        title="Dashboard"
        darkMode={darkMode}
      />

      {/* Stats Section with Large Numbers */}
      <div className="grid grid-cols-3 gap-8 md:gap-16 border-b border-neutral-200 pb-12 mb-4 px-2">
        <StatCard
          title="Active Roles"
          value={stats.activeJobs?.toString() || "0"}
          darkMode={darkMode}
        />
        <StatCard
          title="Interviews Scheduled"
          value={stats.completedInterviews?.toString() || "0"}
          darkMode={darkMode}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews?.toString() || "0"}
          darkMode={darkMode}
        />
      </div>

      {/* Split Columns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 px-2">
        
        {/* Left Column: Quick Actions / Roles */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-2 border-b border-transparent">
             <h2 className={`text-xl font-heading italic ${darkMode ? 'text-gray-100' : 'text-triagen-primary'}`}>
               Current Priority Roles
             </h2>
             <button 
               onClick={() => navigate('/dashboard/jobs')}
               className={`text-xs font-semibold tracking-wider uppercase transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-triagen-secondary hover:text-triagen-primary'}`}
             >
               View All
             </button>
          </div>

          <div className="flex flex-col gap-4">
             {jobsLoading ? (
               <div className="flex justify-center py-6">
                 <div className="w-6 h-6 rounded-full border-2 border-triagen-primary border-t-transparent animate-spin"></div>
               </div>
             ) : priorityJobs.length === 0 ? (
               <div className="text-center py-6 text-sm text-triagen-secondary">
                  No active roles found
               </div>
             ) : (
               priorityJobs.map((job, idx) => {
                 const colors = [
                   'bg-triagen-primary text-white', 
                   'bg-triagen-secondary text-white', 
                   'bg-[#E4D1C3] text-triagen-primary'
                 ];
                 const colorClass = colors[idx % colors.length];
                 
                 return (
                   <div key={job.id} onClick={() => navigate(`/dashboard/jobs/${job.id}`)} className={`cursor-pointer p-5 rounded border flex items-center gap-4 transition-colors ${darkMode ? 'bg-gray-800/40 border-gray-700 hover:border-gray-600' : 'bg-neutral-50/50 border-neutral-100 hover:border-neutral-200'}`}>
                     <div className={`w-12 h-12 rounded flex items-center justify-center shrink-0 font-heading text-xl ${colorClass}`}>
                        {job.title.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h3 className={`font-semibold font-sans mb-1 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{job.title}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                          {job.department ? `${job.department}` : 'General'} {job.location && `• ${job.location}`}
                        </p>
                     </div>
                   </div>
                 );
               })
             )}
          </div>
        </div>

        {/* Right Column: Pending Review (Candidates) */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-2 border-b border-transparent">
             <h2 className={`text-xl font-heading italic ${darkMode ? 'text-gray-100' : 'text-triagen-primary'}`}>
               Pending Review
             </h2>
             <span className={`text-xs font-semibold tracking-wider uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
               {recentReports.length > 0 ? `${recentReports.length} Awaiting` : '0 Awaiting'}
             </span>
          </div>

          <div className={`p-6 rounded-lg border flex flex-col gap-4 relative ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#f4f7f6]/40 border-[#eaefee]'}`}>
             
             {reportsLoading ? (
               <div className="flex justify-center py-6">
                 <div className="w-6 h-6 rounded-full border-2 border-triagen-primary border-t-transparent animate-spin"></div>
               </div>
             ) : recentReports.length === 0 ? (
               <div className="text-center py-6 text-sm text-triagen-secondary">
                  No candidates pending review
               </div>
             ) : (
               recentReports.map(report => (
                 <div key={report.id} className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                           {/* Avatar placeholder */}
                           <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${report.candidate_name}`} alt={report.candidate_name} className="w-full h-full object-cover" />
                        </div>
                        {report.score > 85 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white"></div>}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-semibold text-[0.95rem] ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{report.candidate_name}</span>
                        <span className={`text-xs tracking-wide uppercase mt-0.5 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>Match Score: {report.score ?? '--'}%</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/dashboard/reports/${report.id}`)}
                      className={`text-xs px-4 py-2 font-semibold uppercase tracking-wider transition-colors ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-triagen-secondary text-white hover:bg-triagen-primary'} rounded-sm`}
                    >
                      Review
                    </button>
                 </div>
               ))
             )}
             
             <div className="mt-4 pt-6 border-t border-gray-200/50 flex justify-end gap-4 items-center">
                <span className={`text-[0.8rem] tracking-wider uppercase font-semibold mr-auto ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                   Focus Mode
                </span>
                <Button 
                   variant="primary-solid" 
                   size="md" 
                   onClick={() => navigate('/dashboard/jobs/new')}
                   icon={Plus}
                   iconPosition="left"
                >
                  New Position
                </Button>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default DashboardHome;
