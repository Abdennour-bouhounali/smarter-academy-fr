import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

const navLinks = [
  { label: 'Accueil', path: '/' },
  { label: 'Présentation', path: '/about' },
  { label: 'Cours de maths', path: '/courses' },
  { label: 'Ressources', path: '/resources' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

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
              Plateforme éducative en ligne. Cours particuliers et accompagnement personnalisé pour aider les élèves à reprendre confiance et réussir.
            </p>

            <div className="space-y-1.5 text-xs font-inter text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin size={13} className="text-blue-400" />
                <span>Toulouse, Paris & En Ligne</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={13} className="text-blue-400" />
                <a href="tel:+33758103086" className="hover:text-white transition-colors">+33 7 58 10 30 86</a>
              </p>
              <p className="flex items-start gap-2">
                <Mail size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <a href="mailto:abdennour.bouhounali@gmail.com" className="hover:text-white transition-colors break-words">abdennour.bouhounali@gmail.com</a>
              </p>
            </div>
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
            </ul>
          </motion.div>

          {/* Tech highlights / Subject keywords */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-space font-bold text-slate-300 text-sm mb-4 uppercase tracking-widest">Domaines & Lieux</h4>
            <div className="flex flex-wrap gap-2 max-w-xs">
              {['Collège (6e-3e)', 'Lycée (2nde-Tle)', 'Spé Maths', 'Maths Expertes', 'Prépa Brevet', 'Prépa Bac', 'Toulouse', 'Paris', 'En Ligne'].map((tag) => (
                <span
                  key={tag}
                  className="font-inter text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="font-inter text-slate-500 text-sm text-center">
              © {new Date().getFullYear()} Smarter Academy — Tous droits réservés
            </p>
            <div className="flex items-center gap-2">
              <span className="font-inter text-slate-500 text-xs">Cours de Mathématiques • Toulouse, Paris & En Ligne</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
