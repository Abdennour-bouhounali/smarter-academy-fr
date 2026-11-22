import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookA, ChevronDown } from 'lucide-react';
import { Notation } from './LogicPieces.jsx';
import { DICTIONARY_GROUPS, entriesOfGroup } from './dictionary.js';

/**
 * « قاموس الرموز » — comment se LIT ce qui n'est pas écrit en arabe.
 *
 * Il est là parce que toute l'interface est arabe sauf la notation, et que
 * la notation ne peut pas l'être (ARABIC_RTL_CONTRACT §4). Un élève qui voit
 * « ⇒ » pour la première fois n'a sinon aucun moyen d'apprendre qu'on le lit
 * « يستلزم » — et un symbole qu'on ne sait pas prononcer est un symbole
 * qu'on ne pense pas.
 *
 * Il est REPLIÉ par défaut : on ne commence pas un laboratoire par un
 * lexique. Il s'ouvre quand l'élève bute, et il reste ouvert tant qu'il veut.
 * Ce n'est pas un état du document — un dictionnaire ouvert n'est pas un
 * travail — donc il vit en `useState` et ne voyage pas jusqu'au serveur.
 */
export default function DictionaryPanel({ open: controlledOpen, onToggle } = {}) {
  const { t } = useTranslation('mathlab');
  const [ownOpen, setOwnOpen] = useState(false);
  // Contrôlable par le parent (LogicLabTool élargit le pupitre quand le
  // lexique s'ouvre — §3.5) ; autonome sinon.
  const open = controlledOpen ?? ownOpen;
  const setOpen = onToggle ? (update) => onToggle(typeof update === 'function' ? update(open) : update) : setOwnOpen;

  return (
    <section className="sa-ml-lg__card" data-ml-lg-dictionary>
      <button
        type="button"
        className="sa-ml-lg__btn sa-ml-lg__dictToggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        data-ml-lg-dictionary-toggle
      >
        <BookA size={16} aria-hidden="true" />
        {t('tools.logic.dictionary.heading')}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`sa-ml-lg__dictChevron${open ? ' is-open' : ''}`}
        />
      </button>

      {open && (
        <div className="sa-ml-lg__dictBody">
          <p className="sa-ml-lg__note">{t('tools.logic.dictionary.lead')}</p>

          {DICTIONARY_GROUPS.map((group) => (
            <div key={group} data-ml-lg-dict-group={group}>
              <h3 className="sa-ml-lg__sectionTitle">{t(`tools.logic.dictionary.groups.${group}`)}</h3>

              <dl className="sa-ml-lg__dictList">
                {entriesOfGroup(group).map((entry) => (
                  <div key={entry.id} className="sa-ml-lg__dictRow" data-ml-lg-dict-entry={entry.id}>
                    <dt className="sa-ml-lg__dictSymbol">
                      <Notation>{entry.symbol}</Notation>
                    </dt>
                    <dd className="sa-ml-lg__dictMeaning">
                      <b>{t(`tools.logic.dictionary.entries.${entry.id}.name`)}</b>
                      <span className="sa-ml-lg__dictReading">
                        {t(`tools.logic.dictionary.entries.${entry.id}.reading`)}
                      </span>
                      {entry.example && (
                        <Notation className="sa-ml-lg__dictExample">{entry.example}</Notation>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          <p className="sa-ml-lg__note">{t('tools.logic.dictionary.whyLatin')}</p>
        </div>
      )}
    </section>
  );
}
