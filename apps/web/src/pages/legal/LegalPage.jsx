import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * LE CADRE DES TROIS PAGES LÉGALES — mentions légales, confidentialité, CGU.
 *
 * Pourquoi un composant partagé : trois documents qui se citent l'un l'autre
 * doivent se RESSEMBLER. Un lecteur qui passe des CGU à la politique de
 * confidentialité doit retrouver la même gouttière, la même échelle de titres
 * et le même pied de page — sinon il croit avoir changé de site.
 *
 * Le cadre ne fournit QUE la mise en page : en-tête, largeur de lecture,
 * navigation entre les trois documents. Le texte juridique vit dans chaque
 * page, parce que c'est lui qui fait foi.
 *
 * Ce composant s'affiche à l'intérieur de MainLayout, qui porte déjà la barre
 * de navigation et le pied de page : il ne doit en ajouter aucun.
 */

const LEGAL_LINKS = [
  { to: '/mentions-legales', label: 'Mentions légales' },
  { to: '/confidentialite', label: 'Confidentialité' },
  { to: '/cgu', label: 'CGU' },
];

/**
 * Un titre de section numéroté, ancrable.
 *
 * L'ancre (`id`) n'est pas décorative : un utilisateur qui exerce ses droits,
 * ou un tiers qui conteste une clause, doit pouvoir désigner un paragraphe
 * précis par une URL plutôt que par « la partie sur les cookies ».
 */
export function LegalSection({ id, number, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-space font-bold text-xl sm:text-2xl text-slate-900 mt-12 mb-4 flex items-baseline gap-3">
        {number != null && (
          <span className="font-mono-jetbrains text-blue-500 text-sm font-bold shrink-0">
            {number}.
          </span>
        )}
        <span className="min-w-0">{title}</span>
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Un sous-titre à l'intérieur d'une section. */
export function LegalSubheading({ children }) {
  return (
    <h3 className="font-space font-semibold text-base sm:text-lg text-slate-800 mt-6 mb-2">
      {children}
    </h3>
  );
}

/** Un paragraphe de corps de texte. */
export function LegalParagraph({ children }) {
  return (
    <p className="font-inter text-slate-600 text-base leading-relaxed">{children}</p>
  );
}

/** Une liste à puces. */
export function LegalList({ children }) {
  return (
    <ul className="font-inter text-slate-600 text-base leading-relaxed space-y-2 pl-5 list-disc marker:text-blue-400">
      {children}
    </ul>
  );
}

/**
 * Un encadré d'insistance — pour les clauses qu'un lecteur pressé ne doit pas
 * manquer (renonciation au droit de rétractation, absence d'automatisme,
 * consentement parental). Le fond coloré n'a pas de valeur juridique : il
 * signale simplement que la clause engage.
 */
export function LegalCallout({ tone = 'blue', title, children }) {
  const tones = {
    blue: 'bg-blue-50 border-blue-200',
    amber: 'bg-amber-50 border-amber-200',
    slate: 'bg-slate-50 border-slate-200',
  };
  return (
    <div className={`rounded-2xl border px-5 py-4 ${tones[tone] ?? tones.slate}`}>
      {title && (
        <p className="font-space font-semibold text-slate-900 text-base mb-1.5">{title}</p>
      )}
      <div className="font-inter text-slate-700 text-base leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

/**
 * Un tableau. Toujours enveloppé dans un conteneur qui défile
 * horizontalement : à 400 px de large, un tableau à trois colonnes déborde,
 * et un document légal illisible sur téléphone n'est pas opposable
 * sereinement.
 */
export function LegalTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-slate-200">
            {headers.map((h) => (
              <th
                key={h}
                scope="col"
                className="font-space font-semibold text-slate-900 text-sm py-3 pr-4 align-bottom"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 align-top">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`py-3 pr-4 font-inter text-base leading-relaxed ${
                    j === 0 ? 'text-slate-800 font-medium' : 'text-slate-600'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * LA LARGEUR DES PAGES LÉGALES.
 *
 * Deux bornes, et non une — c'est tout l'enjeu du réglage :
 *
 *   `SHELL`    la PAGE. 1200px : le document respire au lieu de laisser deux
 *              tiers de l'écran vides sur un grand moniteur.
 *   `MEASURE`  le TEXTE. ~1050px : au-delà, l'œil perd la ligne en revenant à
 *              la gauche. Une page large ne veut pas dire un paragraphe large.
 *
 * Les gouttières (60px bureau / 40px tablette / 20px mobile) ne sont PAS
 * réécrites ici : elles viennent de `.sa-page`, le cadre déjà partagé par les
 * huit pages élève. Les redéfinir en dur aurait créé une neuvième largeur —
 * exactement ce que ce cadre existe pour empêcher.
 */
const SHELL = 'sa-page mx-auto w-full max-w-[1200px]';
// `mx-auto` : la colonne de lecture est CENTRÉE dans la coquille. Sans lui,
// elle se colle à gauche et laisse, sur un écran large, une bande vide à
// droite — l'impression même de « page mal cadrée » qu'on cherche à corriger.
const MEASURE = 'max-w-[1050px] mx-auto';

export default function LegalPage({ eyebrow, title, intro, updatedAt, children }) {
  return (
    <div className="pt-16">
      <section className={`py-12 sm:py-16 ${SHELL}`}>
        <div className={MEASURE}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {eyebrow && (
              <p className="font-mono-jetbrains text-blue-500 text-sm font-semibold tracking-widest uppercase mb-4">
                {eyebrow}
              </p>
            )}
            <h1 className="font-space font-bold text-3xl sm:text-4xl text-slate-900 leading-tight text-balance mb-4">
              {title}
            </h1>
            {intro && (
              <p className="font-inter text-slate-600 text-lg leading-relaxed">{intro}</p>
            )}
            {updatedAt && (
              <p className="font-mono-jetbrains text-slate-400 text-xs uppercase tracking-wider mt-5">
                Dernière mise à jour : {updatedAt}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <div className={`pb-16 ${SHELL}`}>
        <article className={MEASURE}>{children}</article>
      </div>

      <div className={`pb-20 ${SHELL}`}>
        <nav
          aria-label="Documents légaux"
          className={`${MEASURE} border-t border-slate-200 pt-8 flex flex-wrap gap-x-6 gap-y-3`}
        >
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="font-inter text-base text-slate-500 hover:text-blue-600 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="font-inter text-base text-slate-500 hover:text-blue-600 transition-colors"
          >
            Nous contacter
          </Link>
        </nav>
      </div>
    </div>
  );
}
