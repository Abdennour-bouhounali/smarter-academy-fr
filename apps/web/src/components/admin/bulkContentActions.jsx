import React from 'react';
import { STATUS_LABELS } from './ui/StatusBadge';
import { CONTENT_NOUNS, agree, countNoun } from './contentNouns';
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
 */

/** Les quatre états, tels que les propose déjà le menu unitaire. */
const STATUS_ACTIONS = [
  {
    status: 'published',
    label: 'Publier',
    tone: 'default',
    // Republier ne retire rien à personne : même asymétrie qu'à l'unité, où
    // PublicationControl applique « Publier » sans confirmation.
    confirm: {
      title: (count, counted) => `Publier ${counted} ?`,
      confirmLabel: (count, counted) => `Publier ${counted}`,
      message: (count, counted, noun) => (
        <p>
          {count === 1 ? 'Ce contenu deviendra' : `Ces ${counted} deviendront`}{' '}
          {agree('visible', count, false)} pour les élèves.
        </p>
      ),
    },
  },
  {
    status: 'hidden',
    label: 'Masquer',
    tone: 'danger',
    confirm: {
      title: (count, counted) => `Retirer ${counted} aux élèves ?`,
      confirmLabel: (count, counted) => `Masquer ${counted}`,
      message: (count, counted) => (
        <>
          <p>
            Les élèves n’auront plus accès à ces {counted}.{' '}
            <strong>Aucune donnée d’apprentissage n’est supprimée</strong> : les progressions et les
            tentatives déjà enregistrées sont conservées, et réapparaîtront si vous republiez.
          </p>
        </>
      ),
    },
  },
  {
    status: 'draft',
    label: 'Repasser en brouillon',
    tone: 'danger',
    confirm: {
      title: (count, counted) => `Repasser ${counted} en brouillon ?`,
      confirmLabel: (count, counted) => `Repasser ${counted} en brouillon`,
      message: (count, counted) => (
        <p>
          Les élèves n’auront plus accès à ces {counted}.{' '}
          <strong>Aucune donnée d’apprentissage n’est supprimée.</strong>
        </p>
      ),
    },
  },
  {
    status: 'archived',
    label: 'Archiver',
    tone: 'danger',
    confirm: {
      title: (count, counted) => `Archiver ${counted} ?`,
      confirmLabel: (count, counted) => `Archiver ${counted}`,
      message: (count, counted, noun) => (
        <>
          <p>
            Les élèves n’y auront plus accès.{' '}
            <strong>Aucune donnée d’apprentissage n’est supprimée</strong> : archiver n’est pas
            supprimer, et {counted} {count > 1 ? 'peuvent' : 'peut'} être{' '}
            {agree('republié', count, noun.feminine)} à tout moment.
          </p>
        </>
      ),
    },
  },
];

const TIER_ACTIONS = [
  {
    tier: 'free',
    label: 'Rendre gratuit',
    tone: 'default',
    // Ouvrir un accès ne se confirme pas — comme à l'unité.
    confirm: null,
  },
  {
    tier: 'premium',
    label: 'Rendre payant',
    tone: 'danger',
    confirm: {
      title: (count, counted, noun) => `Rendre ${counted} ${agree('payant', count, noun.feminine)} ?`,
      confirmLabel: (count, counted, noun) => `Rendre ${agree('payant', count, noun?.feminine ?? false)}`,
      message: (count, counted) => (
        <>
          <p>
            Les élèves <strong>sans abonnement</strong> n’auront plus accès à ces {counted}. Le
            contenu reste visible au catalogue, avec la mention « Premium ».
          </p>
          <p className="mt-2">
            <strong>Aucune donnée d’apprentissage n’est supprimée.</strong> L’état de publication
            n’est pas modifié.
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
  label: 'Hériter de la leçon',
  tone: 'default',
  confirm: {
    title: (count, counted) => `Aligner ${counted} sur leur leçon ?`,
    confirmLabel: (count, counted) => `Aligner ${counted}`,
    message: (count, counted) => (
      <>
        <p>
          Ces {counted} suivront désormais le palier de leur leçon : ils deviendront gratuits
          sous une leçon gratuite, payants sous une leçon payante.
        </p>
        <p className="mt-2">
          Les leçons concernées peuvent avoir des paliers différents : l’accès peut donc s’ouvrir
          pour certains et se fermer pour d’autres.{' '}
          <strong>Aucune donnée d’apprentissage n’est supprimée.</strong>
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
 * Le nom et le genre viennent du TYPE (voir CONTENT_NOUNS) : les recopier à
 * l'appel serait la troisième occasion d'écrire « 24 leçons sélectionnés ».
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
    label: action.label,
    tone: action.tone,
    confirm: action.confirm,
    runningLabel: (count) => `${action.label} — ${countNoun(count, noun)}…`,
    successLabel: (n) => `${countNoun(n, noun)} ${agree('passé', n, noun.feminine)} en « ${STATUS_LABELS[action.status]} ».`,
    // Tout masquer quand tout est déjà masqué ne ferait qu'un rapport
    // « 25 déjà dans cet état » : on le dit avant, pas après.
    disabledReason: (rows) => (rows.length > 0 && rows.every((row) => row.publicationStatus === action.status)
      ? `Déjà en « ${STATUS_LABELS[action.status]} ».`
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
    label: action.label,
    tone: action.tone,
    confirm: action.confirm,
    runningLabel: (count) => `${action.label} — ${countNoun(count, noun)}…`,
    successLabel: (n) => (action.tier === null
      ? `${countNoun(n, noun)} ${agree('aligné', n, noun.feminine)} sur le palier de leur leçon.`
      : `${countNoun(n, noun)} ${agree('passé', n, noun.feminine)} en « ${STATUS_LABELS[action.tier]} ».`),
    // `?? null` : un exercice qui hérite porte `tier: null`, et `undefined`
    // (champ absent) doit compter comme la même chose — sinon « Hériter »
    // resterait actif sur une sélection qui hérite déjà.
    disabledReason: (rows) => (rows.length > 0 && rows.every((row) => (row.tier ?? null) === action.tier)
      ? (action.tier === null
        ? 'Ces contenus héritent déjà de leur leçon.'
        : `Déjà en « ${STATUS_LABELS[action.tier]} ».`)
      : null),
    run: async (rows) => {
      const outcome = await bulkChangeContentTier(token, type, rows.map((row) => row.id), action.tier);
      return { ...outcome, failed: nameFailures(outcome.failed, rows, titleOf), patch: { tier: action.tier } };
    },
  }));

  return [...statusActions, ...tierActions];
}
