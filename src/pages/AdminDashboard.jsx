import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${apiUrl}/contact`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des messages');
        }

        const data = await response.json();
        setContacts(data.contacts || []);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchContacts();
    }
  }, [token, apiUrl]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Navbar simplifiée pour l'admin */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-display font-bold text-xl text-blue-600">Smarter Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 font-medium hidden sm:block">
                Bonjour, {user?.firstName}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-end"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Messages de contact</h1>
            <p className="text-slate-500 text-sm mt-1">Gérez les demandes de cours particuliers.</p>
          </div>
        </motion.div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500 font-medium">Aucun message pour le moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <ul className="divide-y divide-slate-200">
              {contacts.map((contact) => (
                <li key={contact.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{contact.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          contact.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {contact.status === 'new' ? 'Nouveau' : 'Lu'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                      </p>
                      <div className="mt-2 text-sm text-slate-900 font-medium">
                        {contact.objectif && <span className="mr-3">🎯 {contact.objectif}</span>}
                        {contact.classe && <span className="mr-3">📚 {contact.classe}</span>}
                        {contact.ville && <span className="mr-3">📍 {contact.ville}</span>}
                        {contact.phone && <span>📞 <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a></span>}
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50/50 p-3 rounded-lg border border-slate-100 mt-2">
                        {contact.message}
                      </p>
                    </div>
                    <div className="text-sm text-slate-400 whitespace-nowrap">
                      {new Date(contact.created_at).toLocaleString('fr-FR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
