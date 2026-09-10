import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DroitesLab from '../components/DroitesLab';
import ScalaireEspace from '../components/ScalaireEspace';
import { verdicts, ORIENTATION_DEPART, fr, frVec3 } from '../components/espaceUtils';

/**
 * Module 6 — ATELIER : le fait capital de la leçon.
 *
 * DANS LE PLAN, « perpendiculaires » impliquait « sécantes » : deux droites qui
 * font un angle droit se coupent forcément, et le mot lui-même le suppose. Dans
 * l'espace, c'est FAUX — et c'est la conception erronée la plus coûteuse du
 * chapitre, parce qu'elle est vraie partout où l'élève l'a apprise.
 *
 * Étape 1  LE CAS FAMILIER. (AB) et (BC) : produit nul, ET elles se coupent.
 *          C'est le plan, dans l'espace — le point de départ.
 * Étape 2  LE CAS QUI CASSE L'HABITUDE. (AB) et (CG) : produit nul AUSSI, et
 *          pourtant aucun point commun. L'élève PRÉDIT avant de tourner, puis
 *          tourne autant qu'il veut — la boîte reste en main.
 * Étape 3  LES DEUX QUESTIONS SONT SÉPARÉES. On demande explicitement ce que le
 *          produit nul décide, et ce qu'il ne décide pas.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 2  constater le produit nul sans intersection → brique
 *            `regle-orthogonalite-espace`
 *   étape 3  la séparation des deux questions → brique
 *            `mem-nul-ne-veut-pas-dire-secantes`
 *
 * L'étape 1 ne pose aucune brique : elle ne fait que rappeler un acquis du plan
 * (`regle-orthogonalite`, diagnostiqué au module 0) sur un exemple de l'espace.
 * Poser une brique là reviendrait à créditer la leçon d'un enseignement qu'elle
 * n'a pas fait.
 *
 * LA ROTATION EST DONNÉE AVANT CHAQUE QUESTION, comme au module 5.
 */

const V = Object.fromEntries(verdicts().map((v) => [v.cle, v]));
const SECANTES = V.c3;   // (AB) / (BC) — orthogonales ET sécantes
const DISJOINTES = V.c2; // (AB) / (CG) — orthogonales et NON coplanaires

export default function Module06OrthogonalesSansSeCouper() {
  const [o1, setO1] = useState(ORIENTATION_DEPART);
  const [q1, setQ1] = useState(false);

  const [pred, setPred] = useState(null);
  const [o2, setO2] = useState(ORIENTATION_DEPART);
  const [q2, setQ2] = useState(false);

  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Orthogonales sans se couper"
      moduleSubtitle="Le fait qui n’existe pas dans le plan"
      estimatedTime="8 min"
      brief={{
        tag: 'Atelier',
        title: 'Un angle droit, sans point de rencontre',
        tone: 'indigo',
        body: (
          <p>
            Dans le plan, deux droites qui font un angle droit se coupent — c’était même le sens du
            mot. Dans l’espace, cette moitié de phrase tombe. Deux couples de droites de la boîte
            vont te le montrer.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le cas que tu connais déjà',
          subtitle:
            'Deux arêtes qui partent du même coin. Tourne la boîte, puis lis le produit de leurs directeurs.',
          done: q1,
          content: (
            <div className="space-y-3">
              <DroitesLab
                verdict={SECANTES}
                orientation={o1}
                onOrientation={setO1}
                montrerVerdict={q1}
              />
              <ScalaireEspace
                u={[SECANTES.d1.a, SECANTES.d1.b]}
                v={[SECANTES.d2.a, SECANTES.d2.b]}
              />
              <TapQuestion
                prompt={`Le produit des directeurs de ${SECANTES.d1.nom} et ${SECANTES.d2.nom} vaut ${fr(SECANTES.produit)}. Ces deux droites…`}
                options={[
                  `font un angle droit, et elles se coupent en ${SECANTES.d1.b} : les deux à la fois`,
                  'font un angle droit, mais ne se coupent pas',
                  'ne font pas d’angle droit',
                  'sont parallèles',
                ]}
                correct={0}
                cols={1}
                requires={['formule-scalaire-espace', 'regle-orthogonalite']}
                explain={`Un produit nul signale l’angle droit, comme dans le plan. Et ici les deux droites partagent bien un point : le coin ${SECANTES.d1.b}, que tu vois sur la figure quel que soit l’angle. Ce cas-là ne surprend personne — le suivant, si.`}
                explainWrong={`Le produit vaut ${fr(SECANTES.produit)} : c’est la signature de l’angle droit, il y en a donc bien un. Et les deux droites passent toutes deux par ${SECANTES.d1.b}, tu peux le vérifier en tournant.`}
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le même produit nul, et pourtant…',
          subtitle:
            'Ce couple-ci donne aussi un produit nul. Prédis d’abord, puis tourne la boîte autant que tu veux pour chercher leur point de rencontre.',
          done: q2,
          content: (
            <div className="space-y-3">
              <PredictionChips
                prompt={`le produit des directeurs de ${DISJOINTES.d1.nom} et ${DISJOINTES.d2.nom} vaut aussi 0. Vont-elles se couper quelque part ?`}
                options={[
                  { id: 'oui', label: 'Oui : un produit nul veut dire qu’elles se coupent à angle droit' },
                  { id: 'non', label: 'Non : elles peuvent faire un angle droit sans se rencontrer' },
                  { id: 'depend', label: 'Cela dépend de l’angle sous lequel on regarde' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={q2}
              />
              <DroitesLab
                verdict={DISJOINTES}
                orientation={o2}
                onOrientation={setO2}
                montrerVerdict={q2}
                disabled={!q1}
              />
              <ScalaireEspace
                u={[DISJOINTES.d1.a, DISJOINTES.d1.b]}
                v={[DISJOINTES.d2.a, DISJOINTES.d2.b]}
              />
              <TapQuestion
                prompt={`Après avoir tourné : ${DISJOINTES.d1.nom} et ${DISJOINTES.d2.nom} ont-elles un point commun ?`}
                options={[
                  'Non, aucun — et pourtant leur produit est nul : elles font bien un angle droit',
                  'Oui, mais il est caché derrière la boîte',
                  'Oui, puisque le produit est nul',
                  'Le produit nul prouve qu’elles sont parallèles',
                ]}
                correct={0}
                cols={1}
                requires={['formule-scalaire-espace', 'droites-espace-trois-cas', 'regle-orthogonalite']}
                explain={`Leurs directeurs sont ${frVec3(DISJOINTES.d1.dir)} et ${frVec3(DISJOINTES.d2.dir)} : le produit vaut ${fr(DISJOINTES.produit)}, donc angle droit. Mais aucun coin ni aucun point de la boîte ne leur est commun — tu as pu tourner autant que tu voulais. Deux droites de l’espace peuvent faire un angle droit en restant à distance l’une de l’autre pour toujours.`}
                explainWrong="Un point caché aurait fini par apparaître en tournant — la rotation ne cache rien, elle révèle. Et un produit nul ne peut pas signifier « parallèles » : deux directions parallèles donneraient un produit non nul, comme au module précédent."
                solved={q2}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <Feedback tone="ok">
                    {pred === 'non' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Le constat'} :
                    même produit nul, et pourtant aucune rencontre. C’est le fait qui n’a pas
                    d’équivalent dans le plan — et c’est pour cela qu’on dit ici{' '}
                    <strong>orthogonales</strong> plutôt que « perpendiculaires ».
                  </Feedback>
                  <KnowledgeBrick
                    id="regle-orthogonalite-espace"
                    variant="new"
                    lead={<>Le critère, et ce qu’il ne dit pas. Tourne encore la boîte en le lisant.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Deux questions, deux réponses',
          done: q3,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 overflow-x-auto">
                <table className="w-full text-center text-sm"><tbody>
                  <tr className="bg-slate-50">
                    <th className="px-2 py-1 text-left">couple</th>
                    <th className="px-2 py-1">produit des directeurs</th>
                    <th className="px-2 py-1">angle droit ?</th>
                    <th className="px-2 py-1">point commun ?</th>
                  </tr>
                  {[SECANTES, DISJOINTES].map((v) => (
                    <tr key={v.cle} className="border-t">
                      <th className="px-2 py-1 text-left font-mono">
                        {v.d1.nom} et {v.d2.nom}
                      </th>
                      <td className="px-2 py-1 font-mono font-bold">{fr(v.produit)}</td>
                      <td className="px-2 py-1 font-bold">{v.orthogonales ? 'oui' : 'non'}</td>
                      <td className="px-2 py-1 font-bold">{v.secantes ? 'oui' : 'non'}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <TapQuestion
                prompt="Les deux couples ont le même produit. Que décide donc ce produit, et que ne décide-t-il pas ?"
                options={[
                  'Il décide de l’ANGLE — nul veut dire angle droit — et il ne dit rien du fait qu’elles se rencontrent ou non',
                  'Il décide des deux à la fois : angle droit et point commun',
                  'Il décide du point commun, mais pas de l’angle',
                  'Il ne décide de rien : seul le dessin peut trancher',
                ]}
                correct={0}
                cols={1}
                requires={['regle-orthogonalite-espace', 'droites-espace-trois-cas']}
                explain="La colonne du produit est identique sur les deux lignes ; la colonne du point commun, non. Un même produit ne peut donc pas décider de deux choses différentes : il décide de l’angle, et de l’angle seulement. La rencontre est une question à part, qu’on tranche autrement."
                explainWrong="Le tableau le montre à lui seul : deux lignes de même produit, et pourtant des réponses opposées sur le point commun. Quant au dessin, le module 5 a montré qu’il pouvait afficher un croisement là où il n’y en a pas."
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <KnowledgeBrick
                  id="mem-nul-ne-veut-pas-dire-secantes"
                  variant="new"
                  lead={<>À retenir — c’est l’erreur la plus fréquente du chapitre.</>}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tu as tout.</strong> Trois nombres pour un trajet, une racine pour sa longueur,
          un terme de plus pour le produit scalaire, et deux critères pour trancher entre deux
          droites. Mission finale.
        </KnowledgeSnapshot>
      }
    />
  );
}
