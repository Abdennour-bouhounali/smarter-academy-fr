/**
 * Les effets « hors monde » de « مدار » : traînée, particules, chiffres qui
 * s'envolent, secousse, éclair. Purement visuels — jamais lus par le score.
 */
export function createFx() {
  return { trail: [], particles: [], floaters: [], shake: 0, flash: 0, flashColor: null };
}

export function resetFx(fx) {
  fx.trail.length = 0;
  fx.particles.length = 0;
  fx.floaters.length = 0;
  fx.shake = 0;
  fx.flash = 0;
}

export function updateFx(fx, world, dt, { reduced = false } = {}) {
  if (world.status === 'running') {
    fx.trail.push({ theta: world.theta, r: world.r });
    const max = reduced ? 10 : 26;
    while (fx.trail.length > max) fx.trail.shift();
  }
  for (const p of fx.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.96;
    p.vy *= 0.96;
  }
  fx.particles = fx.particles.filter((p) => p.life > 0);
  for (const f of fx.floaters) f.life -= dt;
  fx.floaters = fx.floaters.filter((f) => f.life > 0);
  fx.shake *= Math.pow(0.0005, dt);
  fx.flash *= Math.pow(0.002, dt);
}

export function burst(fx, x, y, { count = 14, speed = 160, size = 10, sprite = 'gold', life = 0.6, reduced = false } = {}) {
  const n = reduced ? Math.ceil(count / 3) : count;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = speed * (0.35 + Math.random() * 0.65);
    fx.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, size: size * (0.5 + Math.random()), life, max: life, sprite });
  }
}

export function floater(fx, x, y, text, color = '#fde68a', big = false) {
  fx.floaters.push({ x, y, text, color, big, life: 0.9, max: 0.9 });
}
