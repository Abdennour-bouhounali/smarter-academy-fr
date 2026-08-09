/* Smarter Shared Lesson Engine */

let currentXP = 0;
let soundEnabled = true;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type = 'sine', duration = 0.15) {
  if (!soundEnabled) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function playSuccessSound() {
  playTone(523.25, 'triangle', 0.1);
  setTimeout(() => playTone(659.25, 'triangle', 0.1), 100);
  setTimeout(() => playTone(783.99, 'triangle', 0.25), 200);
}

function playErrorSound() {
  playTone(220, 'sawtooth', 0.2);
}

function addXP(amount) {
  currentXP += amount;
  const xpEl = document.getElementById('xpCount');
  if (xpEl) xpEl.textContent = currentXP;
  updateProgressBar();
}

function updateProgressBar() {
  const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
  const currentScroll = window.scrollY;
  const scrollPercent = Math.min(100, Math.round((currentScroll / (totalScrollable || 1)) * 100));
  const xpBonusPercent = Math.min(40, Math.round(currentXP / 5));
  const finalPercent = Math.min(100, Math.max(scrollPercent, xpBonusPercent));

  const bar = document.getElementById('progressBar');
  if (bar) bar.style.width = finalPercent + '%';
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('hidden');
}

function triggerConfetti() {
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.backgroundColor = ['#3B82F6', '#8B5CF6', '#0284C7', '#F59E0B', '#10B981'][Math.floor(Math.random() * 5)];
    c.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2500);
  }
}

function markLessonCompleted(lessonId) {
  try {
    const completed = JSON.parse(localStorage.getItem('smarter_completed_lessons') || '[]');
    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
      localStorage.setItem('smarter_completed_lessons', JSON.stringify(completed));
    }
  } catch (e) {}
}

window.addEventListener('scroll', updateProgressBar);

document.addEventListener('DOMContentLoaded', () => {
  const soundBtn = document.getElementById('soundToggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      const icon = document.getElementById('soundIconOn');
      if (icon) icon.style.opacity = soundEnabled ? '1' : '0.3';
    });
  }

  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [
        {left: '\\[', right: '\\]', display: true},
        {left: '\\(', right: '\\)', display: false}
      ]
    });
  }
});
