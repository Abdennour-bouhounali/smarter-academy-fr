import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BarChart2 } from 'lucide-react';

export default function CourseHero({ title, description, duration, difficulty, icon }) {
  return (
    <section className="relative py-16 px-4 bg-white border-b border-slate-200">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-blue-200"
        >
          {icon}
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold font-space text-slate-900"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 text-lg max-w-2xl mx-auto"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-6 text-sm text-slate-500 font-medium"
        >
          <span className="flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            {duration}
          </span>
          <span className="flex items-center gap-2">
            <BarChart2 size={16} className="text-blue-500" />
            {difficulty}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
