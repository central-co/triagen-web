import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';
import Button from './button';

interface FooterProps {
  darkMode: boolean;
  onJoinWaitlist: () => void;
}

function Footer({ darkMode, onJoinWaitlist }: FooterProps) {
  return (
    <footer className={`py-16 relative ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-900 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Column - Logo and Description */}
          <div className="space-y-6">
            <Logo darkMode={true} />
            <p className="text-gray-400 leading-relaxed">
              Transformando o recrutamento com inteligência artificial. 
              Entrevistas automatizadas que economizam tempo e não perdem talentos.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Middle Column - Contact */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Contato</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400">contato@triagen.com.br</span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400">+55 (11) 9999-9999</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400">São Paulo, SP</span>
              </div>
            </div>
          </div>

          {/* Right Column - Waitlist */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Lista de Espera</h3>
            <p className="text-gray-400">
              Entre na lista de espera e seja um dos primeiros a testar nossa IA de recrutamento.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={onJoinWaitlist}
              className="w-full"
            >
              Entrar na Lista de Espera
            </Button>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400">
            © 2025 TriaGen. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;