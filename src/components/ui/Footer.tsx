import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import Logo from './Logo';
import Button from './button';

interface FooterProps {
  darkMode: boolean;
  onJoinWaitlist: () => void;
}

function Footer({ darkMode, onJoinWaitlist }: FooterProps) {
  return (
    <footer className={`py-16 relative ${
      darkMode ? 'bg-triagen-dark-bg text-white' : 'bg-triagen-dark-bg text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Column - Logo and Description */}
          <div className="space-y-6">
            <Logo darkMode={true} />
            <p className="font-sans text-gray-300 leading-relaxed">
              Mais alcance, mais precisão.
              Democratizamos a escuta no recrutamento com IA empática e transparente.
            </p>
            <div className="flex items-center space-x-2 text-triagen-secondary-green">
              <Heart className="h-4 w-4" />
              <span className="font-sans text-sm">Humanizando o recrutamento</span>
            </div>
          </div>

          {/* Middle Column - Contact */}
          <div className="space-y-6">
            <h3 className="font-heading text-lg font-semibold text-white">Contato</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-triagen-secondary-green mt-0.5" />
                <span className="font-sans text-gray-300">contato@triagen.com.br</span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-triagen-secondary-green mt-0.5" />
                <span className="font-sans text-gray-300">+55 (11) 9999-9999</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-triagen-secondary-green mt-0.5" />
                <span className="font-sans text-gray-300">São Paulo, SP</span>
              </div>
            </div>
          </div>

          {/* Right Column - CTA */}
          <div className="space-y-6">
            <h3 className="font-heading text-lg font-semibold text-white">Comece a Ouvir Mais</h3>
            <p className="font-sans text-gray-300">
              Seja um dos primeiros a testar nossa plataforma revolucionária.
              Descubra como nossa IA pode transformar seu recrutamento.
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={onJoinWaitlist}
                darkMode={true}
              >
                Junte-se à Lista de Espera
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-600">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="font-sans text-center md:text-left text-gray-400">
              © 2025 TriaGen. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="font-sans hover:text-triagen-secondary-green transition-colors">Termos de Uso</a>
              <a href="#" className="font-sans hover:text-triagen-secondary-green transition-colors">Privacidade</a>
              <a href="#" className="font-sans hover:text-triagen-secondary-green transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;