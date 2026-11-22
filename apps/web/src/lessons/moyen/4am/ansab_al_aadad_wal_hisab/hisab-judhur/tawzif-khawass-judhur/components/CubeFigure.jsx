
/**
 * Le cube ABCDEFGH de l'exercice 32 (p. 29), dessiné comme dans le manuel :
 * face avant A D C B, face arrière E H G F (E au-dessus de F), arêtes cachées
 * en pointillés, et les segments [CF] et [CE] tracés en rouge. Dessin en
 * code (jamais une image), géométrie en `dir="ltr"` ; la légende arabe est
 * du texte DOM.
 */
const P = { A: [30, 60], D: [150, 60], C: [150, 180], B: [30, 180], E: [80, 20], H: [200, 20], G: [200, 140], F: [80, 140] };
const OFF = { A: [-14, 0], B: [-14, 10], C: [4, 16], D: [6, 12], E: [-4, -6], H: [6, -4], G: [6, 6], F: [-16, -2] };
const seg = (a, b) => ({ x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1] });

export default function CubeFigure() {
  const visible = [['A', 'D'], ['D', 'C'], ['C', 'B'], ['B', 'A'], ['A', 'E'], ['E', 'H'], ['D', 'H'], ['H', 'G'], ['C', 'G']];
  const hidden = [['E', 'F'], ['F', 'G'], ['B', 'F']];
  return (
    <figure className="flex flex-col items-center gap-1 rounded-2xl border-2 border-slate-200 bg-white p-3" data-cube-figure>
      <div dir="ltr">
        <svg viewBox="0 0 230 200" width="230" height="200" className="max-w-full h-auto" role="img" aria-label="المكعب ABCDEFGH والقطعتان CF و CE">
          {visible.map(([a, b]) => <line key={a + b} {...seg(a, b)} stroke="#334155" strokeWidth={2} />)}
          {hidden.map(([a, b]) => <line key={a + b} {...seg(a, b)} stroke="#64748B" strokeWidth={1.5} strokeDasharray="5 4" />)}
          <line {...seg('C', 'F')} stroke="#E11D48" strokeWidth={2} strokeDasharray="6 3" />
          <line {...seg('C', 'E')} stroke="#E11D48" strokeWidth={2} strokeDasharray="6 3" />
          {Object.entries(P).map(([k, [x, y]]) => (
            <text key={k} x={x + OFF[k][0]} y={y + OFF[k][1]} fontSize={14} fontWeight="bold" fill="#0F172A">{k}</text>
          ))}
        </svg>
      </div>
      <figcaption className="text-xs text-slate-600">مكعّب طول حرفه 5cm، والقطعتان CF و CE بالأحمر.</figcaption>
    </figure>
  );
}
