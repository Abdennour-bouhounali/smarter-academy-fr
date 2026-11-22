import { useTranslation } from 'react-i18next';
import * as V from './vectorMath.js';
import VectorArrow from './VectorArrow.jsx';
import VectorHandle from './VectorHandle.jsx';
import {
  TipToTail, Parallelogram, OppositeVector, ScaleGuide, RightAngleMark, DirectionArc,
  ComponentLegs, MeasuredSegment, CollinearLine, PolygonShape, TranslationTrace, PointCoordinates,
} from './VectorConstructions.jsx';
import { formatNorm } from './vectorFormat.js';
import { CONSTRUCTION_COLOR, POINT_COLOR } from './vectorScene.js';

/**
 * LE RENDU d'une scène résolue : les objets, leurs constructions, leurs
 * poignées. Ce composant ne CALCULE rien — il reçoit une scène déjà résolue
 * (`resolveScene`) et des relations déjà établies (`analysis.js`), et il les
 * dessine. C'est la séparation demandée au §38 :
 *
 *     géométrie → mathématique → relations → RENDU → contrôles
 *
 * L'ordre de dessin est celui de la lisibilité : les formes au fond, puis
 * les constructions (qui expliquent), puis les أشعة, puis les points, puis
 * les poignées — ce qu'on attrape est toujours au-dessus.
 */
export default function VectorSceneLayer({
  resolved, view, selection, relations, settings,
  onDragPoint, onDragVectorTip, onDragVectorOrigin, onDragEnd, onSelectPoint, onSelectVector,
}) {
  const { t } = useTranslation('mathlab');
  const selectedVectors = new Set(selection.vectors);
  const selectedPoints = new Set(selection.points);
  const vectors = [...resolved.vectors.values()];
  const points = [...resolved.points.values()];

  /** Le شعاع est-il mis en avant ? Une sélection estompe le reste. */
  const anySelected = selectedVectors.size > 0;
  const isFaded = (id) => anySelected && !selectedVectors.has(id);

  return (
    <g className="sa-ml-vec__scene" data-ml-scene>
      {/* ── Les formes (§17) ─────────────────────────────────────────── */}
      {[...resolved.polygons.values()].filter((p) => p.resolved).map((polygon) => (
        <PolygonShape
          key={polygon.id}
          vertices={polygon.vertices}
          color={polygon.source.color}
          image={polygon.name.endsWith('′')}
          name={polygon.name}
        />
      ))}

      {/* ── Les constructions, sous les أشعة ─────────────────────────── */}
      {vectors.filter((v) => v.resolved).map((vector) => {
        const source = vector.source;
        if (source.kind === 'sum' || source.kind === 'difference') {
          const [uId, vId] = source.of;
          const u = resolved.vectors.get(uId);
          const w = resolved.vectors.get(vId);
          if (!u?.components || !w?.components) return null;
          const origin = u.origin;

          return (
            <g key={`build-${vector.id}`}>
              {source.kind === 'difference' && (
                <OppositeVector origin={V.translatePoint(origin, u.components)} v={w.components} color={w.source.color} name={`−${w.name}`} />
              )}
              {source.method === 'parallelogram' && source.kind === 'sum' ? (
                <Parallelogram origin={origin} u={u.components} v={w.components} color={vector.source.color} />
              ) : (
                <TipToTail
                  origin={origin}
                  u={u.components}
                  v={w.components}
                  color={vector.source.color}
                  subtraction={source.kind === 'difference'}
                />
              )}
            </g>
          );
        }
        if (source.kind === 'scaled') {
          const u = resolved.vectors.get(source.of);
          if (!u?.components) return null;

          return <ScaleGuide key={`guide-${vector.id}`} origin={u.origin} u={u.components} color={vector.source.color} view={view} />;
        }

        return null;
      })}

      {/* Le tracé d'un انسحاب : A → A′ (§16) */}
      {points.filter((p) => p.resolved && p.kind === 'image').map((image) => {
        const parent = resolved.points.get(image.source.of);
        if (!parent?.position) return null;

        return <TranslationTrace key={`trace-${image.id}`} from={parent.position} to={image.position} color={CONSTRUCTION_COLOR} />;
      })}

      {/* ── Les relations (§21, §22, §24) ────────────────────────────── */}
      {relations?.collinear?.collinear && !relations.collinear.degenerate && relations.collinear.anchor && (
        <CollinearLine through={relations.collinear.anchor} direction={relations.collinear.through} view={view} />
      )}
      {relations?.pair?.perpendicular && relations.pair.at && (
        <RightAngleMark at={relations.pair.at} u={relations.pair.u} v={relations.pair.v} />
      )}

      {/* ── Le segment mesuré entre deux points sélectionnés (§19) ───── */}
      {relations?.points && (
        <MeasuredSegment
          a={relations.points.a}
          b={relations.points.b}
          label={settings.showLengths ? formatNorm(relations.points.exactDistance).text : null}
        />
      )}

      {/* ── Les أشعة ─────────────────────────────────────────────────── */}
      {vectors.filter((v) => v.resolved).map((vector) => (
        <g key={vector.id}>
          {settings.showLengths && selectedVectors.has(vector.id) && (
            <ComponentLegs origin={vector.origin} v={vector.components} color={vector.source.color} />
          )}
          {settings.showAngles && selectedVectors.has(vector.id) && (
            <DirectionArc origin={vector.origin} v={vector.components} color={vector.source.color} />
          )}
          <VectorArrow
            from={vector.origin}
            to={vector.tip}
            color={vector.source.color}
            name={vector.name}
            faded={isFaded(vector.id)}
            width={selectedVectors.has(vector.id) ? 3.5 : 2.5}
            showComponents={selectedVectors.has(vector.id)}
            onSelect={() => onSelectVector(vector.id)}
          />
        </g>
      ))}

      {/* ── Les points ───────────────────────────────────────────────── */}
      {points.filter((p) => p.resolved).map((point) => (
        <g key={point.id}>
          {selectedPoints.has(point.id) && <PointCoordinates position={point.position} />}
          <VectorHandle
            position={point.position}
            color={point.source.color ?? (point.kind === 'free' ? POINT_COLOR : CONSTRUCTION_COLOR)}
            label={point.name}
            ariaLabel={t(point.draggable ? 'tools.vectors.a11y.dragPoint' : 'tools.vectors.a11y.derivedPoint', { name: point.name })}
            selected={selectedPoints.has(point.id)}
            disabled={!point.draggable}
            radius={point.draggable ? 6 : 5}
            kind="point"
            onSelect={() => onSelectPoint(point.id)}
            onDrag={(clientX, clientY, modifiers) => onDragPoint(point.id, clientX, clientY, modifiers)}
            onDragEnd={onDragEnd}
          />
        </g>
      ))}

      {/* ── Les poignées des أشعة libres (§6, §7) ────────────────────── */}
      {vectors.filter((v) => v.resolved && v.source.kind === 'free').map((vector) => (
        <g key={`handles-${vector.id}`}>
          {/* L'ORIGINE : la déplacer ne change pas les composantes (§6). */}
          <VectorHandle
            position={vector.origin}
            color={vector.source.color}
            radius={5}
            hitRadius={20}
            kind="origin"
            ariaLabel={t('tools.vectors.a11y.dragOrigin', { name: vector.name })}
            selected={selectedVectors.has(vector.id)}
            onSelect={() => onSelectVector(vector.id)}
            onDrag={(clientX, clientY, modifiers) => onDragVectorOrigin(vector.id, clientX, clientY, modifiers)}
            onDragEnd={onDragEnd}
          />
          {/* L'EXTRÉMITÉ : la déplacer change le شعاع (§7). */}
          <VectorHandle
            position={vector.tip}
            color={vector.source.color}
            radius={7}
            kind="tip"
            ariaLabel={t('tools.vectors.a11y.dragTip', { name: vector.name })}
            selected={selectedVectors.has(vector.id)}
            onSelect={() => onSelectVector(vector.id)}
            onDrag={(clientX, clientY, modifiers) => onDragVectorTip(vector.id, clientX, clientY, modifiers)}
            onDragEnd={onDragEnd}
          />
        </g>
      ))}
    </g>
  );
}
