import i18n from '../../i18n';
import { CONTENT_NOUNS } from './contentNouns';
import { bulkChangeContentStatus, bulkChangeContentTier } from '../../services/admin/contentService';

/**
 * Les actions groupées disponibles pour un type de contenu.
 *
 * DÉRIVÉES des gestes unitaires, pas inventées. Le panneau n'en connaît que
 * deux — changer l'état de publication (PublicationControl) et changer le
 * palier (TierControl) — et il n'existe nulle part de suppression, de
 * duplication, de réordonnancement ni d'édition : le contenu pédagogique vit
 * dans les fichiers, la base ne porte que l'état de diffusion. On n'ajoute
 * donc ici aucune action qui n'existe pas à l'unité.
 *
 * Le palier suit la même frontière qu'à l'unité : leçons et exercices oui,
 * modules non (un module suit le palier de sa leçon).
 *
 * Ce module ne décide RIEN : c'est le serveur qui valide, journalise et peut
 * refuser contenu par contenu. Les `disabledReason` ci-dessous ne sont que du
 * confort — éviter de lancer un lot dont on sait déjà qu'il ne changera rien.
 *
 * LA LANGUE. Ce fichier n'est pas un composant : `buildContentBulkActions`
 * est une fabrique appelée dans un `useMemo`, et un hook `useTranslation` n'y
 * a pas sa place. On traduit donc contre l'instance i18next directement —
 * même instance, même catalogue `admin`, même catégorie de pluriel arabe que
 * partout ailleurs. Et la SIGNATURE de la fabrique ne bouge pas : les trois
 * pages de contenu l'appellent déjà avec cet objet d'options, elles n'ont
 * rien à changer.
 */

/** Traduit dans le catalogue `admin`, hors composant React. */
const t = (key, options) => i18n.t(key, { ns: 'admin', ...options });

/**
 * « 24 درساً » — le nom compté, dans la bonne catégorie de pluriel arabe.
 *
 * L'arabe en a six (`zero`, `one`, `two`, `few`, `many`, `other`) et c'est
 * `Intl.PluralRules('ar-DZ')` qui choisit, jamais nous : « درسان » pour 2,
 * « 3 دروس » pour 3, « 11 درساً » pour 11. Une concaténation ne sait pas
 * faire ça — d'où la disparition de l'ancien `countNoun`/`agree` français.
 */
const counted = (count, noun) => t(`bulk.noun.${noun?.key ?? 'item'}`, { count });

/**
 * Le même nom, au CAS OBLIQUE — « أرشفة درسين » et non « أرشفة درسان ».
 *
 * Seul le duel distingue les deux cas en arabe, mais il les distingue
 * toujours : un `{{counted}}` unique serait faux une fois sur six.
 */
const countedObj = (count, noun) => t(`bulk.nounOf.${noun?.key ?? 'item'}`, { count });

/** Les quatre états, tels que les propose déjà le menu unitaire. */
const STATUS_ACTIONS = [
  {
    status: 'published',
    labelKey: 'bulk.publish',
    tone: 'default',
    // Republier ne retire rien à personne : même asymétrie qu'à l'unité, où
    // PublicationControl applique « Publier » sans confirmation.
    confirm: {
      title: (count, c) => t('bulk.confirmPublishTitle', { counted: c }),
      confirmLabel: (count, c) => t('bulk.confirmPublishAction', { counted: c }),
      message: (count, c) => <p>{t('bulk.confirmPublishMessage', { count, counted: c })}</p>,
    },
  },
  {
    status: 'hidden',
    labelKey: 'bulk.hide',
    tone: 'danger',
    confirm: {
      title: (count, c) => t('bulk.confirmHideTitle', { counted: c }),
      confirmLabel: (count, c) => t('bulk.confirmHideAction', { counted: c }),
      message: (count, c) => (
        <p>
          {t('bulk.confirmHideMessage', { counted: c })}{' '}
          <strong>{t('bulk.noLearningDataLost')}</strong>{t('bulk.noLearningDataLostHide')}
        </p>
      ),
    },
  },
  {
    status: 'draft',
    labelKey: 'bulk.draft',
    tone: 'danger',
    confirm: {
      title: (count, c) => t('bulk.confirmDraftTitle', { counted: c }),
      confirmLabel: (count, c) => t('bulk.confirmDraftAction', { counted: c }),
      message: (count, c) => (
        <p>
          {t('bulk.confirmDraftMessage', { counted: c })}{' '}
          <strong>{t('bulk.noLearningDataLost')}</strong>
        </p>
      ),
    },
  },
  {
    status: 'archived',
    labelKey: 'bulk.archive',
    tone: 'danger',
    confirm: {
      title: (count, c) => t('bulk.confirmArchiveTitle', { counted: c }),
      confirmLabel: (count, c) => t('bulk.confirmArchiveAction', { counted: c }),
      message: (count, c) => (
        <p>
          {t('bulk.confirmArchiveMessage')}{' '}
          <strong>{t('bulk.noLearningDataLost')}</strong>{' '}
          {t('bulk.confirmArchiveRepublishable', { count, counted: c })}
        </p>
      ),
    },
  },
];

const TIER_ACTIONS = [
  {
    tier: 'free',
    labelKey: 'bulk.setFree',
    tone: 'default',
    // Ouvrir un accès ne se confirme pas — comme à l'unité.
    confirm: null,
  },
  {
    tier: 'premium',
    labelKey: 'bulk.setPremium',
    tone: 'danger',
    confirm: {
      title: (count, c) => t('bulk.confirmPremiumTitle', { count, counted: c }),
      confirmLabel: () => t('bulk.confirmPremiumAction'),
      message: (count, c) => (
        <>
          <p>{t('bulk.confirmPremiumMessage', { counted: c })}</p>
          <p className="mt-2">
            <strong>{t('bulk.noLearningDataLost')}</strong> {t('bulk.publicationUnchanged')}
          </p>
        </>
      ),
    },
  },
];

/**
 * « Hériter de la leçon » — `tier: null`, réservé aux exercices.
 *
 * Séparé de TIER_ACTIONS parce qu'il n'est proposé que là où il existe à
 * l'unité : une leçon n'a rien dont hériter, et le serveur refuse `null` pour
 * elle.
 *
 * Se confirme comme « Rendre payant », mais pour une raison plus subtile :
 * hériter peut OUVRIR ou FERMER l'accès selon le palier de la leçon, et dans
 * un lot les exercices sélectionnés peuvent dépendre de leçons différentes. On
 * ne peut donc pas savoir à l'avance dans quel sens ça va — c'est exactement
 * pour ça qu'on demande.
 */
const TIER_INHERIT_ACTION = {
  tier: null,
  labelKey: 'bulk.inherit',
  tone: 'default',
  confirm: {
    title: (count, c) => t('bulk.confirmInheritTitle', { counted: c }),
    confirmLabel: (count, c) => t('bulk.confirmInheritAction', { counted: c }),
    message: (count, c) => (
      <>
        <p>{t('bulk.confirmInheritMessage', { count, counted: c })}</p>
        <p className="mt-2">
          {t('bulk.confirmInheritWarning')} <strong>{t('bulk.noLearningDataLost')}</strong>
        </p>
      </>
    ),
  },
};

/**
 * Rattache au rapport d'échec le TITRE de chaque contenu refusé.
 *
 * Le serveur ne renvoie que des identifiants — il n'a pas à deviner ce que la
 * liste affiche. Mais « #148 n'a pas pu être publié » n'aide personne : c'est
 * le nom qui permet de retrouver la ligne.
 */
function nameFailures(failed, rows, titleOf) {
  const byId = new Map(rows.map((row) => [row.id, row]));

  return (failed ?? []).map((failure) => ({
    ...failure,
    title: byId.has(failure.id) ? titleOf(byId.get(failure.id)) : undefined,
  }));
}

/**
 * Construit la liste d'actions d'une page.
 *
 * Le nom vient du TYPE (voir CONTENT_NOUNS) : le recopier à l'appel serait la
 * troisième occasion d'écrire un nombre mal accordé.
 *
 * @param {object}   options
 * @param {'lesson'|'module'|'exercise'} options.type
 * @param {string}   options.token
 * @param {(row: object) => string} options.titleOf  de quoi nommer un échec
 * @param {boolean}  options.withTier    le palier existe-t-il pour ce type
 * @param {boolean}  options.withTierInherit  « hérite de la leçon » (exercices)
 */
export function buildContentBulkActions({
  type, token, titleOf, withTier, withTierInherit = false,
}) {
  const noun = CONTENT_NOUNS[type];
  const statusActions = STATUS_ACTIONS.map((action) => ({
    key: `status:${action.status}`,
    label: t(action.labelKey),
    tone: action.tone,
    // Une leçon recopie son état sur tous ses محاور (cascade serveur) : le
    // dialogue le dit, quel que soit l'état choisi.
    confirm: type === 'lesson'
      ? {
        ...action.confirm,
        message: (count, c) => (
          <>
            {action.confirm.message(count, c)}
            <p className="mt-2">{t('bulk.cascadeModules', { status: t(`status.${action.status}`) })}</p>
          </>
        ),
      }
      : action.confirm,
    runningLabel: (count) => t('bulk.running', { action: t(action.labelKey), counted: countedObj(count, noun) }),
    successLabel: (n) => t('bulk.successStatus', { count: n, counted: counted(n, noun), status: t(`status.${action.status}`) }),
    // Tout masquer quand tout est déjà masqué ne ferait qu'un rapport
    // « 25 déjà dans cet état » : on le dit avant, pas après.
    disabledReason: (rows) => (rows.length > 0 && rows.every((row) => row.publicationStatus === action.status)
      ? t('bulk.alreadyStatus', { status: t(`status.${action.status}`) })
      : null),
    run: async (rows) => {
      const outcome = await bulkChangeContentStatus(token, type, rows.map((row) => row.id), action.status);
      return { ...outcome, failed: nameFailures(outcome.failed, rows, titleOf), patch: { publicationStatus: action.status } };
    },
  }));

  if (!withTier) return statusActions;

  const tierActions = [
    ...TIER_ACTIONS,
    ...(withTierInherit ? [TIER_INHERIT_ACTION] : []),
  ].map((action) => ({
    key: `tier:${action.tier}`,
    label: t(action.labelKey),
    tone: action.tone,
    confirm: action.confirm,
    runningLabel: (count) => t('bulk.running', { action: t(action.labelKey), counted: countedObj(count, noun) }),
    successLabel: (n) => (action.tier === null
      ? t('bulk.successInherit', { count: n, counted: counted(n, noun) })
      : t('bulk.successStatus', { count: n, counted: counted(n, noun), status: t(`status.${action.tier}`) })),
    // `?? null` : un exercice qui hérite porte `tier: null`, et `undefined`
    // (champ absent) doit compter comme la même chose — sinon « Hériter »
    // resterait actif sur une sélection qui hérite déjà.
    disabledReason: (rows) => (rows.length > 0 && rows.every((row) => (row.tier ?? null) === action.tier)
      ? (action.tier === null
        ? t('bulk.alreadyInherit')
        : t('bulk.alreadyStatus', { status: t(`status.${action.tier}`) }))
      : null),
    run: async (rows) => {
      const outcome = await bulkChangeContentTier(token, type, rows.map((row) => row.id), action.tier);
      return { ...outcome, failed: nameFailures(outcome.failed, rows, titleOf), patch: { tier: action.tier } };
    },
  }));

  return [...statusActions, ...tierActions];
}
