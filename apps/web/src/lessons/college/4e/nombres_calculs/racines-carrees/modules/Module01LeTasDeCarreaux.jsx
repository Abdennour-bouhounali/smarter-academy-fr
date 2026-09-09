import React, { useState } from 'react';
import { Grid3x3, PackageOpen } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CarreauxLab from '../components/CarreauxLab';
import { estCarreParfait, meilleurCarre } from '../components/racines4e';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : ranger un tas de
 * carreaux en carré (components/CarreauxLab.jsx).
 *
 * Activity              ajouter ou retirer des carreaux jusqu'à ce que le tas
 *                       forme un carré plein, puis chercher combien de tels
 *                       nombres existent entre 40 et 70.
 * Mathematical objective on connaît l'AIRE (le nombre de carreaux) et on
 *                       cherche le CÔTÉ — le problème inverse du carré, que
 *                       l'élève n'a jamais rencontré dans ce sens. Et tous
 *                       les nombres n'y répondent pas.
 * Student action        −/+ sur le nombre de carreaux, ou un raccourci.
 * Controlled variable   le nombre de carreaux, seul.
 * Mathematical state    `n` — détenu ICI ; le laboratoire n'en garde rien,
 *                       donc la manipulation est rejouable sans limite.
 * Visual consequence    les carreaux se rangent dans le plus grand carré
 *                       possible ; ceux qui restent s'empilent EN ROUGE à
 *                       côté. Le carré devient vert quand il ne reste rien.
 * Expected observation  « 49 tombe pile, 50 laisse un carreau » — puis, en
 *                       balayant, « entre 49 et 64, aucun nombre ne marche ».
 * Misconception targeted « la racine, c'est la moitié » : 36 carreaux
 *                       donnent un côté de 6, et l'écran l'impose avant
 *                       qu'aucune règle ne soit écrite.
 * Formalization         AUCUNE : ni le mot « racine carrée », ni le symbole
 *                       √, ni « carré parfait » n'apparaissent ici. Ils sont
 *                       posés aux modules 2 et 3.
 * Transfer              module 4 : les trous entre deux carrés parfaits
 *                       deviennent l'encadrement.
 *
 * FRONTIÈRE AVEC LA 3e : la leçon de 3e fait redimensionner un carré CONTINU
 * vers une aire cible. Ici on COMPTE des carreaux discrets — c'est l'entrée
 * d'une introduction, et ce n'est pas le même geste (voir lesson.config.js).
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur de l'étape comme une invitation, jamais comme un péage.
 */
export default function Module01LeTasDeCarreaux() {
  const [pred, setPred] = useState(null);

  // Étape 1 — faire tomber le tas juste.
  const [n, setN] = useState(50);
  const [reussi, setReussi] = useState(false);

  // Étape 2 — chercher TOUS les nombres qui marchent entre 40 et 70.
  const [m, setM] = useState(52);
  const [trouves, setTrouves] = useState([]);
  const doneB = trouves.length >= 2;

  const [q3, setQ3] = useState(false);

  const info = meilleurCarre(n);

  const steps = [
    {
      num: 1,
      title: 'Range les carreaux en carré',
      subtitle: 'Tu as 50 carreaux. Ajoute-en ou retire-en jusqu’à ce qu’ils forment un carré plein, sans rien qui dépasse.',
      done: reussi,
      content: (kit) => (
        <div className="space-y-3">
          <CarreauxLab
            n={n}
            onN={(v) => {
              setN(v);
              if (estCarreParfait(v) && !reussi) {
                setReussi(true);
                kit.react(true);
              }
            }}
            propositions={[36, 49, 50, 64]}
          />

          <PredictionChips
            prompt="Avant de toucher aux boutons : avec 50 carreaux, quel côté fera le carré, d’après toi ?"
            options={[
              { id: '7', label: '7' },
              { id: '25', label: '25' },
              { id: 'aucun', label: 'aucun côté ne marche' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={reussi}
          />

          {reussi ? (
            <Feedback tone="ok">
              {pred === 'aucun' ? 'Ta prédiction tenait' : 'Regarde le carré vert'} : avec{' '}
              <strong>{n}</strong> carreaux, le carré fait <strong>{info.cote}</strong> de côté et il
              ne reste rien. Avec 50, c’était impossible : il restait un carreau tout seul.
              <br />
              Remarque bien ce que tu viens de faire : tu connaissais le <strong>nombre de
              carreaux</strong> — l’aire — et tu cherchais le <strong>côté</strong>. C’est le
              chemin <strong>inverse</strong> de celui que tu connais depuis la 6e. Continue à
              essayer d’autres nombres.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Les carreaux <span className="font-semibold text-rose-600">rouges</span> sont ceux qui
              ne rentrent pas dans le carré. Il faut qu’il n’en reste <strong>aucun</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Combien y en a-t-il ?',
      subtitle: 'Entre 40 et 70, trouve DEUX nombres de carreaux qui forment un carré plein.',
      done: doneB,
      content: (kit) => (
        <div className="space-y-3">
          <CarreauxLab
            n={m}
            min={40}
            max={70}
            onN={(v) => {
              setM(v);
              if (estCarreParfait(v) && !trouves.includes(v)) {
                const next = [...trouves, v];
                setTrouves(next);
                if (next.length <= 2) kit.react(true);
              }
            }}
          />
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-slate-600">Trouvés :</span>
            {trouves.length === 0 ? (
              <span className="italic text-slate-400">aucun pour l’instant</span>
            ) : (
              trouves.map((v) => (
                <span key={v} className="rounded-lg border-2 border-emerald-300 bg-emerald-50 px-2 py-0.5 font-bold tabular-nums text-emerald-700">
                  {v}
                </span>
              ))
            )}
          </div>
          {doneB ? (
            <Feedback tone="ok">
              <strong>49</strong> et <strong>64</strong> — et ce sont les seuls. Entre les deux, il
              y a <strong>quatorze</strong> nombres, et aucun ne forme un carré. Ces nombres
              « qui tombent juste » sont donc <strong>rares</strong>, et de plus en plus espacés à
              mesure qu’on monte.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Balaie les nombres un par un et surveille la pile rouge. Il n’y en a pas beaucoup qui
              marchent…
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que les carreaux montrent',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* Deux tas ont été rangés, dont un qui refusait : on peut nommer
              le constat avant la question qui l'exige. */}
          <KnowledgeBrick
            id="carre-ou-pas"
            variant="new"
            lead={<>Tu viens de chercher, pour un nombre de carreaux donné, le côté du carré qu’il forme. Cette question a un sens précis — et une réponse qui n’existe pas toujours.</>}
          />
          <TapQuestion
            prompt="Avec 36 carreaux, quel est le côté du carré qu’on peut former ?"
            options={['6', '18', '9', '36']}
            correct={0}
            cols={4}
            requires={['carre-ou-pas']}
            explain="6 × 6 = 36 : le carré fait 6 de côté. (18 est la moitié de 36 — mais un carré de 18 de côté contiendrait 324 carreaux, bien plus que 36.)"
            explainWrong="C’est l’erreur la plus fréquente : prendre la moitié. Le test qui tranche est toujours le même — multiplie ta réponse par elle-même et vois si tu retombes sur le nombre de carreaux."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le tas de carreaux"
      moduleSubtitle="Quand l’aire est connue et le côté cherché"
      estimatedTime="13 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Un carrelage à poser',
        tone: 'indigo',
        body: (
          <p>
            On te donne un <strong>tas de carreaux</strong> et une consigne simple : en faire un
            carré, sans qu’il en reste un seul. Tu vas voir que ce n’est pas toujours possible — et
            c’est précisément là que commence la leçon.
          </p>
        ),
      }}
      intro={
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Grid3x3, t: 'Le carré', d: 'Les carreaux se rangent d’eux-mêmes, au mieux.', c: 'text-indigo-600' },
            { icon: PackageOpen, t: 'La pile rouge', d: 'Ceux qui ne rentrent pas. L’objectif : la vider.', c: 'text-rose-500' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`mb-1 h-5 w-5 ${c}`} aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-800">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
