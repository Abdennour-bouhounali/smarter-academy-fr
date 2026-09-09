import React, { useState } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConstructeurLab from '../components/ConstructeurLab';
import {
  A_DEFAUT, B_DEFAUT, D_DEFAUT, quatriemeSommet, glissementEntre,
  ecartGlissements, estCroise, arrondi, fr,
} from '../components/paral4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 2 — DÉCOUVERTE : POURQUOI la figure se referme.
 *
 * Activity              relever les deux trajets côte à côte, sur plusieurs
 *                       formes, et constater qu'ils ne se séparent jamais.
 * Mathematical objective si un glissement mène A en D et B en C, alors [AD]
 *                       et [BC] sont parallèles, de même longueur et de même
 *                       sens — et cela SUFFIT pour conclure.
 * Student action        déplacer les sommets, relever les deux trajets.
 * Controlled variable   la position de A, B et D.
 * Mathematical state    les deux glissements, mesurés par `glissementEntre`
 *                       sur les points dessinés ; leur écart par
 *                       `ecartGlissements`.
 * Visual consequence    les deux longueurs affichées restent égales, les
 *                       deux directions aussi, quelle que soit la forme.
 * Expected observation  « ce ne sont pas deux trajets qui se ressemblent :
 *                       c'est le même ».
 * Misconception targeted croire que deux côtés de même LONGUEUR suffisent —
 *                       le contre-exemple du cerf-volant est donné ici ; et
 *                       relier les sommets dans le mauvais ordre.
 * Formalization         la règle « deux trajets, un glissement » et le piège
 *                       de l'ordre des sommets sont posés ici.
 *
 * CONTINUITÉ : le quadrilatère vient du module 1 (`useLabState`), et on le
 * regarde autrement — plus la figure, mais les deux trajets qui la portent.
 */
export default function Module02UnSeulGlissement() {
  const memo = useLabState(LESSON_CONFIG.id, 'quad', { A: A_DEFAUT, B: B_DEFAUT, D: D_DEFAUT });
  const [A, setA] = useState(memo.value.A ?? A_DEFAUT);
  const [B, setB] = useState(memo.value.B ?? B_DEFAUT);
  const [D, setD] = useState(memo.value.D ?? D_DEFAUT);
  const [releves, setReleves] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const C = quatriemeSommet(A, B, D);
  const gAD = glissementEntre(A, D);
  const gBC = glissementEntre(B, C);
  const ecart = ecartGlissements(gAD, gBC);

  const relever = () => {
    memo.save({ A, B, D });
    const signature = `${arrondi(gAD.longueur, 0)}|${arrondi(gAD.directionDeg, 0)}`;
    setReleves((r) => (r.some((x) => x.signature === signature) ? r : [...r, {
      signature,
      lAD: arrondi(gAD.longueur, 1),
      lBC: arrondi(gBC.longueur, 1),
      dAD: arrondi(gAD.directionDeg, 0),
      dBC: arrondi(gBC.directionDeg, 0),
    }]));
  };

  const done1 = releves.length >= 3;

  const steps = [
    {
      num: 1,
      title: 'Relève les deux trajets, sur trois formes',
      subtitle: 'Le trajet de A vers D, et celui de B vers C. Compare-les à chaque fois.',
      done: done1,
      content: (
        <div className="space-y-3">
          <ConstructeurLab
            A={A} B={B} D={D}
            onA={setA} onB={setB} onD={setD}
            montrerTemoins={false}
          />
          <button
            type="button"
            onClick={relever}
            className="min-h-[44px] w-full rounded-xl bg-violet-600 px-3 py-2 text-sm font-bold text-white hover:bg-violet-700"
          >
            Relever les deux trajets
          </button>
          {releves.length > 0 && (
            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white p-3">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-1 text-left">relevé</th>
                    <th className="pb-1 text-right">longueurs</th>
                    <th className="pb-1 text-right">directions</th>
                  </tr>
                </thead>
                <tbody>
                  {releves.map((r, i) => (
                    <tr key={r.signature} className="border-t border-slate-100">
                      <td className="py-1 text-slate-500">n° {i + 1}</td>
                      <td className="py-1 text-right font-mono text-slate-700">
                        {fr(r.lAD, 1)} et {fr(r.lBC, 1)}
                      </td>
                      <td className="py-1 text-right font-mono text-slate-700">
                        {fr(r.dAD, 0)}° et {fr(r.dBC, 0)}°
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-3 text-center">
            <p className="text-sm font-bold text-cyan-900">
              écart de longueur : {fr(arrondi(ecart.longueur, 1), 1)} · écart de direction :{' '}
              {fr(arrondi(ecart.direction, 1), 1)}° · même sens : {ecart.memeSens ? 'oui' : 'non'}
            </p>
          </div>
          {!done1 && releves.length > 0 && (
            <Feedback tone="info">
              {releves.length} relevé{releves.length > 1 ? 's' : ''} sur 3. Change nettement la
              forme, puis recommence.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois formes, et jamais le moindre écart. Ce ne sont pas deux trajets qui se
              ressemblent : c’est <strong>le même déplacement</strong>, fait deux fois.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que cela suffit à prouver',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Deux côtés opposés d’un quadrilatère sont parallèles ET de même longueur. Que peut-on conclure ?"
            options={[
              'C’est un parallélogramme',
              'C’est un losange',
              'On ne peut pas conclure',
              'C’est un rectangle',
            ]}
            correct={0}
            cols={2}
            requires={['caracterisations', 'translation-parallelogramme']}
            explain="C’est l’une des caractérisations vues en 5e. Les deux conditions comptent : parallèles ET de même longueur. Le glissement fournit les deux d’un coup."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="deux-trajets-un-glissement"
              variant="new"
              lead="Voilà pourquoi la figure se referme à tous les coups."
            />
          )}
          {q2 && (
            <TapQuestion
              prompt="Un quadrilatère a deux côtés opposés de MÊME LONGUEUR, mais qui ne sont pas parallèles. Est-ce un parallélogramme ?"
              options={[
                'Non : il manque le parallélisme',
                'Oui : la même longueur suffit',
                'Oui, si les deux autres côtés sont égaux aussi',
                'On ne peut pas savoir',
              ]}
              correct={0}
              cols={1}
              requires={['deux-trajets-un-glissement']}
              explain="Un cerf-volant a deux paires de côtés de même longueur, et n’est pas un parallélogramme. Les deux conditions doivent tenir ensemble."
              solved={q3}
              onAnswered={() => setQ3(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Attention à l’ordre',
      subtitle: 'Le même jeu de quatre points, relié dans deux ordres différents.',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Les quatre points ne changent pas. Ce qui change, c’est l’ordre dans lequel on les
            relie — et le résultat n’a rien à voir :
          </p>
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { titre: 'A B C D', croise: estCroise([A, B, C, D]) },
              { titre: 'A B D C', croise: estCroise([A, B, D, C]) },
            ].map((cas) => (
              <div
                key={cas.titre}
                data-ordre={cas.titre.replace(/ /g, '')}
                className={`rounded-xl border-2 p-3 ${
                  cas.croise ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50'
                }`}
              >
                <div className="font-mono text-base font-black text-slate-900">{cas.titre}</div>
                <div className={`text-sm font-bold ${cas.croise ? 'text-rose-800' : 'text-emerald-800'}`}>
                  {cas.croise ? 'quadrilatère croisé' : 'le bon contour'}
                </div>
              </div>
            ))}
          </div>
          <TapQuestion
            prompt="Un glissement mène M en M’ et N en N’. Dans quel ordre faut-il nommer les quatre points pour obtenir un parallélogramme ?"
            options={[
              'M M’ N’ N',
              'M N M’ N’',
              'M N’ M’ N',
              'N’importe lequel : ce sont les mêmes points',
            ]}
            correct={0}
            cols={2}
            requires={['translation-parallelogramme', 'quadrilatere']}
            explain="On fait le TOUR de la figure : M, puis son image M’, puis l’image N’, puis N — et on referme sur M. Relier M à N puis M’ à N’ traverse la figure et donne un quadrilatère croisé."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="ordre-des-sommets"
              variant="new"
              lead="C’est l’erreur la plus fréquente de tout le chapitre, et elle ne se voit que sur le dessin."
            />
          )}
          {q4 && (
            <Feedback tone="info">
              Retiens le geste : on nomme les sommets <strong>en tournant</strong>, sans jamais
              sauter d’un côté à l’autre de la figure.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Un seul glissement, deux trajets"
      moduleSubtitle="Pourquoi la figure se referme à tous les coups"
      estimatedTime="8 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'Deux trajets, ou un seul ?',
        tone: 'indigo',
        body: (
          <>
            Ton quadrilatère du module 1 revient. Cette fois, on ne regarde plus la figure :{' '}
            <strong>on regarde les deux traits épais</strong>.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <GitCompareArrows className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Sous la figure, deux cases donnent la longueur et la direction de chaque trajet.
            Déforme autant que tu veux : surveille l’écart.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
