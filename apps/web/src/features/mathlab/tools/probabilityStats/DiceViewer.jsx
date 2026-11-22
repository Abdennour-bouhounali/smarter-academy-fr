import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DiceScene } from './diceScene.js';

/**
 * La table d'expérience dans React : un bloc qui accueille la scène three.js
 * (DiceScene) et la pilote par méthodes. La scène est créée une fois au
 * montage et détruite au démontage ; changer d'expérience remplace les
 * objets, jamais la scène (React StrictMode monte deux fois en dev : la
 * seconde scène remplace proprement la première).
 *
 * `parts` est la pose de REPOS — ce que les objets montrent quand rien ne
 * bouge (le dernier tirage, ou la face 1 / « وجه » d'un document neuf).
 * Sans WebGL, rien ne se crée et `ref.isReady()` répond faux : l'outil fait
 * alors l'expérience sans animation, le tableau reste la vérité.
 *
 * `ref` expose { isReady, throw, cancel, startTumble, stopTumble, topFaces }.
 */
const DiceViewer = forwardRef(function DiceViewer({ kind, count, parts, label }, ref) {
  const { t } = useTranslation('mathlab');
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const [unsupported, setUnsupported] = useState(false);
  // Ce qu'il faut au montage seulement : la scène ne se recrée pour aucune prop.
  const initialRef = useRef({
    kind, count, parts,
    coinLabels: { heads: t('tools.probabilityStats.coin.heads'), tails: t('tools.probabilityStats.coin.tails') },
  });

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let scene;
    try {
      scene = new DiceScene(host, { coinLabels: initialRef.current.coinLabels });
    } catch {
      setUnsupported(true);

      return undefined;
    }
    const first = initialRef.current;
    scene.setKind(first.kind, first.count);
    scene.setStatic(first.parts);
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => { sceneRef.current?.setKind(kind, count); }, [kind, count]);
  const partsKey = parts.join(',');
  useEffect(() => { sceneRef.current?.setStatic(parts); }, [partsKey, kind, count]); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    isReady: () => Boolean(sceneRef.current),
    throw: (values, options) => sceneRef.current?.throw(values, options) ?? Promise.resolve({ cancelled: true }),
    cancel: (restParts) => sceneRef.current?.cancel(restParts),
    startTumble: () => sceneRef.current?.startTumble(),
    stopTumble: (values) => sceneRef.current?.stopTumble(values) ?? Promise.resolve({ cancelled: true }),
    topFaces: () => sceneRef.current?.topFaces() ?? [],
  }), []);

  return (
    <div
      ref={hostRef}
      className="sa-ml-ps__dice"
      role="img"
      aria-label={label}
      data-ml-ps-dice={kind}
      data-ml-ps-dice-count={count}
    >
      {unsupported && (
        <p className="sa-ml-ps__dice-unsupported" role="status" data-ml-ps-dice-unsupported>{t('tools.probabilityStats.diceUnsupported')}</p>
      )}
    </div>
  );
});

export default DiceViewer;
