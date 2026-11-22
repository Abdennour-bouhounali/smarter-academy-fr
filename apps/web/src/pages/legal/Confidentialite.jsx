import { Link } from 'react-router-dom';
import LegalPage, {
  LegalSection,
  LegalSubheading,
  LegalParagraph,
  LegalList,
  LegalCallout,
  LegalTable,
} from './LegalPage';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

/**
 * POLITIQUE DE CONFIDENTIALITÉ.
 *
 * Règle d'écriture de cette page : n'y figure QUE ce que le code fait
 * réellement. Une politique qui promet un export automatisé, une purge
 * planifiée ou un recueil du consentement parental alors que rien de tel
 * n'est implémenté n'est pas une protection : c'est un engagement qu'on ne
 * tient pas. Les manques sont donc écrits comme des manques.
 *
 * Version affichée : elle doit correspondre à `privacy_version` dans
 * apps/api/config/legal.php. Modifier le fond de cette page sans faire
 * évoluer cette date reviendrait à changer ce que les élèves sont réputés
 * avoir accepté.
 */

const EMAIL = 'contact@smarter-academy.fr';
const UPDATED_AT = '12 septembre 2026';

function Mail() {
  return (
    <a
      href={`mailto:${EMAIL}`}
      className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
    >
      {EMAIL}
    </a>
  );
}

const DATA_ROWS = [
  [
    'Adresse e-mail, mot de passe (haché), prénom et nom (facultatifs), classe',
    'Créer et identifier le compte, permettre la connexion, adapter les contenus au niveau scolaire',
    'Exécution du contrat (CGU)',
  ],
  [
    'Statut du compte, date de dernière activité, date de vérification de l’adresse e-mail',
    'Assurer le bon fonctionnement du compte, vérifier l’adresse, prévenir les abus',
    'Exécution du contrat et intérêt légitime (sécurité du service)',
  ],
  [
    'Versions des CGU et de la politique de confidentialité acceptées, date du consentement',
    'Prouver quel texte précis a été accepté, et à quelle date',
    'Obligation légale (preuve du consentement) et intérêt légitime',
  ],
  [
    'Compte Google : identifiant stable fourni par Google (« sub »), adresse e-mail transmise par Google',
    'Permettre la connexion via « Continuer avec Google » et rattacher la connexion au bon compte',
    'Exécution du contrat, à la demande de l’utilisateur',
  ],
  [
    'Progression par leçon, tentatives d’exercices, réponses saisies, indices demandés, scores, maîtrise par point d’apprentissage, sessions de diagnostic',
    'Fournir le service pédagogique : reprendre là où l’élève s’est arrêté, adapter la difficulté, restituer sa progression',
    'Exécution du contrat (CGU)',
  ],
  [
    'Notes personnelles rédigées dans le carnet',
    'Conserver et restituer les notes que l’élève écrit lui-même',
    'Exécution du contrat (CGU)',
  ],
  [
    'Abonnement et paiements : références Stripe (client, abonnement, paiement), plan, statut, dates de période, montants',
    'Gérer l’abonnement Premium, ouvrir ou fermer l’accès, assurer le suivi comptable',
    'Exécution du contrat et obligation légale (comptabilité)',
  ],
  [
    'Signalements : catégorie, note écrite par l’élève, contexte de la leçon, et diagnostic technique limité au navigateur, au système d’exploitation, à la taille d’écran et à la version de l’application',
    'Corriger une erreur de contenu ou reproduire un dysfonctionnement',
    'Intérêt légitime (qualité et correction du service)',
  ],
  [
    'Messages envoyés via le formulaire de contact',
    'Répondre à la demande',
    'Intérêt légitime (répondre à une sollicitation)',
  ],
];

/**
 * LES DURÉES DE CONSERVATION.
 *
 * Ce tableau énonce une POLITIQUE, pas un comportement du logiciel : aucune
 * tâche planifiée n'existe dans l'application (ni cron, ni purge, ni
 * `schedule`). L'encadré qui suit le tableau le dit explicitement à
 * l'utilisateur — le taire ferait de chaque ligne une promesse non tenue.
 *
 * Toute automatisation ultérieure devra faire correspondre le code À CE
 * TABLEAU, et non l'inverse.
 */
const RETENTION_ROWS = [
  [
    'Compte et données de profil',
    'Conservés tant que le compte existe. Après une demande de suppression, effacement sous 30 jours',
  ],
  [
    'Progression, réponses et scores — compte gratuit',
    'Historique glissant de 30 jours pour le détail des tentatives ; la progression consolidée suit la durée de vie du compte',
  ],
  [
    'Progression, réponses et scores — compte Premium',
    'Conservés sans limite pendant l’abonnement, puis 90 jours après sa résiliation',
  ],
  [
    'Notes du carnet',
    'Conservées tant que le compte existe ; supprimées avec lui',
  ],
  [
    'Preuve du consentement (documents acceptés, versions et date)',
    'Conservée tant que le compte existe, puis archivée le temps nécessaire à la preuve',
  ],
  [
    'Journaux d’authentification et de sécurité',
    '12 mois',
  ],
  [
    'Références d’abonnement et de paiement, montants',
    '5 ans, au titre des obligations comptables et fiscales',
  ],
  ['Signalements', 'Jusqu’à 24 mois après traitement'],
  ['Messages du formulaire de contact', 'Jusqu’à 24 mois après le dernier échange'],
];

export default function ConfidentialitePage() {
  useDocumentMeta(
    'Politique de confidentialité',
    'Quelles données Smarter Academy collecte, pourquoi, combien de temps elles sont conservées, et comment exercer vos droits.'
  );

  return (
    <LegalPage
      eyebrow="Données personnelles"
      title="Politique de confidentialité"
      intro="Ce document décrit les données que Smarter Academy collecte, les raisons pour lesquelles elle les collecte, la durée pendant laquelle elle les conserve, et les droits dont vous disposez. Il ne décrit que ce que la plateforme fait réellement."
      updatedAt={UPDATED_AT}
    >
      <LegalCallout tone="blue" title="En résumé">
        <p>
          Nous collectons ce qui est nécessaire pour faire fonctionner un compte et une
          progression pédagogique. Nous n’utilisons aucun traceur publicitaire, aucune mesure
          d’audience tierce, et nous ne vendons ni ne cédons vos données. Nous ne conservons aucun
          numéro de carte bancaire : le paiement est traité par Stripe.
        </p>
      </LegalCallout>

      <LegalSection id="responsable" number="1" title="Responsable du traitement">
        <LegalParagraph>
          Le responsable du traitement des données collectées sur smarter-academy.fr est :
        </LegalParagraph>
        <div className="glass-card p-6 sm:p-7">
          <p className="font-space font-bold text-slate-900 text-lg mb-3">Abdennour Abdennour</p>
          <ul className="font-inter text-slate-600 text-base leading-relaxed space-y-1">
            <li>Entrepreneur individuel — SIREN 937795003</li>
            <li>54 rue des Roseaux, 31400 Toulouse, France</li>
            <li>
              Contact : <Mail />
            </li>
          </ul>
        </div>
        <LegalParagraph>
          Compte tenu de la taille et de la nature de l’activité, aucun délégué à la protection des
          données (DPO) n’a été désigné. Toutes les demandes relatives aux données personnelles
          sont traitées directement par le responsable du traitement, à l’adresse ci-dessus.
        </LegalParagraph>
        <LegalParagraph>
          Les mentions d’identification complètes figurent sur la page{' '}
          <Link
            to="/mentions-legales"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            mentions légales
          </Link>
          .
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="donnees" number="2" title="Données collectées et finalités">
        <LegalParagraph>
          Le tableau ci-dessous recense l’ensemble des catégories de données traitées, la raison
          pour laquelle elles le sont, et la base légale correspondante au sens du RGPD.
        </LegalParagraph>
        <LegalTable headers={['Données', 'Finalité', 'Base légale']} rows={DATA_ROWS} />

        <LegalCallout tone="amber" title="Ce que nous ne collectons pas">
          <p>
            La plateforme n’enregistre <strong>pas</strong> votre adresse IP, ni votre identifiant
            de navigateur complet (« User-Agent »), ni de données de géolocalisation, ni de données
            bancaires, ni aucune donnée issue d’un traceur publicitaire. Les signalements
            techniques sont volontairement réduits au strict nécessaire pour reproduire un
            problème.
          </p>
        </LegalCallout>

        <LegalSubheading>Origine des données</LegalSubheading>
        <LegalParagraph>
          Les données proviennent de l’élève lui-même — ce qu’il saisit à l’inscription et ce qu’il
          produit en travaillant sur la plateforme — à deux exceptions près : l’identifiant et
          l’adresse e-mail transmis par Google lorsqu’il choisit « Continuer avec Google », et les
          informations d’abonnement transmises par Stripe après un paiement.
        </LegalParagraph>

        <LegalSubheading>Absence de décision automatisée</LegalSubheading>
        <LegalParagraph>
          Les scores et le niveau de maîtrise servent uniquement à adapter les contenus proposés à
          l’élève. Ils ne produisent aucune décision ayant un effet juridique, ne sont communiqués à
          aucun établissement scolaire et ne font l’objet d’aucun profilage à des fins publicitaires
          ou commerciales.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="stripe" number="3" title="Paiement : Stripe">
        <LegalParagraph>
          Le paiement de l’abonnement Premium est traité par <strong>Stripe</strong>, prestataire de
          services de paiement, agissant comme sous-traitant puis comme responsable de traitement
          pour ses propres obligations (lutte contre la fraude, obligations financières).
        </LegalParagraph>
        <LegalCallout tone="blue" title="Aucun numéro de carte ne transite par nos serveurs">
          <p>
            Les coordonnées bancaires sont saisies sur une page hébergée par Stripe, sur le domaine
            de Stripe. Smarter Academy ne les voit jamais et n’en conserve aucune. Nous ne stockons
            que des <strong>références</strong> — identifiants de client, d’abonnement et de
            paiement Stripe — ainsi que le plan, le statut, les dates de période et les montants.
          </p>
        </LegalCallout>
        <LegalParagraph>
          L’ouverture de l’accès Premium repose sur une notification signée envoyée par Stripe à
          notre serveur, et non sur le retour du navigateur : c’est le serveur qui fait autorité sur
          l’accès. Les données que vous confiez à Stripe sont régies par la politique de
          confidentialité de Stripe.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="hebergement" number="4" title="Hébergement">
        <LegalParagraph>
          Le site, l’application et la base de données sont hébergés par{' '}
          <strong>Hostinger International Ltd</strong> (61 Lordou Vironos Street, 6023 Larnaca,
          Chypre), sur le serveur <span className="font-mono-jetbrains">server2120</span>.
        </LegalParagraph>
        <LegalList>
          <li>Hébergement des données : France / Union européenne.</li>
          <li>Sauvegardes : Lituanie, également dans l’Union européenne.</li>
        </LegalList>
        <LegalParagraph>
          L’hébergeur agit en qualité de sous-traitant et n’accède pas aux données pour son propre
          compte.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="cookies" number="5" title="Cookies et stockage local">
        <LegalParagraph>
          Smarter Academy n’utilise <strong>aucun cookie publicitaire</strong>,{' '}
          <strong>aucun traceur tiers</strong> et <strong>aucun outil de mesure d’audience
          tiers</strong>. Aucune bannière de consentement n’est donc affichée, car aucun traitement
          ne l’exigerait.
        </LegalParagraph>
        <LegalSubheading>Stockage local du navigateur</LegalSubheading>
        <LegalParagraph>
          L’application est une application monopage : elle conserve votre jeton de session dans le{' '}
          <span className="font-mono-jetbrains">localStorage</span> de votre navigateur, et non dans
          un cookie. Ce stockage sert uniquement à vous maintenir connecté et à conserver quelques
          préférences d’affichage ainsi que l’avancement local dans une leçon. Il reste sur votre
          appareil et peut être effacé à tout moment en vidant les données du site depuis votre
          navigateur — vous serez alors déconnecté.
        </LegalParagraph>
        <LegalSubheading>Cookie technique du serveur</LegalSubheading>
        <LegalParagraph>
          Le serveur applicatif peut déposer un cookie de session strictement technique, nécessaire
          au fonctionnement du service. Il ne sert à aucun suivi et est dispensé de consentement.
        </LegalParagraph>
        <LegalSubheading>Cookies de Stripe</LegalSubheading>
        <LegalParagraph>
          Lorsque vous êtes redirigé vers la page de paiement de Stripe, Stripe dépose ses propres
          cookies, sur son propre domaine, notamment à des fins de sécurité et de lutte contre la
          fraude. Ces cookies relèvent de Stripe et de sa politique de confidentialité, et non de la
          nôtre.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="conservation" number="6" title="Durées de conservation">
        <LegalTable headers={['Données', 'Durée de conservation']} rows={RETENTION_ROWS} />
        <LegalCallout tone="amber" title="Une politique documentée, appliquée manuellement">
          <p>
            Nous devons être francs sur ce point : les durées ci-dessus constituent la politique de
            conservation que nous nous imposons, mais{' '}
            <strong>
              aucun mécanisme de purge automatique n’est en place à ce jour
            </strong>
            . L’effacement et l’anonymisation sont réalisés <strong>manuellement</strong>, par
            l’éditeur, à réception d’une demande ou lors des revues périodiques du fichier. Une
            demande de suppression adressée à <Mail /> est donc traitée à la main, dans le délai
            d’un mois prévu par le RGPD.
          </p>
          <p>
            Les durées relatives à l’historique des exercices et aux journaux de sécurité décrivent
            l’objectif que nous nous fixons ; elles seront appliquées automatiquement lorsque le
            mécanisme correspondant sera en place. Nous préférons l’annoncer ainsi plutôt que de
            laisser croire à une purge qui n’a pas lieu.
          </p>
        </LegalCallout>
      </LegalSection>

      <LegalSection id="mineurs" number="6 bis" title="Élèves mineurs">
        <LegalParagraph>
          La plateforme s’adresse à des collégiens et à des lycéens : une grande partie de ses
          utilisateurs sont mineurs. Les données traitées sont{' '}
          <strong>exactement les mêmes</strong> que pour un utilisateur majeur — il n’existe ni
          collecte supplémentaire, ni profilage lié à l’âge, ni suivi particulier.
        </LegalParagraph>
        <LegalParagraph>
          Aucune date de naissance n’est demandée. La plateforme ne connaît donc pas l’âge de ses
          utilisateurs et ne met en œuvre <strong>aucun dispositif de vérification de l’âge</strong>.
        </LegalParagraph>

        <LegalSubheading>Consentement des moins de 15 ans</LegalSubheading>
        <LegalParagraph>
          Pour les traitements qui reposent sur le consentement, le droit français fixe à quinze ans
          l’âge à partir duquel un mineur peut consentir seul au traitement de ses données. En deçà,
          le consentement doit être donné conjointement avec le titulaire de l’autorité parentale :
          l’inscription d’un élève de moins de quinze ans doit être réalisée ou autorisée par son
          représentant légal.
        </LegalParagraph>
        <LegalCallout tone="amber" title="Aucun recueil automatisé du consentement parental">
          <p>
            Cette règle s’impose à l’utilisateur ; elle n’est pas contrôlée techniquement par la
            plateforme, qui n’implémente <strong>aucun formulaire de consentement parental</strong>,
            aucune adresse de parent et aucun compte « représentant légal ».
          </p>
          <p>
            Un représentant légal qui découvre un compte créé par son enfant sans son autorisation
            peut écrire à <Mail /> pour demander la suppression du compte et des données
            personnelles associées.
          </p>
        </LegalCallout>
        <LegalParagraph>
          Les droits décrits à l’article suivant (accès, rectification, effacement…) peuvent être
          exercés par le mineur lui-même ou par son représentant légal.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="droits" number="7" title="Vos droits">
        <LegalParagraph>
          Conformément au Règlement général sur la protection des données et à la loi
          « Informatique et Libertés », vous disposez des droits suivants :
        </LegalParagraph>
        <LegalList>
          <li>
            <strong>Droit d’accès</strong> — obtenir la confirmation que des données vous
            concernant sont traitées, et en recevoir une copie.
          </li>
          <li>
            <strong>Droit de rectification</strong> — faire corriger une donnée inexacte ou
            incomplète (adresse e-mail, prénom, classe).
          </li>
          <li>
            <strong>Droit à l’effacement</strong> — demander la suppression de votre compte et des
            données associées, sous réserve des données que nous devons conserver au titre d’une
            obligation légale, notamment comptable.
          </li>
          <li>
            <strong>Droit à la portabilité</strong> — recevoir les données que vous nous avez
            fournies dans un format structuré et lisible par machine.
          </li>
          <li>
            <strong>Droit d’opposition</strong> — vous opposer, pour des raisons tenant à votre
            situation particulière, aux traitements fondés sur notre intérêt légitime.
          </li>
          <li>
            <strong>Droit à la limitation</strong> — demander le gel d’un traitement pendant
            l’examen d’une contestation.
          </li>
          <li>
            <strong>Droit de définir des directives</strong> relatives au sort de vos données après
            votre décès.
          </li>
        </LegalList>

        <LegalSubheading>Comment les exercer</LegalSubheading>
        <LegalParagraph>
          Toutes ces demandes s’adressent par courriel à <Mail />, depuis l’adresse associée au
          compte. Une réponse vous est apportée dans un délai d’un mois, pouvant être prolongé de
          deux mois si la demande est complexe. Nous pouvons vous demander un élément permettant de
          vérifier votre identité en cas de doute raisonnable.
        </LegalParagraph>

        <LegalCallout tone="amber" title="Aucune de ces démarches n’est automatisée">
          <p>
            À ce jour, la plateforme ne propose <strong>ni export de données en libre-service</strong>
            , <strong>ni suppression de compte en libre-service</strong>. La portabilité et
            l’effacement sont traités manuellement, par courriel. Un administrateur peut par
            ailleurs suspendre ou désactiver un compte. La réinitialisation autonome du mot de passe
            n’est pas non plus disponible actuellement : écrivez-nous.
          </p>
        </LegalCallout>

        <LegalSubheading>Élèves mineurs</LegalSubheading>
        <LegalParagraph>
          La plateforme s’adresse aux élèves du collège et du lycée. En France, un mineur de moins
          de 15 ans ne peut pas consentir seul au traitement de ses données : le consentement doit
          être donné conjointement avec le titulaire de l’autorité parentale. L’inscription d’un
          élève de moins de 15 ans doit donc être réalisée ou autorisée par son représentant légal.
        </LegalParagraph>
        <LegalCallout tone="amber">
          <p>
            La plateforme ne met en œuvre <strong>aucun dispositif technique de vérification de
            l’âge ni de recueil du consentement parental</strong>. Un représentant légal qui
            constate l’inscription d’un enfant sans son accord peut en demander la suppression à{' '}
            <Mail /> ; elle sera traitée sans délai.
          </p>
        </LegalCallout>

        <LegalSubheading>Réclamation auprès de la CNIL</LegalSubheading>
        <LegalParagraph>
          Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous
          pouvez introduire une réclamation auprès de la Commission nationale de l’informatique et
          des libertés (CNIL), 3 place de Fontenoy — TSA 80715 — 75334 Paris Cedex 07, ou depuis son
          site cnil.fr.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="securite" number="8" title="Sécurité">
        <LegalParagraph>
          Les mesures suivantes sont effectivement en place :
        </LegalParagraph>
        <LegalList>
          <li>
            Chiffrement des échanges entre votre navigateur et nos serveurs (HTTPS / TLS).
          </li>
          <li>
            Mots de passe stockés sous forme de <strong>hachage</strong> (bcrypt) : ils ne sont
            jamais conservés en clair et ne peuvent pas être relus, y compris par nous. Un compte
            créé via Google n’a pas de mot de passe du tout.
          </li>
          <li>
            Authentification par jeton (Laravel Sanctum), révocable à la déconnexion.
          </li>
          <li>
            Limitation du nombre de tentatives sur l’inscription, la connexion, le renvoi de
            l’e-mail de vérification et les appels liés au paiement.
          </li>
          <li>
            Contrôle des droits d’accès <strong>côté serveur</strong> : un contenu Premium est
            refusé par le serveur lui-même, et pas seulement masqué dans l’interface.
          </li>
          <li>
            Vérification de la signature cryptographique des notifications envoyées par Stripe.
          </li>
          <li>
            Vérification de l’adresse e-mail par un lien signé et expirant.
          </li>
        </LegalList>
        <LegalParagraph>
          Aucun système n’est infaillible. En cas de violation de données susceptible d’engendrer un
          risque élevé pour vos droits, vous en serez informé conformément à l’article 34 du RGPD.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="transferts" number="9" title="Transferts hors Union européenne">
        <LegalParagraph>
          Les données de la plateforme sont hébergées dans l’Union européenne. Deux prestataires
          appellent néanmoins une précision :
        </LegalParagraph>
        <LegalList>
          <li>
            <strong>Hostinger</strong> (hébergement) — données stockées en France, sauvegardes en
            Lituanie : aucun transfert hors de l’Union européenne.
          </li>
          <li>
            <strong>Stripe</strong> (paiement) — les données de paiement sont susceptibles d’être
            traitées aux <strong>États-Unis</strong>. Ce transfert est encadré par les{' '}
            <strong>clauses contractuelles types</strong> adoptées par la Commission européenne,
            complétées par les mesures de sécurité propres à Stripe.
          </li>
          <li>
            <strong>Google</strong> — uniquement si vous choisissez « Continuer avec Google ». Nous
            ne transmettons aucune donnée à Google ; c’est Google qui nous transmet un identifiant
            et une adresse e-mail, dans le cadre que vous autorisez chez lui. Aucun jeton Google
            n’est conservé de notre côté.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="modifications" number="10" title="Modifications de cette politique">
        <LegalParagraph>
          Cette politique peut évoluer, notamment si le service change ou si un nouveau prestataire
          est introduit. Chaque version porte une date, affichée en haut de cette page, et cette date
          fait foi : c’est elle qui est enregistrée lorsque vous acceptez le document. Les
          consentements déjà recueillis conservent leur version d’origine, ce qui permet de savoir
          exactement quel texte chacun a accepté.
        </LegalParagraph>
        <LegalParagraph>
          En cas de modification substantielle, vous en serez informé lors de votre prochaine
          connexion ou par courriel.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="contact" number="11" title="Contact">
        <LegalParagraph>
          Pour toute question relative à cette politique ou à l’exercice de vos droits, écrivez à{' '}
          <Mail />, ou utilisez le{' '}
          <Link
            to="/contact"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            formulaire de contact
          </Link>
          . Courrier : Abdennour Abdennour, 54 rue des Roseaux, 31400 Toulouse, France.
        </LegalParagraph>
        <LegalParagraph>
          Voir également les{' '}
          <Link to="/cgu" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
            conditions générales d’utilisation
          </Link>{' '}
          et les{' '}
          <Link
            to="/mentions-legales"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            mentions légales
          </Link>
          .
        </LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}
