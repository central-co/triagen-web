import { Mail } from 'lucide-react';

/** Site footer. Ink band in both themes, so no darkMode prop is needed. */
function Footer() {
  return (
    <footer className="bg-triagen-dark-bg text-white">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="max-w-md">
            <p className="font-heading text-2xl font-semibold tracking-tight mb-3">
              TriaGen<span className="text-triagen-secondary-green">.</span>
            </p>
            <p className="font-sans text-sm text-gray-300 leading-relaxed">
              Entrevistas de triagem por voz, conduzidas por IA — para que toda
              candidatura receba uma conversa e toda decisão tenha contexto.
            </p>
          </div>

          <a
            href="mailto:contato@triagen.app"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <Mail className="h-4 w-4 text-triagen-secondary-green" aria-hidden="true" />
            contato@triagen.app
          </a>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} TriaGen. Todos os direitos reservados.</p>
          <p>Feito no Brasil.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
