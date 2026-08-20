import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { navLinks } from '../../data/navigation';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xs"
          >
            <div className="flex items-center gap-3 mb-4">
              <img src="/smarter-academy-logo.webp" alt="Smarter Academy" className="h-12 w-auto rounded-lg object-contain bg-white/10" />
              <div>
                <p className="font-space font-bold text-white text-lg">Smarter Academy</p>
              </div>
            </div>
            <p className="font-inter text-slate-400 text-sm leading-relaxed mb-4">
              Plateforme de mathématiques interactive — du Collège au Lycée.
            </p>

            <p className="flex items-start gap-2 text-xs font-inter text-slate-400">
              <Mail size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <a href="mailto:abdennour.bouhounali@gmail.com" className="hover:text-white transition-colors break-words">abdennour.bouhounali@gmail.com</a>
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-space font-bold text-slate-300 text-sm mb-4 uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-inter text-slate-400 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/contact"
                  className="font-inter text-slate-400 hover:text-white text-sm transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* CTA column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-xs"
          >
            <h4 className="font-space font-bold text-slate-300 text-sm mb-4 uppercase tracking-widest">Rejoignez-nous</h4>
            <p className="font-inter text-slate-400 text-sm leading-relaxed mb-4">
              Créez un compte gratuit et accédez tout de suite à l'expérience 6e.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
            >
              Commencer gratuitement
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="font-inter text-slate-500 text-sm text-center">
              © {new Date().getFullYear()} Smarter Academy — Tous droits réservés
            </p>
            <div className="flex items-center gap-2">
              <span className="font-inter text-slate-500 text-xs">Manipule. Découvre. Comprends. Maîtrise.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
