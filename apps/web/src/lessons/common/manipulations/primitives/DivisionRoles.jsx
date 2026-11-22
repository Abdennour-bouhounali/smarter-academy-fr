
/**
 * LES TROIS RÔLES de a = b × q + r, nommés dans les mots de la scène.
 *
 * La même égalité se vit de deux façons dans la leçon 1, et l'élève ne doit
 * pas passer de l'une à l'autre sans le savoir (audit 2026-09-29, X-1) :
 *
 *   PARTITION (les équipes)   b = le nombre de GROUPES, q = la taille d'un groupe
 *   QUOTITION (les rayons)    b = la TAILLE d'un groupe, q = le nombre de groupes
 *
 * Ce qui ne change jamais, et que cette brique dit à chaque fois : b est le
 * nombre que l'élève a CHOISI, q est ce qui en RÉSULTE, et r est ce qui reste
 * — toujours plus petit que b. Les libellés viennent du type (lesson.json) ;
 * la brique ne contient aucun texte.
 *
 * @param roles  [{ key: 'b'|'q'|'r', text }] — dans l'ordre b, q, r
 */
const TONE = {
  b: 'border-indigo-300 bg-indigo-50 text-indigo-900',
  q: 'border-violet-300 bg-violet-50 text-violet-900',
  r: 'border-rose-300 bg-rose-50 text-rose-900',
};

export default function DivisionRoles({ roles, className = '' }) {
  return (
    <ul className={`grid gap-1.5 grid-cols-3 ${className}`} data-division-roles>
      {roles.map(({ key, text }) => (
        <li key={key} className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 font-bold text-sm ${TONE[key]}`} data-division-role={key}>
          <span dir="ltr" className="font-mono text-sm font-extrabold">{key}</span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
