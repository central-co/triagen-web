import { CheckCircle2 } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import AnimatedBackground from './ui/AnimatedBackground';
import Card from './ui/Card';
import PageHeader from './ui/PageHeader';

function InterviewFinishedPage() {
    const { darkMode } = useDarkMode(true);

    return (
        <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
            <AnimatedBackground darkMode={darkMode} />
            <PageHeader darkMode={darkMode} />

            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <Card darkMode={darkMode}>
                        <div className="text-center py-8">
                            <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-green-500/20 flex items-center justify-center`}>
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>

                            <h1 className={`font-heading text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                                Entrevista Finalizada!
                            </h1>

                            <p className={`font-sans mb-8 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                                Obrigado por participar. Sua entrevista foi concluída com sucesso.
                                A empresa entrará em contato com você em breve.
                            </p>

                            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'}`}>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                                    Você pode fechar esta página agora.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default InterviewFinishedPage;
