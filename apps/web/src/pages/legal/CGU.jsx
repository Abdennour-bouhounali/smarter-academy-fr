import { Link } from 'react-router-dom';
import LegalPage, {
  LegalSection,
  LegalSubheading,
  LegalParagraph,
  LegalList,
  LegalCallout,
} from './LegalPage';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

/**
 * CONDITIONS GÉNÉRALES D'UTILISATION.
 *
 * Ce texte décrit le service TEL QU'IL EST. Toute clause qui décrirait une
 * fonctionnalité inexistante (offre mensuelle, période d'essai, quota,
 * suppression en libre-service) serait un engagement invérifiable : elle n'a
 * pas sa place ici.
 *
 * Version affichée : elle doit correspondre à `terms_version` dans
 * apps/api/config/legal.php. Modifier le fond de cette page impose d'y faire
 * évoluer la date — sans quoi on change ce que les élèves sont réputés avoir
 * accepté.
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

function A({ to, children }) {
  return (
    <Link to={to} className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
      {children}
    </Link>
  );
}

export default function CGUPage() {
  useDocumentMeta(
    'Conditions générales d’utilisation',
    'Les règles d’utilisation de Smarter Academy : compte, offre gratuite, abonnement Premium annuel, paiement, résiliation et droits applicables.'
  );

  return (
    <LegalPage
      eyebrow="Conditions générales"
      title="Conditions générales d’utilisation"
      intro="Ces conditions définissent les règles d’accès et d’utilisation de la plateforme Smarter Academy. En créant un compte, vous les acceptez."
      updatedAt={UPDATED_AT}
    >
      <LegalSection id="objet" number="1" title="Objet">
        <LegalParagraph>
          Les présentes conditions générales d’utilisation (les « CGU ») régissent l’accès et
          l’utilisation de la plateforme Smarter Academy, accessible à l’adresse
          smarter-academy.fr, éditée par Abdennour Abdennour, entrepreneur individuel (voir les{' '}
          <A to="/mentions-legales">mentions légales</A>).
        </LegalParagraph>
        <LegalParagraph>
          Elles constituent le contrat entre l’éditeur, ci-après « nous », et toute personne qui
          crée un compte ou utilise le service, ci-après « vous » ou « l’élève ». La création d’un
          compte vaut acceptation pleine et entière des CGU dans leur version en vigueur, dont la
          date figure en haut de cette page.
        </LegalParagraph>
        <LegalParagraph>
          Le traitement des données personnelles est décrit dans un document distinct : la{' '}
          <A to="/confidentialite">politique de confidentialité</A>, qui fait partie intégrante de
          l’accord.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="service" number="2" title="Description du service">
        <LegalParagraph>
          Smarter Academy est une plateforme d’apprentissage des mathématiques destinée aux élèves
          du collège et du lycée. Elle propose :
        </LegalParagraph>
        <LegalList>
          <li>
            des leçons interactives organisées par niveau et par domaine du programme, dans
            lesquelles l’élève manipule des figures et des modèles plutôt que de lire un cours ;
          </li>
          <li>des exercices avec correction, indices et vérification des réponses ;</li>
          <li>
            un suivi de progression : avancement par leçon, scores, maîtrise par point
            d’apprentissage, sessions de diagnostic ;
          </li>
          <li>un carnet de notes personnelles ;</li>
          <li>
            un bouton de signalement permettant de nous remonter une erreur dans un énoncé ou un
            dysfonctionnement.
          </li>
        </LegalList>
        <LegalParagraph>
          Le service est fourni en ligne, sans installation, depuis un navigateur récent et une
          connexion internet, qui restent à votre charge. Il évolue de façon continue : des leçons,
          des niveaux et des fonctionnalités peuvent être ajoutés, modifiés ou retirés.
        </LegalParagraph>
        <LegalParagraph>
          Smarter Academy est un outil de travail complémentaire. Il ne constitue ni un
          établissement d’enseignement, ni un service de soutien scolaire individualisé, ni une
          préparation garantissant un résultat à un examen.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="inscription" number="3" title="Inscription et compte">
        <LegalParagraph>
          L’accès aux contenus suppose la création d’un compte. Elle se fait soit par adresse e-mail
          et mot de passe, soit par « Continuer avec Google ». Dans ce second cas, Google nous
          transmet un identifiant stable et votre adresse e-mail ; aucun mot de passe n’est alors
          créé chez nous.
        </LegalParagraph>
        <LegalParagraph>
          Vous vous engagez à fournir des informations exactes, notamment une adresse e-mail
          valide : elle sert à vérifier le compte et à vous contacter. Un lien de vérification,
          signé et à durée limitée, vous est envoyé.
        </LegalParagraph>
        <LegalSubheading>Confidentialité des identifiants</LegalSubheading>
        <LegalParagraph>
          Le compte est strictement personnel. Vous êtes responsable de la confidentialité de vos
          identifiants et de toute activité réalisée depuis votre compte. Le partage d’un compte
          entre plusieurs élèves est interdit. Si vous suspectez un accès non autorisé,
          prévenez-nous à <Mail />.
        </LegalParagraph>
        <LegalCallout tone="amber" title="Mot de passe oublié">
          <p>
            La réinitialisation autonome du mot de passe n’est pas disponible à ce jour. Si vous
            perdez l’accès à votre compte, écrivez-nous à <Mail /> depuis l’adresse e-mail associée
            au compte.
          </p>
        </LegalCallout>
      </LegalSection>

      <LegalSection id="public" number="4" title="Conditions d’accès et public concerné">
        <LegalParagraph>
          Le service s’adresse aux élèves du collège et du lycée, ainsi qu’à toute personne
          souhaitant travailler les mathématiques de ces niveaux. L’élève crée lui-même son compte.
        </LegalParagraph>
        <LegalCallout tone="indigo" title="Le même enseignement pour tous">
          <p>
            Un élève mineur et un élève majeur disposent exactement du{' '}
            <strong>même service pédagogique</strong> : les mêmes leçons, les mêmes exercices, la
            même progression, la même interface et les mêmes fonctionnalités. L’âge ne restreint
            aucun contenu et ne modifie en rien l’expérience d’apprentissage.
          </p>
          <p>
            Les précisions qui suivent sont d’ordre <strong>juridique</strong> — protection des
            données et capacité à contracter — et non pédagogique.
          </p>
        </LegalCallout>
        <LegalSubheading>Usage interdit</LegalSubheading>
        <LegalParagraph>Sont notamment proscrits :</LegalParagraph>
        <LegalList>
          <li>
            l’extraction ou la copie massive, manuelle ou automatisée, des leçons et des exercices ;
          </li>
          <li>
            toute tentative de contourner les contrôles d’accès, notamment ceux qui distinguent les
            contenus gratuits des contenus Premium ;
          </li>
          <li>
            toute action de nature à perturber le fonctionnement du service ou à en dégrader la
            sécurité ;
          </li>
          <li>
            l’utilisation du carnet de notes ou du formulaire de signalement pour publier des
            contenus illicites, injurieux ou sans rapport avec le travail scolaire.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="mineurs" number="4 bis" title="Élèves mineurs">
        <LegalParagraph>
          Smarter Academy est conçue pour des élèves du collège et du lycée : la plupart de ses
          utilisateurs sont mineurs. Cette section précise ce que cela change — et, surtout, ce que
          cela ne change pas.
        </LegalParagraph>

        <LegalSubheading>Ce qui ne change pas : l’apprentissage</LegalSubheading>
        <LegalParagraph>
          Aucune restriction pédagogique n’est liée à l’âge. Il n’existe ni interface réduite, ni
          parcours distinct, ni tableau de bord parental, ni compte « surveillé ». Un élève mineur
          travaille exactement comme n’importe quel autre utilisateur.
        </LegalParagraph>

        <LegalSubheading>Protection des données : moins de 15 ans</LegalSubheading>
        <LegalParagraph>
          Pour les traitements qui reposent sur le consentement, le droit français fixe à quinze ans
          l’âge à partir duquel un mineur peut consentir seul. En deçà, le consentement doit être
          donné conjointement avec le titulaire de l’autorité parentale. L’inscription d’un élève de
          moins de quinze ans{' '}
          <strong>doit donc être réalisée ou expressément autorisée par son représentant légal</strong>
          , qui accepte alors les présentes CGU en son nom.
        </LegalParagraph>

        <LegalCallout tone="amber" title="Ce que la plateforme ne fait pas">
          <p>
            Smarter Academy ne met en œuvre <strong>aucun dispositif technique de vérification de
            l’âge</strong>, ne collecte pas de date de naissance à cette fin, et n’implémente{' '}
            <strong>aucun recueil automatisé du consentement parental</strong>. L’exigence énoncée
            ci-dessus est une règle qui s’impose à l’utilisateur, non un contrôle effectué par la
            plateforme.
          </p>
          <p>
            Un représentant légal qui constate l’existence d’un compte créé par un enfant sans son
            autorisation peut écrire à <Mail /> pour en demander la suppression, ainsi que celle des
            données personnelles associées.
          </p>
        </LegalCallout>

        <LegalSubheading>Abonnement Premium : une situation différente</LegalSubheading>
        <LegalParagraph>
          L’abonnement Premium est un <strong>contrat payant</strong>, et souscrire un contrat
          suppose la capacité juridique de s’engager. Un élève mineur ne peut donc pas y souscrire
          seul : l’abonnement doit être autorisé par son représentant légal, qui en assume le
          paiement et demeure l’interlocuteur pour toute question de facturation, de résiliation ou
          de remboursement.
        </LegalParagraph>
        <LegalCallout tone="indigo" title="À retenir">
          <p>
            <strong>Apprentissage gratuit</strong> : la même expérience pour tout le monde, sans
            distinction d’âge.
          </p>
          <p>
            <strong>Contrat Premium</strong> : requiert l’autorisation du représentant légal lorsque
            l’élève est mineur.
          </p>
          <p>
            Il ne s’agit en aucun cas d’interdire le Premium aux mineurs, mais d’identifier qui
            s’engage contractuellement et qui paie.
          </p>
        </LegalCallout>
      </LegalSection>

      <LegalSection id="offres" number="5" title="Offre gratuite et Premium">
        <LegalSubheading>Le compte gratuit</LegalSubheading>
        <LegalParagraph>
          La création d’un compte est gratuite et{' '}
          <strong>ne demande aucune carte bancaire</strong>. Un compte gratuit donne accès à une
          partie des leçons et des exercices, ainsi qu’au suivi de progression correspondant.
        </LegalParagraph>
        <LegalSubheading>L’offre Premium</LegalSubheading>
        <LegalParagraph>
          Une seule offre payante est proposée : <strong>Premium annuel</strong>, au prix de{' '}
          <strong>35 € TTC par an</strong>. Elle ouvre l’accès à l’intégralité des contenus
          disponibles sur la plateforme, de la 6<sup>e</sup> à la Terminale, pour la durée de la
          période payée.
        </LegalParagraph>
        <LegalCallout tone="blue" title="Ce que l’offre n’est pas">
          <p>
            Il n’existe <strong>pas d’offre mensuelle</strong>, <strong>pas de période d’essai
            payante ou gratuite distincte</strong> du compte gratuit, et{' '}
            <strong>aucun quota</strong> limitant le nombre d’exercices. Le compte gratuit n’est pas
            un essai limité dans le temps : il n’expire pas.
          </p>
        </LegalCallout>
        <LegalParagraph>
          La répartition des contenus entre gratuit et Premium peut évoluer. Une telle évolution ne
          réduit pas l’accès déjà payé pendant la période en cours. Le détail des offres figure sur
          la page <A to="/tarifs">tarifs</A>.
        </LegalParagraph>
        <LegalParagraph>
          Le contrôle de l’accès aux contenus Premium est effectué par le serveur : un contenu non
          couvert par votre offre est refusé, et non simplement masqué.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="paiement" number="6" title="Paiement et abonnement">
        <LegalSubheading>Modalités</LegalSubheading>
        <LegalParagraph>
          Le paiement s’effectue en ligne, par carte bancaire, via <strong>Stripe Checkout</strong>.
          Les coordonnées bancaires sont saisies sur une page hébergée par Stripe :{' '}
          <strong>Smarter Academy ne stocke aucun numéro de carte</strong>. Nous ne conservons que
          des références d’abonnement et de paiement, ainsi que les montants correspondants.
        </LegalParagraph>
        <LegalParagraph>
          Le prix est indiqué toutes taxes comprises, en euros. L’abonnement est annuel et se
          reconduit d’année en année, à échéance, tant qu’il n’a pas été résilié.
        </LegalParagraph>
        <LegalCallout tone="blue" title="C’est le serveur qui ouvre l’accès">
          <p>
            L’accès Premium n’est pas ouvert par le retour de votre navigateur après le paiement,
            mais par une notification signée que Stripe adresse à notre serveur. L’activation peut
            donc prendre quelques instants après le règlement. Si l’accès n’est pas ouvert au bout
            de quelques minutes, écrivez-nous à <Mail />.
          </p>
        </LegalCallout>
        <LegalSubheading>Résiliation de l’abonnement</LegalSubheading>
        <LegalParagraph>
          Vous pouvez résilier à tout moment depuis votre espace abonnement, sans motif ni
          justificatif. La résiliation{' '}
          <strong>prend effet à la fin de la période déjà payée</strong> : vous conservez l’accès
          Premium jusqu’à ce terme, et l’abonnement n’est pas reconduit ensuite. Aucun
          remboursement au prorata n’est effectué pour la période en cours.
        </LegalParagraph>
        <LegalParagraph>
          Tant que ce terme n’est pas atteint, vous pouvez <strong>reprendre</strong> votre
          abonnement depuis le même espace : la reconduction est alors rétablie et aucun nouveau
          paiement immédiat n’est déclenché.
        </LegalParagraph>
        <LegalSubheading>Défaut de paiement</LegalSubheading>
        <LegalParagraph>
          En cas d’échec du prélèvement à l’échéance, l’accès Premium peut être suspendu jusqu’à
          régularisation. Le compte et la progression sont conservés : ils redeviennent accessibles
          dans les limites de l’offre gratuite.
        </LegalParagraph>
        <LegalSubheading>Évolution du prix</LegalSubheading>
        <LegalParagraph>
          Le prix peut être modifié pour l’avenir. Toute modification vous est communiquée avant son
          application à votre abonnement, et vous laisse la possibilité de résilier avant la
          prochaine échéance. Elle n’affecte jamais une période déjà payée.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="retractation" number="7" title="Droit de rétractation">
        <LegalParagraph>
          Le consommateur dispose en principe d’un délai de quatorze (14) jours pour se rétracter
          d’un contrat conclu à distance, conformément à l’article L. 221-18 du code de la
          consommation.
        </LegalParagraph>
        <LegalParagraph>
          L’accès Premium est ouvert dès la confirmation du paiement, sans attendre l’expiration de
          ce délai — c’est ce que l’on attend d’un service d’apprentissage. Cette mise à disposition
          immédiate ne vous prive pas de votre droit de rétractation.
        </LegalParagraph>
        <LegalCallout tone="indigo" title="Votre droit de rétractation s’applique">
          <p>
            Vous disposez de <strong>quatorze jours</strong> à compter de la souscription pour
            changer d’avis, sans avoir à vous justifier ni à supporter de pénalité. Il suffit de
            nous écrire à <Mail /> en indiquant votre demande.
          </p>
          <p>
            Le remboursement intervient dans les meilleurs délais après réception de votre demande,
            par le même moyen de paiement que celui employé lors de la souscription.
          </p>
        </LegalCallout>
        <LegalParagraph>
          L’exception prévue à l’article L. 221-28 13° du code de la consommation pour les contenus
          numériques pleinement exécutés n’est pas opposée : elle supposerait le recueil préalable
          et explicite de votre renoncement, que la plateforme ne met pas en œuvre. Passé le délai
          de quatorze jours, la résiliation reste possible à tout moment et prend effet au terme de
          la période déjà payée (voir l’article 6).
        </LegalParagraph>
        <LegalParagraph>
          Ces dispositions ne font obstacle ni aux garanties légales, ni au remboursement en cas de
          défaut du service imputable à l’éditeur.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="propriete" number="8" title="Propriété intellectuelle">
        <LegalParagraph>
          L’ensemble des contenus de la plateforme — leçons, énoncés, corrections, figures
          interactives, illustrations, code source, interface, charte graphique et marque « Smarter
          Academy » — est protégé par le droit de la propriété intellectuelle et demeure la
          propriété de l’éditeur.
        </LegalParagraph>
        <LegalParagraph>
          L’inscription vous concède un droit d’usage <strong>personnel, non exclusif et non
          transférable</strong>, limité à la durée de votre compte et à un usage pédagogique et non
          commercial. Aucun autre droit ne vous est cédé.
        </LegalParagraph>
        <LegalParagraph>
          Sont notamment interdites, sauf autorisation écrite préalable, la reproduction, la
          diffusion, la revente, la mise en ligne et l’exploitation de tout ou partie des contenus,
          y compris par capture d’écran, par recopie d’énoncés ou par extraction automatisée de la
          base de leçons et d’exercices.
        </LegalParagraph>
        <LegalParagraph>
          Les notes personnelles que vous rédigez dans le carnet vous appartiennent. Vous nous
          concédez uniquement le droit technique de les stocker et de vous les restituer.
        </LegalParagraph>
        <LegalParagraph>
          Les programmes scolaires officiels auxquels les contenus se réfèrent relèvent de leurs
          auteurs respectifs.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="qualite" number="9" title="Qualité des contenus">
        <LegalParagraph>
          Les contenus sont rédigés et relus avec soin, en référence aux programmes officiels en
          vigueur. Nous ne garantissons cependant pas qu’ils soient exempts de toute erreur, ni
          qu’ils correspondent en permanence à l’état le plus récent des programmes, ni aux
          attentes particulières d’un enseignant ou d’un établissement.
        </LegalParagraph>
        <LegalParagraph>
          Le service est fourni dans le cadre d’une obligation de moyens. Aucun résultat scolaire,
          aucune note et aucune réussite à un examen ne sont garantis : la progression dépend du
          travail de l’élève.
        </LegalParagraph>
        <LegalParagraph>
          Si vous repérez une erreur, utilisez le bouton « Signaler » présent dans les leçons : ce
          signalement nous transmet la catégorie du problème, votre remarque, le contexte de la
          leçon et un diagnostic technique limité (navigateur, système d’exploitation, taille
          d’écran, version de l’application). Les corrections sont apportées au fil de l’eau.
        </LegalParagraph>
        <LegalSubheading>Disponibilité</LegalSubheading>
        <LegalParagraph>
          Nous nous efforçons d’assurer la continuité du service sans nous y engager de façon
          permanente. L’accès peut être interrompu pour maintenance, mise à jour ou en cas
          d’incident technique, y compris chez notre hébergeur. Une interruption prolongée et
          imputable à l’éditeur peut donner lieu à une prolongation de l’abonnement d’une durée
          équivalente, sur demande adressée à <Mail />.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="donnees" number="10" title="Données personnelles">
        <LegalParagraph>
          Les données que vous nous confiez sont traitées conformément au Règlement général sur la
          protection des données. La nature des données collectées, les finalités poursuivies, les
          bases légales, les durées de conservation et les modalités d’exercice de vos droits sont
          décrites dans la <A to="/confidentialite">politique de confidentialité</A>.
        </LegalParagraph>
        <LegalParagraph>
          En synthèse : nous ne collectons que ce qui est nécessaire au fonctionnement du compte et
          de la progression, nous n’utilisons ni traceur publicitaire ni mesure d’audience tierce,
          nous ne conservons aucun numéro de carte bancaire, et nous ne vendons ni ne cédons vos
          données.
        </LegalParagraph>
        <LegalParagraph>
          Vos demandes d’accès, de rectification, d’effacement, de portabilité, d’opposition ou de
          limitation s’adressent à <Mail />. Elles sont traitées manuellement, dans le délai d’un
          mois prévu par la réglementation.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="modification" number="11" title="Modification des CGU">
        <LegalParagraph>
          Nous pouvons modifier les présentes CGU, notamment pour tenir compte de l’évolution du
          service ou de la réglementation. Chaque version porte une date, affichée en haut de cette
          page. C’est cette version que le serveur enregistre lorsque vous acceptez le document :
          les acceptations déjà recueillies conservent leur version d’origine, de sorte qu’il est
          toujours possible de savoir quel texte précis chacun a accepté.
        </LegalParagraph>
        <LegalParagraph>
          En cas de modification substantielle, vous en êtes informé lors de votre prochaine
          connexion ou par courriel, et il peut vous être demandé d’accepter la nouvelle version.
          Si vous refusez, vous pouvez cesser d’utiliser le service et demander la suppression de
          votre compte. Une modification des CGU n’a pas d’effet rétroactif sur une période
          d’abonnement déjà payée.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="resiliation" number="12" title="Résiliation et suppression du compte">
        <LegalSubheading>À votre initiative</LegalSubheading>
        <LegalParagraph>
          Vous pouvez cesser d’utiliser le service à tout moment. La résiliation d’un abonnement
          Premium s’effectue depuis votre espace abonnement et prend effet à la fin de la période
          payée (article 6).
        </LegalParagraph>
        <LegalCallout tone="amber" title="La suppression du compte se demande par courriel">
          <p>
            La suppression d’un compte n’est <strong>pas disponible en libre-service</strong>.
            Adressez votre demande à <Mail /> depuis l’adresse e-mail associée au compte : elle est
            traitée manuellement, dans le délai d’un mois prévu par le RGPD. Certaines données
            doivent être conservées au-delà, au titre de nos obligations légales, notamment
            comptables — voir les durées de conservation dans la{' '}
            <A to="/confidentialite">politique de confidentialité</A>.
          </p>
        </LegalCallout>
        <LegalParagraph>
          La suppression du compte entraîne la perte de la progression, des scores et des notes du
          carnet. Elle est irréversible.
        </LegalParagraph>
        <LegalSubheading>À notre initiative</LegalSubheading>
        <LegalParagraph>
          En cas de manquement grave aux présentes CGU — partage d’identifiants, extraction massive
          de contenus, tentative de contournement des contrôles d’accès, atteinte à la sécurité du
          service, contenus illicites — un administrateur peut suspendre ou désactiver le compte.
          Sauf urgence ou illicéité manifeste, un avertissement préalable vous est adressé et vous
          êtes mis en mesure de présenter vos observations.
        </LegalParagraph>
        <LegalParagraph>
          En cas de désactivation d’un compte Premium pour un manquement qui vous est imputable,
          aucun remboursement n’est dû. Si l’éditeur met fin au service dans son ensemble, la part
          d’abonnement non courue est remboursée au prorata.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="droit" number="13" title="Droit applicable et règlement des litiges">
        <LegalParagraph>
          Les présentes CGU sont soumises au <strong>droit français</strong>. Elles sont rédigées en
          français, seule version faisant foi.
        </LegalParagraph>
        <LegalParagraph>
          En cas de difficulté, adressez-nous d’abord une réclamation à <Mail /> : la grande majorité
          des différends se règlent ainsi.
        </LegalParagraph>
        <LegalSubheading>Médiation de la consommation</LegalSubheading>
        <LegalParagraph>
          Conformément aux articles L. 611-1 et suivants du code de la consommation, tout
          consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue
          de la résolution amiable d’un litige qui l’oppose à un professionnel, après avoir tenté
          une résolution directe par une réclamation écrite.
        </LegalParagraph>
        <LegalParagraph>
          Les coordonnées du médiateur compétent sont communiquées sur simple demande adressée à{' '}
          <Mail />, et seront publiées ici dès leur désignation.
        </LegalParagraph>
        <LegalSubheading>Juridiction</LegalSubheading>
        <LegalParagraph>
          À défaut d’accord amiable, le litige est porté devant les juridictions françaises
          compétentes selon les règles de droit commun. Il est rappelé que le consommateur peut
          saisir, à son choix, la juridiction du lieu où il demeurait au moment de la conclusion du
          contrat ou de la survenance du fait dommageable, ou celle du lieu du domicile du
          défendeur.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="contact" number="14" title="Contact">
        <LegalParagraph>
          Pour toute question relative aux présentes conditions, à votre compte ou à votre
          abonnement :
        </LegalParagraph>
        <LegalList>
          <li>
            Courriel : <Mail />
          </li>
          <li>
            Formulaire : <A to="/contact">page contact</A>
          </li>
          <li>Courrier : Abdennour Abdennour, 54 rue des Roseaux, 31400 Toulouse, France</li>
        </LegalList>
        <LegalParagraph>
          Voir également la <A to="/confidentialite">politique de confidentialité</A> et les{' '}
          <A to="/mentions-legales">mentions légales</A>.
        </LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}
