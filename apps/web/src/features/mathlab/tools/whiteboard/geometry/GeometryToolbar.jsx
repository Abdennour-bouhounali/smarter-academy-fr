import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pencil, PencilRuler, Ruler, DraftingCompass, TriangleRight, Eraser, MousePointer2, Play, Square, LocateFixed,
  Settings2, EyeOff, Lock, Unlock, Magnet, Ruler as RulerIcon,
} from 'lucide-react';
import { PENCIL_KINDS, PENCIL_STYLES, PENCIL_WIDTHS, RULER_LENGTHS_CM, clampRadius } from './instruments.js';
import { cmValue } from './constructions.js';
import { UNITS_PER_CM } from './geoMath.js';

/** La منقلة n'a pas d'icône lucide : un demi-disque gradué, dans le même trait (24 × 24, stroke 2). */
function ProtractorIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d="M2 18h20" />
      <path d="M3 18a9 9 0 0 1 18 0" />
      <path d="M12 18l4.5-7" />
      <path d="M12 9v1.5M7.5 10.5l.8 1.2M16.5 10.5l-.8 1.2" />
    </svg>
  );
}

function ToolButton({ id, icon: Icon, label, pressed, onClick, title, disabled = false, tone = '' }) {
  return (
    <button
      type="button"
      className={`sa-geo-btn${pressed ? ' is-active' : ''}${tone ? ` sa-geo-btn--${tone}` : ''}`}
      aria-pressed={pressed}
      onClick={onClick}
      title={title ?? label}
      disabled={disabled}
      data-geo-button={id}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="sa-geo-btn__label">{label}</span>
    </button>
  );
}

function Chip({ id, pressed, onClick, children, title }) {
  return (
    <button type="button" className={`sa-geo-chip${pressed ? ' is-active' : ''}`} aria-pressed={pressed} onClick={onClick} title={title} data-geo-chip={id}>
      {children}
    </button>
  );
}

/**
 * La barre « أدوات الهندسة » — DANS le flux, au-dessus du canevas, jamais
 * en surimpression : rien à positionner, rien qui puisse sortir de l'écran
 * (le défaut qu'avait le menu de la bibliothèque, §5.7). Sur un écran
 * étroit, la rangée DÉFILE horizontalement : aucun outil ne disparaît.
 *
 * Trois rangées au plus : les outils ; les réglages de ce qu'on tient en
 * main (le crayon, l'instrument touché en dernier) ; les réglages du bureau
 * (repliés par défaut). Les libellés restent visibles — des noms d'outils
 * qu'un élève doit apprendre, pas des pictogrammes à deviner.
 */
export default function GeometryToolbar({
  tool, exTool, focus, desk, reading, hint, offscreen, canReplay, replaying, penState, holder,
  onPickExcalidraw, onPencil, onToggleInstrument, onRecenter, onUpdateDesk, onUpdateInstrument, onToggleMeasures,
  onProtractorConstruct, onPinReading, onReplay, onAfterAction,
}) {
  const { t } = useTranslation('mathlab');
  const k = (key) => t(`tools.whiteboard.geo.${key}`);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const inst = desk.instruments;
  const settings = desk.settings;

  const setPencil = (patch) => onUpdateDesk((d) => ({ ...d, pencil: { ...d.pencil, ...patch } }));
  const setSetting = (key) => onUpdateDesk((d) => ({ ...d, settings: { ...d.settings, [key]: !d.settings[key] } }));

  const instrumentTools = (kind) => (
    <>
      <button type="button" className="sa-geo-chip" onClick={() => onRecenter([kind])} data-geo-recenter={kind}>
        <LocateFixed size={15} aria-hidden="true" /> {k('recenter')}
      </button>
      <button type="button" className="sa-geo-chip" onClick={() => onToggleInstrument(kind)} data-geo-hide={kind}>
        <EyeOff size={15} aria-hidden="true" /> {k('hide')}
      </button>
    </>
  );

  let context = null;
  if (focus === 'compass' && inst.compass.visible) {
    context = (
      <>
        <span className="sa-geo-group__label">{k('compass')}</span>
        <label className="sa-geo-field">
          <span>{k('radius')}</span>
          <input
            type="number" inputMode="decimal" min={0.2} max={25} step={0.1} dir="ltr"
            value={cmValue(inst.compass.radius)}
            onChange={(e) => {
              const cm = Number(e.target.value);
              if (Number.isFinite(cm) && cm > 0) onUpdateInstrument('compass', { radius: clampRadius(cm * UNITS_PER_CM) });
            }}
            aria-label={k('radiusCm')}
            data-geo-radius
          />
          <span className="sa-geo-unit">{k('unitShort')}</span>
        </label>
        <Chip id="compass-lock" pressed={inst.compass.locked} onClick={() => onUpdateInstrument('compass', { locked: !inst.compass.locked })} title={k('lockRadiusHint')}>
          {inst.compass.locked ? <Lock size={15} aria-hidden="true" /> : <Unlock size={15} aria-hidden="true" />}
          {inst.compass.locked ? k('unlockRadius') : k('lockRadius')}
        </Chip>
        {instrumentTools('compass')}
        <span className="sa-geo-hint">{k(inst.compass.locked ? 'compassLockedHint' : 'compassHint')}</span>
      </>
    );
  } else if (focus === 'protractor' && inst.protractor.visible) {
    context = (
      <>
        <span className="sa-geo-group__label">{k('protractor')}</span>
        {/* Deux gestes distincts, jamais mélangés : lire un angle, ou en construire un. */}
        <Chip id="protractor-measure" pressed={inst.protractor.mode !== 'construct' && inst.protractor.mode !== 'arc'} onClick={() => onUpdateInstrument('protractor', { mode: 'measure' })}>{k('modeMeasure')}</Chip>
        <Chip id="protractor-construct" pressed={inst.protractor.mode === 'construct'} onClick={() => onUpdateInstrument('protractor', { mode: 'construct' })}>{k('modeConstruct')}</Chip>
        <Chip id="protractor-arc" pressed={inst.protractor.mode === 'arc'} onClick={() => onUpdateInstrument('protractor', { mode: 'arc' })}>{k('modeArc')}</Chip>
        <span className="sa-geo-sep" aria-hidden="true" />
        {inst.protractor.mode === 'arc' && <span className="sa-geo-hint">{k('arcHint')}</span>}
        <span className={reading !== null ? 'sa-geo-reading' : 'sa-geo-hint'} role="status" aria-live="polite" data-geo-reading={reading ?? ''}>
          {reading !== null ? <>{k('angle')} <bdi dir="ltr">{reading}°</bdi></> : k('protractorHint')}
        </span>
        {reading !== null && (
          <button type="button" className="sa-geo-chip" onClick={onPinReading} data-geo-pin-reading>{k('pinReading')}</button>
        )}
        {inst.protractor.mode === 'construct' && (<>
        <label className="sa-geo-field">
          <span>{k('buildAngle')}</span>
          <input
            type="number" inputMode="numeric" min={0} max={180} step={1} dir="ltr"
            value={inst.protractor.needleDeg}
            onChange={(e) => {
              const deg = Number(e.target.value);
              if (Number.isFinite(deg)) onUpdateInstrument('protractor', { needleDeg: Math.min(180, Math.max(0, Math.round(deg))) });
            }}
            aria-label={k('buildAngleLabel')}
            data-geo-needle
          />
          <span className="sa-geo-unit">°</span>
        </label>
        <button type="button" className="sa-geo-chip" onClick={() => onProtractorConstruct(false)} data-geo-mark>{k('mark')}</button>
        <button type="button" className="sa-geo-chip sa-geo-chip--primary" onClick={() => onProtractorConstruct(true)} data-geo-draw-side>{k('drawSide')}</button>
        <span className="sa-geo-hint">{k('constructHint')}</span>
        </>)}
        {instrumentTools('protractor')}
      </>
    );
  } else if (focus === 'setSquare' && inst.setSquare.visible) {
    context = (
      <>
        <span className="sa-geo-group__label">{k('setSquare')}</span>
        <Chip id="square-45" pressed={inst.setSquare.kind === '45'} onClick={() => onUpdateInstrument('setSquare', { kind: '45' })}><bdi dir="ltr">45°</bdi></Chip>
        <Chip id="square-3060" pressed={inst.setSquare.kind === '3060'} onClick={() => onUpdateInstrument('setSquare', { kind: '3060' })}><bdi dir="ltr">30° / 60°</bdi></Chip>
        <Chip id="perp-snap" pressed={settings.perpSnap} onClick={() => setSetting('perpSnap')} title={k('perpSnapHint')}>{k('perpSnap')}</Chip>
        {instrumentTools('setSquare')}
        <span className="sa-geo-hint" data-geo-hint={hint ?? ''}>{hint ? k(`hint.${hint}`) : k('setSquareHint')}</span>
      </>
    );
  } else if (focus === 'ruler' && inst.ruler.visible) {
    context = (
      <>
        <span className="sa-geo-group__label">{k('ruler')}</span>
        <span className="sa-geo-group__label sa-geo-group__label--soft">{k('length')}</span>
        {RULER_LENGTHS_CM.map((cm) => (
          <Chip key={cm} id={`ruler-${cm}`} pressed={inst.ruler.lengthCm === cm} onClick={() => onUpdateInstrument('ruler', { lengthCm: cm })}>
            <bdi dir="ltr">{cm}</bdi>
          </Chip>
        ))}
        {instrumentTools('ruler')}
        <span className="sa-geo-hint">{k('rulerHint')}</span>
      </>
    );
  }

  const pencilRow = tool === 'pencil' && (
    <>
      <span className="sa-geo-group__label">{k('geoPencil')}</span>
      {PENCIL_KINDS.map((kind) => (
        <Chip key={kind} id={`kind-${kind}`} pressed={desk.pencil.kind === kind} onClick={() => setPencil({ kind })}>{k(`kinds.${kind}`)}</Chip>
      ))}
      <span className="sa-geo-sep" aria-hidden="true" />
      <span className="sa-geo-group__label sa-geo-group__label--soft">{k('thickness')}</span>
      {Object.keys(PENCIL_WIDTHS).map((w) => (
        <Chip key={w} id={`width-${w}`} pressed={desk.pencil.width === w} onClick={() => setPencil({ width: w })}>{k(`widths.${w}`)}</Chip>
      ))}
      <span className="sa-geo-sep" aria-hidden="true" />
      <span className="sa-geo-group__label sa-geo-group__label--soft">{k('lineStyle')}</span>
      {PENCIL_STYLES.map((s) => (
        <Chip key={s} id={`style-${s}`} pressed={desk.pencil.style === s} onClick={() => setPencil({ style: s })}>{k(`styles.${s}`)}</Chip>
      ))}
    </>
  );

  return (
    <div
      className="sa-geo-bar" role="toolbar" aria-label={k('title')} data-geo-toolbar
      // Après un bouton (pas un champ), le clavier revient à la سبّورة :
      // Ctrl+Z annule le trait qu'on vient de faire, comme avant.
      onClick={(e) => { if (e.target.closest('button') && !e.target.closest('input')) onAfterAction?.(); }}
    >
      <div className="sa-geo-row" data-geo-row="tools">
        <span className="sa-geo-title" aria-hidden="true">
          <DraftingCompass size={16} />
          <span>{k('title')}</span>
        </span>
        <ToolButton id="pen" icon={Pencil} label={k('pen')} title={k('penHint')} pressed={!tool && exTool === 'freedraw'} onClick={() => onPickExcalidraw('freedraw')} />
        <ToolButton id="geoPencil" icon={PencilRuler} label={k('geoPencil')} title={k('geoPencilHint')} pressed={tool === 'pencil'} onClick={onPencil} tone="geo" />
        <span className="sa-geo-sep" aria-hidden="true" />
        <ToolButton id="ruler" icon={Ruler} label={k('ruler')} pressed={inst.ruler.visible} onClick={() => onToggleInstrument('ruler')} tone="geo" />
        <ToolButton id="compass" icon={DraftingCompass} label={k('compass')} title={k('compassTitle')} pressed={inst.compass.visible} onClick={() => onToggleInstrument('compass')} tone="geo" />
        <ToolButton id="protractor" icon={ProtractorIcon} label={k('protractor')} pressed={inst.protractor.visible} onClick={() => onToggleInstrument('protractor')} tone="geo" />
        <ToolButton id="setSquare" icon={TriangleRight} label={k('setSquare')} pressed={inst.setSquare.visible} onClick={() => onToggleInstrument('setSquare')} tone="geo" />
        <span className="sa-geo-sep" aria-hidden="true" />
        <ToolButton id="eraser" icon={Eraser} label={k('eraser')} pressed={!tool && exTool === 'eraser'} onClick={() => onPickExcalidraw('eraser')} />
        <ToolButton id="select" icon={MousePointer2} label={k('select')} pressed={!tool && exTool === 'selection'} onClick={() => onPickExcalidraw('selection')} />
        <span className="sa-geo-sep" aria-hidden="true" />
        <ToolButton
          id="replay" icon={replaying ? Square : Play} label={replaying ? k('replayStop') : k('replay')}
          pressed={replaying} onClick={onReplay} disabled={!canReplay && !replaying} title={k('replayHint')}
        />
        {offscreen.length > 0 && (
          <ToolButton id="recenterAll" icon={LocateFixed} label={k('recenter')} pressed={false} onClick={() => onRecenter(offscreen)} tone="warn" />
        )}
        <ToolButton id="settings" icon={Settings2} label={k('settings')} pressed={settingsOpen} onClick={() => setSettingsOpen((o) => !o)} />
      </div>

      {penState && (
        <div className="sa-geo-row sa-geo-row--pen" data-geo-row="pen" role="status" aria-live="polite">
          <span className={`sa-geo-pen sa-geo-pen--${penState}`} data-geo-pen-status={penState}>
            <span className="sa-geo-pen__dot" aria-hidden="true" />
            {holder && penState !== 'idle' ? t('tools.whiteboard.geo.penHeld', { instrument: k(holder) }) : settings.attach && settings.snap ? k('penFreeHint') : k('penFree')}
          </span>
          <Chip id="attach" pressed={settings.snap && settings.attach} onClick={() => onUpdateDesk((d) => ({ ...d, settings: { ...d.settings, snap: true, attach: !(d.settings.snap && d.settings.attach) } }))}>
            {settings.snap && settings.attach ? k('releasePen') : k('attachPen')}
          </Chip>
        </div>
      )}

      {(pencilRow || context) && (
        <div className="sa-geo-row sa-geo-row--context" data-geo-row="context">
          {pencilRow}
          {pencilRow && context && <span className="sa-geo-sep sa-geo-sep--strong" aria-hidden="true" />}
          {context}
        </div>
      )}

      {settingsOpen && (
        <div className="sa-geo-row sa-geo-row--settings" data-geo-row="settings">
          <Chip id="snap" pressed={settings.snap} onClick={() => setSetting('snap')} title={k('snapHint')}>
            <Magnet size={15} aria-hidden="true" /> {k('snap')}
          </Chip>
          {[['attach', 'snapAttach'], ['graduations', 'snapGraduations'], ['points', 'snapPoints'], ['angles', 'snapAngles']].map(([key, label]) => (
            <Chip key={key} id={key} pressed={settings.snap && settings[key]} onClick={() => setSetting(key)}>{k(label)}</Chip>
          ))}
          <Chip id="perpSnapGlobal" pressed={settings.perpSnap} onClick={() => setSetting('perpSnap')} title={k('perpSnapHint')}>{k('perpSnap')}</Chip>
          <Chip id="measures" pressed={settings.measures} onClick={onToggleMeasures}>{settings.measures ? k('hideMeasures') : k('showMeasures')}</Chip>
          <Chip id="autoLabels" pressed={settings.autoLabels} onClick={() => setSetting('autoLabels')}>{k('autoLabels')}</Chip>
          <Chip id="exportInstruments" pressed={settings.exportInstruments} onClick={() => setSetting('exportInstruments')} title={k('exportInstrumentsHint')}>
            {k('exportInstruments')}
          </Chip>
          <span className="sa-geo-hint">
            <RulerIcon size={14} aria-hidden="true" className="sa-geo-inline-icon" /> {k('unitNote')}
          </span>
          <span className="sa-geo-hint">{k('keyboard')}</span>
        </div>
      )}
    </div>
  );
}
