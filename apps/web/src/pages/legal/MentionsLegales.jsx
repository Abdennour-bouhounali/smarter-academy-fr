import { Link } from 'react-router-dom';
import LegalPage, {
  LegalSection,
  LegalParagraph,
  LegalList,
  LegalCallout,
} from './LegalPage';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

/**
 * MENTIONS LÉGALES — l'identité de l'éditeur et de l'hébergeur.
 *
 * Tout ce qui est affirmé ici est vérifiable dans le dépôt : l'éditeur vient
 * de config/legal.php, l'hébergeur de la configuration de déploiement. Aucun
 * prestataire qui ne serait pas réellement utilisé ne doit figurer sur cette
 * page — une mention inexacte est plus coûteuse qu'une mention absente.
 */

const EMAIL = 'contact@smarter-academy.fr';

export default function MentionsLegalesPage() {
  useDocumentMeta(
    'Mentions légales',
    'Éditeur, directeur de la publication, hébergeur et conditions d’utilisation du site Smarter Academy.'
  );

  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Mentions légales"
      intro="Les informations d’identification de l’éditeur et de l’hébergeur du site Smarter Academy, conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique."
    >
      <LegalSection id="editeur" title="Éditeur du site">
        <LegalParagraph>
          Le site Smarter Academy, accessible à l’adresse smarter-academy.fr, est édité par :
        </LegalParagraph>
        <div className="glass-card p-6 sm:p-7">
          <p className="font-space font-bold text-slate-900 text-lg mb-3">
            Abdennour Abdennour
          </p>
          <dl className="font-inter text-slate-600 text-base leading-relaxed space-y-1.5">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-400">Forme juridique :</dt>
              <dd>Entrepreneur individuel</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-400">SIREN :</dt>
              <dd className="font-mono-jetbrains">937795003</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-400">Code APE :</dt>
              <dd className="font-mono-jetbrains">85.59B</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-400">Immatriculation :</dt>
              <dd>Registre national des entreprises (RNE), le 31/08/2026</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-400">Siège :</dt>
              <dd>54 rue des Roseaux, 31400 Toulouse, France</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-400">Courriel :</dt>
              <dd>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  {EMAIL}
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <LegalParagraph>
          L’activité étant exercée sous le statut d’entrepreneur individuel, le patrimoine
          professionnel et le patrimoine personnel de l’éditeur sont séparés dans les conditions
          prévues par la loi.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="publication" title="Directeur de la publication">
        <LegalParagraph>
          Le directeur de la publication est Abdennour Abdennour, éditeur du site. Toute demande
          relative au contenu publié peut lui être adressée à{' '}
          <a
            href={`mailto:${EMAIL}`}
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            {EMAIL}
          </a>
          .
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="hebergeur" title="Hébergeur">
        <LegalParagraph>Le site et ses données sont hébergés par :</LegalParagraph>
        <div className="glass-card p-6 sm:p-7">
          <p className="font-space font-bold text-slate-900 text-lg mb-3">
            Hostinger International Ltd
          </p>
          <dl className="font-inter text-slate-600 text-base leading-relaxed space-y-1.5">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-400">Adresse :</dt>
              <dd>61 Lordou Vironos Street, 6023 Larnaca, Chypre</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-400">Serveur :</dt>
              <dd className="font-mono-jetbrains">server2120</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-400">Localisation :</dt>
              <dd>France / Union européenne</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-400">Sauvegardes :</dt>
              <dd>Lituanie (Union européenne)</dd>
            </div>
          </dl>
        </div>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <LegalParagraph>
          Pour toute question, réclamation ou demande relative au site, à un contenu pédagogique ou
          à un compte, écrivez à{' '}
          <a
            href={`mailto:${EMAIL}`}
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            {EMAIL}
          </a>{' '}
          ou utilisez le <Link to="/contact" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">formulaire de contact</Link>.
        </LegalParagraph>
        <LegalParagraph>
          Les demandes relatives aux données personnelles (accès, rectification, effacement,
          opposition) sont décrites dans la{' '}
          <Link
            to="/confidentialite"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            politique de confidentialité
          </Link>
          . Elles s’adressent à la même adresse de courriel.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="propriete" title="Propriété intellectuelle">
        <LegalParagraph>
          L’ensemble des éléments composant le site — textes, énoncés, exercices, corrections,
          illustrations, figures interactives, animations, code source, interface, charte graphique
          et marque « Smarter Academy » — est protégé par le droit de la propriété intellectuelle
          et demeure la propriété de l’éditeur, sauf mention contraire.
        </LegalParagraph>
        <LegalParagraph>
          La création d’un compte, gratuit ou Premium, confère un droit d’usage personnel et non
          exclusif des contenus, à des fins strictement pédagogiques et non commerciales. Sont
          notamment interdits, sans autorisation écrite préalable :
        </LegalParagraph>
        <LegalList>
          <li>
            la reproduction, la diffusion ou la mise à disposition de tout ou partie des contenus,
            y compris par capture d’écran ou par recopie d’énoncés ;
          </li>
          <li>
            l’extraction ou la réutilisation systématique de la base de leçons et d’exercices, y
            compris par des moyens automatisés ;
          </li>
          <li>
            le partage d’identifiants de connexion permettant à des tiers d’accéder aux contenus.
          </li>
        </LegalList>
        <LegalParagraph>
          Les programmes scolaires officiels auxquels les contenus se réfèrent relèvent de leurs
          auteurs respectifs. Smarter Academy ne revendique aucun droit sur ces référentiels, dont
          seule l’exploitation pédagogique propre à la plateforme lui appartient.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="responsabilite" title="Responsabilité">
        <LegalParagraph>
          L’éditeur apporte le plus grand soin à l’exactitude mathématique et pédagogique des
          contenus publiés. Il ne peut toutefois garantir qu’ils sont exempts de toute erreur, ni
          qu’ils correspondent en permanence à l’état le plus récent des programmes officiels ou
          aux attentes particulières d’un établissement. Les contenus sont un support de travail :
          ils ne se substituent ni à l’enseignement dispensé en classe, ni à un avis professionnel.
        </LegalParagraph>
        <LegalCallout tone="blue" title="Signaler une erreur">
          <p>
            Chaque leçon comporte un bouton « Signaler » qui permet de transmettre une erreur
            repérée dans un énoncé ou une correction. C’est le moyen le plus rapide de la faire
            corriger.
          </p>
        </LegalCallout>
        <LegalParagraph>
          L’éditeur s’efforce d’assurer la disponibilité du service, sans y être tenu de manière
          permanente : l’accès peut être interrompu pour maintenance, mise à jour ou en cas
          d’incident technique, y compris chez l’hébergeur. Sa responsabilité ne saurait être
          engagée à raison d’une indisponibilité temporaire, ni des dommages résultant d’une
          utilisation du site non conforme aux{' '}
          <Link to="/cgu" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
            conditions générales d’utilisation
          </Link>
          .
        </LegalParagraph>
        <LegalParagraph>
          Le site peut renvoyer vers des ressources extérieures. L’éditeur n’exerce aucun contrôle
          sur leur contenu et décline toute responsabilité à leur égard.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="documents" title="Autres documents">
        <LegalParagraph>
          Les règles d’utilisation du service et le traitement des données personnelles sont
          détaillés dans deux documents distincts :
        </LegalParagraph>
        <LegalList>
          <li>
            <Link
              to="/cgu"
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
            >
              Conditions générales d’utilisation
            </Link>{' '}
            — inscription, offres, abonnement, résiliation.
          </li>
          <li>
            <Link
              to="/confidentialite"
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
            >
              Politique de confidentialité
            </Link>{' '}
            — données collectées, finalités, durées de conservation, droits.
          </li>
        </LegalList>
      </LegalSection>
    </LegalPage>
  );
}
