import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle, Mail, GraduationCap, Sparkles, LogOut, Crown, ChevronDown } from 'lucide-react';
import { getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { getDisplayName, getInitials } from '../../utils/userDisplay';

export default function Profil() {
  useDocumentMeta('Mon profil', 'Gère ta classe et ton compte Smarter Academy.');
  const { user, updateGrade, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const allGrades = getAllGrades();
  const currentGrade = allGrades.find((g) => g.id === user?.grade);

  const handleGradeChange = async (e) => {
    const newGrade = e.target.value;
    if (!newGrade || newGrade === user?.grade) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateGrade(newGrade);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error updating grade:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initials = getInitials(user);

  return (
    <div className="sa-page py-8 sm:py-10">
      <div className="mb-8">
        <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5">
          <UserCircle size={13} /> Profil
        </p>
        <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">Mon compte</h1>
      </div>

      {/* Identity card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-7 mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-space font-bold text-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-space font-bold text-slate-900 text-lg truncate">{getDisplayName(user)}</p>
            <p className="font-inter text-slate-500 text-sm flex items-center gap-1.5 truncate">
              <Mail size={13} className="flex-shrink-0" /> {user?.email}
            </p>
          </div>
        </div>

        <label htmlFor="profile-grade" className="block font-inter text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <GraduationCap size={15} className="text-blue-500" /> Ma classe
        </label>
        <div className="relative">
          <select
            id="profile-grade"
            value={user?.grade || ''}
            onChange={handleGradeChange}
            disabled={saving}
            className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white font-inter text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 disabled:opacity-60 transition-all"
          >
            {!currentGrade && <option value="" disabled>Sélectionne ta classe</option>}
            {allGrades.map((g) => (
              <option key={g.id} value={g.id}>{g.levelTitle} — {g.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        {saved && (
          <p className="mt-2 text-xs font-inter text-emerald-600 flex items-center gap-1">
            <Sparkles size={12} /> Classe mise à jour — ton espace s'adapte automatiquement.
          </p>
        )}
        <p className="mt-2 font-inter text-slate-400 text-xs leading-relaxed">
          Changer de classe met à jour ton contenu par défaut dans "Mes cours" — ta progression sur les autres niveaux reste intacte.
        </p>
      </motion.div>

      {/* Plan card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6 sm:p-7 mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
            <Sparkles size={17} />
          </div>
          <div>
            <p className="font-space font-bold text-slate-800 text-sm">Compte gratuit</p>
            <p className="font-inter text-slate-500 text-xs mt-0.5">Accès à l'expérience 6e sélectionnée</p>
          </div>
        </div>
        <Link to="/tarifs" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-space font-bold text-xs text-white transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
          <Crown size={14} />
          Passer Premium
        </Link>
      </motion.div>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-inter text-sm font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors"
      >
        <LogOut size={15} />
        Se déconnecter
      </motion.button>
    </div>
  );
}
