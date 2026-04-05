/**
 * Footer — Trading Journal Pro
 * Design: Swiss International Style — minimalista, limpio, funcional
 * Información de contacto, redes sociales y derechos reservados
 */

import { Mail, Github, Linkedin, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Grid principal: 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Columna 1: Branding */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">BL</span>
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-semibold text-sm">Bastian Trader</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">Journal Pro</p>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Registro profesional de operaciones de trading. Análisis, métricas y seguimiento de tu desempeño.
            </p>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Enlaces
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Calendario
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Privacidad
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Términos
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto y redes */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Contacto
            </h3>
            <div className="space-y-3">
              {/* Email */}
              <a
                href="mailto:bastian@balevatravel.com"
                className="flex items-center gap-2.5 text-gray-600 text-sm hover:text-emerald-600 transition-colors group"
              >
                <Mail size={16} className="text-gray-400 group-hover:text-emerald-600" />
                <span>bastian@balevatravel.com</span>
              </a>

              {/* Redes sociales */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://github.com/NomadeTrip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                  title="GitHub"
                >
                  <Github size={16} />
                </a>
                <a
                  href="https://linkedin.com/in/bastianleon-arq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin size={16} />
                </a>
                <a
                  href="https://instagram.com/_bassti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                  title="Twitter"
                >
                  <Instagram size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px bg-gray-100 mb-8" />

        {/* Footer inferior: Copyright y info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-xs text-center md:text-left">
            © {currentYear} <span className="font-semibold text-gray-700 dark:text-gray-200">Bastian Leon</span>. Todos los derechos reservados.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Bastian Trading Journal Pro v1.0 • Construido con React + Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}