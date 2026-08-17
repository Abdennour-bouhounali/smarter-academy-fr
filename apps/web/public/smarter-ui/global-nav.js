// global-nav.js
// Injecte la navbar globale du site sur les pages statiques des modules/leçons

document.addEventListener('DOMContentLoaded', () => {
  const navHTML = `
    <nav id="global-navbar" class="fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a href="/" class="flex items-center gap-2.5 group">
            <img src="/smarter-academy-logo.webp" alt="Smarter Academy" class="h-10 w-auto rounded-lg object-contain" />
            <div class="hidden sm:flex flex-col">
              <span class="font-bold text-slate-900 text-sm leading-none" style="font-family: 'Space Grotesk', sans-serif;">Smarter Academy</span>
            </div>
          </a>

          <!-- Desktop Links -->
          <div class="hidden lg:flex items-center gap-1">
            <a href="/" class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50">Accueil</a>
            <a href="/about" class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50">Présentation</a>
            <a href="/courses" class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50">Cours de maths</a>
            <a href="/resources" class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50">Ressources</a>
            <a href="/faq" class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50">FAQ</a>
            <a href="/contact" class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50">Contact</a>
          </div>

          <!-- CTA + Mobile Toggle -->
          <div class="flex items-center gap-3">
            <a href="/contact" class="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5" style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); box-shadow: 0 4px 14px rgba(59,130,246,0.3);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Réserver un cours
            </a>
            <button id="mobile-menu-toggle" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-drawer" class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
              <svg id="icon-menu" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
              <svg id="icon-close" class="hidden" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Drawer -->
    <div id="mobile-drawer" class="hidden fixed top-16 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xl lg:hidden">
      <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
        <a href="/" class="block w-full text-left px-4 py-3 rounded-xl font-sans text-sm font-medium text-slate-700 hover:bg-slate-50">Accueil</a>
        <a href="/about" class="block w-full text-left px-4 py-3 rounded-xl font-sans text-sm font-medium text-slate-700 hover:bg-slate-50">Présentation</a>
        <a href="/courses" class="block w-full text-left px-4 py-3 rounded-xl font-sans text-sm font-medium text-slate-700 hover:bg-slate-50">Cours de maths</a>
        <a href="/resources" class="block w-full text-left px-4 py-3 rounded-xl font-sans text-sm font-medium text-slate-700 hover:bg-slate-50">Ressources</a>
        <a href="/faq" class="block w-full text-left px-4 py-3 rounded-xl font-sans text-sm font-medium text-slate-700 hover:bg-slate-50">FAQ</a>
        <a href="/contact" class="block w-full text-left px-4 py-3 rounded-xl font-sans text-sm font-medium text-slate-700 hover:bg-slate-50">Contact</a>
        <a href="/contact" class="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-sans text-sm font-semibold text-white" style="background: linear-gradient(135deg, #3B82F6, #8B5CF6);">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Réserver un cours d'essai
        </a>
      </div>
    </div>
  `;

  // Insérer la nav en haut du body
  document.body.insertAdjacentHTML('afterbegin', navHTML);

  const drawer = document.getElementById('mobile-drawer');
  const toggle = document.getElementById('mobile-menu-toggle');
  const iconMenu = document.getElementById('icon-menu');
  const iconClose = document.getElementById('icon-close');

  function openDrawer() {
    drawer.classList.remove('hidden');
    iconMenu.classList.add('hidden');
    iconClose.classList.remove('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.add('hidden');
    iconMenu.classList.remove('hidden');
    iconClose.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Toggle on button click
  toggle.addEventListener('click', function () {
    if (drawer.classList.contains('hidden')) {
      openDrawer();
    } else {
      closeDrawer();
    }
  });

  // Close when any link inside the drawer is clicked
  drawer.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !drawer.classList.contains('hidden')) {
      closeDrawer();
      toggle.focus();
    }
  });

  // Ajuster la navbar des leçons (si elle existe) pour qu'elle passe sous la navbar globale
  const lessonNav = document.querySelector('nav.fixed.top-0:not(#global-navbar)');
  if (lessonNav) {
    lessonNav.classList.remove('top-0');
    lessonNav.classList.add('top-16'); // Descend la nav de la leçon de 64px
  }

  // Ajuster le padding top du main/body seulement si une 2eme nav fixe existe
  if (lessonNav) {
    if (document.body.classList.contains('pt-16')) {
      document.body.classList.remove('pt-16');
      document.body.classList.add('pt-32');
    }
  }
});

