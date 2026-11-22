/**
 * La petite fanfare d'une médaille — synthétisée (WebAudio), sans fichier.
 * Or : arpège montant complet + accord ; argent : trois notes ; bronze : deux.
 * Joue seulement si l'élève a activé « الصوت » (préférence de l'appareil,
 * useEffectsPreference, désactivée par défaut). Une erreur audio ne casse rien.
 */
let ctx = null;
const NOTES = {
  gold: [523.25, 659.25, 783.99, 1046.5],
  silver: [523.25, 659.25, 783.99],
  bronze: [440, 554.37],
};

export function playMedal(medal, enabled) {
  if (!enabled || !NOTES[medal]) return;
  try {
    if (!ctx || ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime + 0.02;
    const notes = NOTES[medal];
    notes.forEach((f, i) => {
      const at = t0 + i * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, at);
      osc.connect(gain);
      gain.connect(ctx.destination);
      const last = i === notes.length - 1;
      const len = last ? (medal === 'gold' ? 0.7 : 0.45) : 0.16;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.14, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + len);
      osc.start(at);
      osc.stop(at + len + 0.05);
    });
  } catch {
    // Jamais bloquant.
  }
  if (navigator.vibrate) navigator.vibrate(medal === 'gold' ? [30, 40, 60] : 30);
}
