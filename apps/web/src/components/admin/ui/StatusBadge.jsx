import { useTranslation } from 'react-i18next';

/**
 * Une pastille d'état.
 *
 * Le texte porte TOUJOURS l'information — la couleur ne fait que la répéter.
 * C'est la même règle que le `Feedback` des leçons (« jamais la couleur
 * seule »), et elle vaut autant pour un daltonien que pour une capture
 * d'écran en noir et blanc dans un ticket.
 *
 * LE TEXTE VIENT DU CATALOGUE, et il en vient ICI plutôt que sur chaque appelant : une
 * pastille apparaît dans dix-sept écrans, et traduire au point d'affichage
 * aurait produit dix-sept vocabulaires. Le catalogue `admin.status` est donc
 * la seule source, et `STATUS_LABELS` ne subsiste que comme filet
 * pour un `status` hors vocabulaire — auquel cas la pastille dit la clé
 * plutôt que de ne rien dire.
 */
export const STATUS_TONES = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  free: 'bg-slate-100 text-slate-600 border-slate-200',
  dismissed: 'bg-slate-100 text-slate-600 border-slate-200',
  hidden: 'bg-amber-50 text-amber-700 border-amber-200',
  suspended: 'bg-amber-50 text-amber-700 border-amber-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-slate-200 text-slate-700 border-slate-300',
  disabled: 'bg-rose-50 text-rose-700 border-rose-200',
  expired: 'bg-rose-50 text-rose-700 border-rose-200',
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  // Le palier commercial. `premium` manquait : il retombait sur le gris du
  // défaut, exactement la même pastille que « Gratuit » — deux états
  // opposés devenus indiscernables d'un coup d'œil.
  premium: 'bg-amber-100 text-amber-800 border-amber-300',
  // Les codes d'activation. `revoked` manquait au vocabulaire : il
  // retombait sur le gris du défaut, la même pastille que « Disponible » —
  // deux états opposés devenus indiscernables d'un coup d'œil.
  available: 'bg-blue-50 text-blue-700 border-blue-200',
  activated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  revoked: 'bg-rose-50 text-rose-700 border-rose-200',
  inherited: 'bg-slate-50 text-slate-500 border-slate-200',
  duplicate: 'bg-violet-50 text-violet-700 border-violet-200',
  critical: 'bg-rose-100 text-rose-800 border-rose-300',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  // Les offres, leurs versions, les demandes, les abonnements manuels.
  current: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  superseded: 'bg-slate-200 text-slate-700 border-slate-300',
  fulfilled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  trialing: 'bg-blue-50 text-blue-700 border-blue-200',
  visible: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  left: 'bg-slate-100 text-slate-600 border-slate-200',
  removed: 'bg-amber-50 text-amber-700 border-amber-200',
  teacher: 'bg-teal-50 text-teal-700 border-teal-200',
  student: 'bg-blue-50 text-blue-700 border-blue-200',
};

const STATUS_LABELS = {
  current: 'Courante',
  superseded: 'Remplacée',
  fulfilled: 'Activée',
  rejected: 'Refusée',
  cancelled: 'Annulé',
  trialing: 'Essai',
  visible: 'Visible',
  left: 'Parti',
  removed: 'Retiré',
  teacher: 'Professeur',
  student: 'Élève',
  published: 'Publié',
  draft: 'Brouillon',
  hidden: 'Masqué',
  archived: 'Archivé',
  active: 'Actif',
  suspended: 'Suspendu',
  disabled: 'Désactivé',
  new: 'Nouveau',
  in_review: 'En cours',
  resolved: 'Résolu',
  dismissed: 'Rejeté',
  duplicate: 'Doublon',
  free: 'Gratuit',
  premium: 'Premium',
  inherited: 'Hérité',
  expired: 'Expiré',
  available: 'Disponible',
  activated: 'Activé',
  revoked: 'Révoqué',
  pending: 'En attente',
  critical: 'Critique',
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};

export default function StatusBadge({ status, label }) {
  const { t } = useTranslation('admin');
  const tone = STATUS_TONES[status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  // `returnEmptyString: false` est posé sur i18n, mais une clé ABSENTE revient
  // telle quelle : on la compare pour retomber sur le vocabulaire français
  // plutôt que d'afficher « status.foo » à l'écran.
  const key = `status.${status}`;
  const translated = status ? t(key) : null;
  const resolved = translated && translated !== key ? translated : null;

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-inter text-xs font-semibold ${tone}`}>
      {label ?? resolved ?? STATUS_LABELS[status] ?? status}
    </span>
  );
}
