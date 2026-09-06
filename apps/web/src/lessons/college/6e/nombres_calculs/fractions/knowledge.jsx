import React from 'react';
import MathText from '../../../../common/components/MathText';
import { PartsBar, PartsCircle, MiniNumberLine } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Fractions » (6e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules : la brique et la carte montrent
 * le même texte.
 *
 * ORDRE — un item n'utilise QUE ce qui est déjà établi au module qui le
 * déclare, puisque la brique rend ce texte à sa position dans le flux :
 *
 *   M1  la part égale, et la fraction comme écriture d'une prise
 *   M2  le rôle du BAS (la découpe) — encore sans son nom savant
 *   M3  les deux noms : numérateur, dénominateur
 *   M4  une même quantité, plusieurs dessins ; deux écritures possibles
 *   M5  la fraction d'une quantité (÷ puis ×)
 *   M6  la fraction comme quotient : a/b est le partage de a en b
 *   M7  les fractions du quotidien
 *   M8  la fraction est un NOMBRE : sa place sur la demi-droite, et son côté
 *       de 1 (4/4 tombe sur 1, 5/4 le dépasse)
 *   M9  la fraction décimale, pont vers l'écriture à virgule
 *
 * Les mots « numérateur » et « dénominateur » n'apparaissent donc dans aucun
 * item avant M3, où ils sont posés — c'est précisément le défaut que cette
 * carte répare (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le partage impossible : la part égale, puis l'écriture. ── */
    1: [
      {
        id: 'part-egale',
        type: 'concepts',
        title: 'Part égale',
        summary: 'Partager, en mathématiques, c’est faire des parts rigoureusement de même taille.',
        visual: <PartsCircle den={4} num={1} color="#8b5cf6" />,
        body: (
          <div className="space-y-2">
            <p>
              Couper en 4 morceaux ne suffit pas : il faut 4 morceaux <strong>identiques</strong>.
              Sinon, « une part » ne veut plus rien dire — la part de l’un ne vaut pas la part de
              l’autre.
            </p>
            <Piege>
              Quatre morceaux dont l’un est deux fois plus gros ne sont pas des quarts : la figure
              est coupée en 4, mais elle n’est pas <em>partagée</em> en 4.
            </Piege>
            <Souvenir>la tablette qu’il fallait couper équitablement entre 4 personnes.</Souvenir>
          </div>
        ),
      },
      {
        id: 'fraction-ecriture',
        type: 'vocabulaire',
        title: 'Une fraction',
        summary: 'Deux nombres séparés d’un trait : en bas la découpe, en haut ce qu’on prend.',
        visual: <PartsBar den={4} num={3} color="#8b5cf6" />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\frac{3}{4}$'}</MathText>
              <span className="text-slate-500 text-sm ml-3">se lit « trois quarts »</span>
            </div>
            <p>
              Le nombre du <strong>bas</strong> dit en combien de parts égales l’unité est coupée.
              Le nombre du <strong>haut</strong> dit combien de ces parts on prend.
            </p>
            <Souvenir>les 3 parts de tablette que tu as sélectionnées sur 4.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — L'atelier : le bas commande la taille des parts. ── */
    2: [
      {
        id: 'role-du-bas',
        type: 'regles',
        title: 'Plus le bas est grand, plus les parts sont petites',
        summary: 'Couper la même unité en plus de parts donne des parts plus fines.',
        visual: (
          <div className="flex items-end gap-2">
            <PartsBar den={3} num={1} width={95} height={34} showUnit={false} color="#38bdf8" />
            <PartsBar den={8} num={1} width={95} height={34} showUnit={false} color="#38bdf8" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              L’unité ne change pas : c’est toujours la même barre. En la coupant en 8 au lieu de
              3, on n’obtient pas « plus de gâteau » — on obtient des parts plus petites.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center text-sm">
              <MathText>{'$\\frac{1}{3}$'}</MathText>
              <span className="text-slate-400 mx-2">est plus grand que</span>
              <MathText>{'$\\frac{1}{8}$'}</MathText>
            </div>
            <Piege>
              8 &gt; 3, et pourtant un huitième est plus petit qu’un tiers. Le nombre du bas compte
              les parts, il ne mesure pas la quantité.
            </Piege>
            <Souvenir>le curseur de découpe que tu as poussé, et les parts qui rétrécissaient.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Les deux mots. C'est ICI, et pas avant, qu'ils existent. ── */
    3: [
      {
        id: 'numerateur',
        type: 'vocabulaire',
        title: 'Numérateur',
        summary: 'Le nombre du haut : combien de parts on prend.',
        visual: <PartsBar den={4} num={3} color="#ef4444" />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\frac{\\textcolor{#ef4444}{3}}{4}$'}</MathText>
              <span className="text-slate-500 text-sm ml-3">3 parts prises</span>
            </div>
            <p>
              Il <strong>compte</strong>. C’est lui qui change quand tu colories une part de plus :
              la découpe reste la même, la quantité augmente.
            </p>
            <Souvenir>le nombre du haut qui grossissait quand tu cliquais « voir le numérateur ».</Souvenir>
          </div>
        ),
      },
      {
        id: 'denominateur',
        type: 'vocabulaire',
        title: 'Dénominateur',
        summary: 'Le nombre du bas : en combien de parts égales l’unité est coupée.',
        visual: <PartsBar den={4} num={3} color="#6366f1" />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\frac{3}{\\textcolor{#6366f1}{4}}$'}</MathText>
              <span className="text-slate-500 text-sm ml-3">4 parts égales en tout</span>
            </div>
            <p>
              Il <strong>nomme</strong> la taille d’une part — c’est lui qui fait dire « quarts »
              plutôt que « tiers ». Il ne compte pas ce qu’on prend.
            </p>
            <Souvenir>le nombre du bas, en bleu, et les traits de découpe qu’il commandait.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-haut-bas',
        type: 'memoriser',
        title: '⭐ Le haut compte, le bas nomme',
        summary: 'Numérateur = combien j’en prends. Dénominateur = de quelle taille.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">HAUT → combien de parts prises</div>
              <div className="text-sm font-black text-rose-700">BAS → en combien de parts on coupe</div>
            </div>
            <p className="text-xs text-slate-500">
              Un moyen de ne plus les confondre : le <strong>d</strong>énominateur est en{' '}
              <strong>d</strong>essous, et c’est lui qui <strong>d</strong>onne le nom.
            </p>
          </div>
        ),
      },
    ],

    /* ── M4 — Deux dessins, une même quantité. ── */
    4: [
      {
        id: 'meme-quantite-deux-dessins',
        type: 'concepts',
        title: 'La forme du dessin ne change pas la fraction',
        summary: 'Barre ou disque, ce qui compte est le nombre de parts et le nombre de parts prises.',
        visual: (
          <div className="flex items-center gap-3">
            <PartsBar den={4} num={3} width={110} height={38} showUnit={false} color="#a78bfa" />
            <PartsCircle den={4} num={3} size={62} color="#a78bfa" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Ces deux dessins montrent la même fraction : dans les deux cas l’unité est coupée en
              4 parts égales et on en prend 3.
            </p>
            <p className="text-xs text-slate-500">
              Savoir aller dans les deux sens — du dessin vers la fraction, et de la fraction vers
              le dessin — est ce qui prouve qu’on a compris l’écriture.
            </p>
            <Souvenir>le même 3/4 en barre puis en disque.</Souvenir>
          </div>
        ),
      },
      {
        id: 'equivalence-decoupe',
        type: 'concepts',
        title: 'Deux écritures, une seule quantité',
        summary: 'Recouper chaque part en deux ne change pas la surface coloriée : 1/2 = 2/4.',
        visual: (
          <div className="flex items-center gap-2">
            <PartsBar den={2} num={1} width={100} height={34} showUnit={false} color="#38bdf8" />
            <PartsBar den={4} num={2} width={100} height={34} showUnit={false} color="#38bdf8" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\frac{1}{2} = \\frac{2}{4}$'}</MathText>
            </div>
            <p>
              Le découpage est deux fois plus fin, et on prend deux fois plus de parts : la quantité
              coloriée, elle, n’a pas bougé.
            </p>
            <p className="text-xs text-slate-500">
              Tu retrouveras cette idée bien plus tard, quand il faudra additionner des fractions.
              En 6e, il suffit de la reconnaître sur un dessin.
            </p>
            <Souvenir>la moitié que tu as repartagée en deux sans rien ajouter.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 bis — L'équivalence, en enrichissement : le module 4 la fait
       vivre (repartager chaque moitié en deux), mais le programme de 6e ne
       l'exige pas et AUCUNE question du parcours principal n'en dépend.
       Elle est donc marquée comme telle et n'entre dans aucun `requires`. ── */

    /* ── M5 — La fraction d'une quantité. ── */
    5: [
      {
        id: 'fraction-quantite',
        type: 'methodes',
        title: 'Prendre une fraction d’une quantité',
        summary: 'Je divise par le bas pour faire les groupes, puis je multiplie par le haut.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-center text-sm">
              <div>
                <MathText>{'$\\frac{2}{3}$'}</MathText> de <strong>12</strong> ballons
              </div>
              <div className="text-slate-500">① 12 ÷ 3 = 4 &nbsp;→&nbsp; un tiers vaut 4</div>
              <div className="text-slate-500">② 4 × 2 = 8 &nbsp;→&nbsp; deux tiers valent 8</div>
            </div>
            <p>
              Le bas sert à <strong>faire les groupes</strong> (ils doivent être égaux, comme les
              parts d’un gâteau). Le haut dit <strong>combien de groupes</strong> on emporte.
            </p>
            <Piege>
              Diviser par le haut est l’erreur la plus fréquente : 12 ÷ 2 = 6 ne répond pas à la
              question, car ce sont bien 3 groupes qu’il faut former.
            </Piege>
            <Souvenir>les 12 ballons rangés en 3 paniers de 4.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — La fraction est aussi un partage. ── */
    6: [
      {
        id: 'fraction-quotient',
        type: 'concepts',
        title: 'Une fraction est le résultat d’un partage',
        summary: 'Partager 3 pizzas entre 4 personnes donne 3/4 de pizza chacun.',
        visual: (
          <div className="flex items-center gap-1.5">
            <PartsCircle den={4} num={1} size={44} color="#fb7185" />
            <PartsCircle den={4} num={1} size={44} color="#fb7185" />
            <PartsCircle den={4} num={1} size={44} color="#fb7185" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$3 \\div 4 = \\frac{3}{4}$'}</MathText>
            </div>
            <p>
              Chaque pizza est coupée en 4, et chacun reçoit une part de chaque pizza : 3 parts de
              quart, c’est <MathText>{'$\\frac{3}{4}$'}</MathText> de pizza.
            </p>
            <p className="text-xs text-slate-500">
              Une fraction répond donc à deux questions différentes : « quelle part de l’unité ? »
              et « combien chacun reçoit-il ? ». C’est le même nombre.
            </p>
            <Souvenir>les 3 pizzas distribuées à 4 convives, part par part.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M7 — Les fractions du quotidien. ── */
    7: [
      {
        id: 'fractions-usuelles',
        type: 'vocabulaire',
        title: 'Demi, tiers, quart, dixième',
        summary: 'Les quatre fractions qu’on rencontre partout — et leurs noms.',
        visual: (
          <div className="flex items-center gap-2">
            <PartsCircle den={2} num={1} size={46} color="#38bdf8" />
            <PartsCircle den={3} num={1} size={46} color="#a78bfa" />
            <PartsCircle den={4} num={1} size={46} color="#fbbf24" />
            <PartsCircle den={10} num={1} size={46} color="#34d399" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5 text-sm">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
                <MathText>{'$\\frac{1}{2}$'}</MathText> <span className="text-slate-500">un demi</span>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
                <MathText>{'$\\frac{1}{3}$'}</MathText> <span className="text-slate-500">un tiers</span>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
                <MathText>{'$\\frac{1}{4}$'}</MathText> <span className="text-slate-500">un quart</span>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
                <MathText>{'$\\frac{1}{10}$'}</MathText> <span className="text-slate-500">un dixième</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Une demi-heure, un quart d’heure, un tiers de la classe : ces mots sont déjà des
              fractions.
            </p>
          </div>
        ),
      },
    ],

    /* ── M8 — La fraction est un NOMBRE : elle a une place, et un côté de 1. ── */
    8: [
      {
        id: 'comparer-a-un',
        type: 'regles',
        title: 'Se situer par rapport à 1',
        summary: 'Haut < bas → moins que 1. Haut = bas → exactement 1. Haut > bas → plus que 1.',
        visual: <PartsBar den={4} num={4} color="#fbbf24" />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div><MathText>{'$\\frac{3}{4} < 1$'}</MathText> <span className="text-slate-400 ml-2">il manque une part</span></div>
              <div><MathText>{'$\\frac{4}{4} = 1$'}</MathText> <span className="text-slate-400 ml-2">l’unité entière</span></div>
              <div><MathText>{'$\\frac{5}{4} > 1$'}</MathText> <span className="text-slate-400 ml-2">une unité, et une part de plus</span></div>
            </div>
            <p>
              Prendre toutes les parts, c’est prendre l’unité entière : c’est pour cela que{' '}
              <MathText>{'$\\frac{4}{4}$'}</MathText>, <MathText>{'$\\frac{7}{7}$'}</MathText> et{' '}
              <MathText>{'$\\frac{10}{10}$'}</MathText> valent tous 1.
            </p>
            <Souvenir>la barre entièrement coloriée, qui valait exactement une unité.</Souvenir>
          </div>
        ),
      },
      {
        id: 'fraction-nombre-droite',
        type: 'methodes',
        title: 'Placer une fraction sur la demi-droite graduée',
        summary: 'Le bas dit en combien couper chaque unité ; le haut dit combien de crans avancer.',
        visual: (
          <MiniNumberLine
            min={0} max={2}
            ticks={[
              { at: 0, label: '0', strong: true },
              { at: 0.25 }, { at: 0.5 }, { at: 0.75 },
              { at: 1, label: '1', strong: true },
              { at: 1.25 }, { at: 1.5 }, { at: 1.75 },
              { at: 2, label: '2', strong: true },
            ]}
            marks={[{ at: 0.75, label: '3/4' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Une fraction n’est pas seulement un morceau de dessin : c’est un{' '}
              <strong>nombre</strong>, et tout nombre a une place sur la demi-droite graduée.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600">
              ① je coupe chaque unité en <strong>4</strong> &nbsp;②&nbsp; j’avance de{' '}
              <strong>3</strong> crans depuis 0.
            </div>
            <Piege>
              <MathText>{'$\\frac{3}{4}$'}</MathText> ne dépasse pas 1 : 3 crans sur les 4 qui
              mènent à 1. Ce sont les fractions dont le haut dépasse le bas qui vont au-delà.
            </Piege>
            <Souvenir>le point que tu as fait glisser jusqu’au bon cran.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M9 — Le pont vers l'écriture à virgule. ── */
    9: [
      {
        id: 'fraction-decimale',
        type: 'vocabulaire',
        title: 'Fraction décimale',
        summary: 'Une fraction dont le bas est 10, 100 ou 1 000 — celle qui s’écrit aussi avec une virgule.',
        visual: <PartsBar den={10} num={5} color="#c084fc" />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$0{,}5 = \\frac{5}{10}$'}</MathText>
              <span className="text-slate-400 mx-3">·</span>
              <MathText>{'$0{,}25 = \\frac{25}{100}$'}</MathText>
            </div>
            <p>
              Ce sont les seules fractions qui se traduisent directement en écriture à virgule :
              un chiffre après la virgule ↔ un bas de 10, deux chiffres ↔ un bas de 100.
            </p>
            <p className="text-xs text-slate-500">
              Toutes les fractions ne sont pas décimales : <MathText>{'$\\frac{1}{3}$'}</MathText>{' '}
              ne se met pas sur 10, ni sur 100.
            </p>
            <Souvenir>la barre en 10 parts dont tu as colorié la moitié — 5 dixièmes.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
