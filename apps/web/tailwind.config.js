/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ───────────────────────────────────────────────────────────────────
         ÉCHELLE TYPOGRAPHIQUE — +25% SUR LE CORPS DU TEXTE
         ───────────────────────────────────────────────────────────────────
         ~8 300 `text-sm` / `text-xs` portent la quasi-totalité du texte de
         l'interface (leçons, exercices, pratique). Seule une échelle de
         jetons les atteint : aucune retouche page par page ne le pourrait.

         Le facteur 1.25 est PLEIN jusqu'à `xl`, puis s'amortit et redevient
         neutre à partir de `5xl`. Raison : les grandes tailles ne servent
         qu'aux titres d'affichage (héros marketing), déjà dimensionnés ;
         les multiplier romprait la hiérarchie au lieu de la préserver.

         Les interlignes suivent la même progression — augmenter le corps
         sans l'interligne produirait des lignes serrées et illisibles.

         ATTENTION : un `fontSize={13}` dans un <svg> est en unités de
         viewBox, pas en CSS px. Cette échelle ne l'atteint pas, et il ne
         faut pas le « corriger » à la main.
         ─────────────────────────────────────────────────────────────────── */
      fontSize: {
        xs:   ['0.9375rem', { lineHeight: '1.25rem' }],  // 12 → 15px
        sm:   ['1.0625rem', { lineHeight: '1.5rem'  }],  // 14 → 17px
        base: ['1.25rem',   { lineHeight: '1.8125rem' }],// 16 → 20px
        lg:   ['1.375rem',  { lineHeight: '1.9375rem' }],// 18 → 22px
        xl:   ['1.5rem',    { lineHeight: '2rem'    }],  // 20 → 24px
        '2xl': ['1.75rem',  { lineHeight: '2.25rem' }],  // 24 → 28px
        '3xl': ['2.125rem', { lineHeight: '2.5rem'  }],  // 30 → 34px
        '4xl': ['2.5rem',   { lineHeight: '2.75rem' }],  // 36 → 40px
        // À partir d'ici : tailles d'affichage, inchangées.
        '5xl': ['3rem',     { lineHeight: '1' }],
        '6xl': ['3.75rem',  { lineHeight: '1' }],
        '7xl': ['4.5rem',   { lineHeight: '1' }],
        '8xl': ['6rem',     { lineHeight: '1' }],
        '9xl': ['8rem',     { lineHeight: '1' }],
      },
      fontFamily: {
        // Cairo is the canonical Arabic font (ar-DZ — src/locale.js, index.css).
        // None of the Latin identity fonts (Inter, Space Grotesk, JetBrains
        // Mono) carry Arabic glyphs, so Cairo sits right behind each of them:
        // Arabic runs fall through to Cairo per glyph while Latin runs, digits
        // and code keep the identity fonts. Tajawal is only a last Arabic
        // fallback (covers the gap before the non-blocking Google Fonts sheet
        // finishes loading).
        //
        // `sans` is redefined on purpose: Tailwind's default (ui-sans-serif,
        // system-ui…) DOES have Arabic glyphs, so a `font-sans` element would
        // silently render Arabic in a system font instead of Cairo.
        // `mono` carries Cairo for the same reason: labels, badges and buttons
        // are styled `font-mono` all over the platform, and without an Arabic
        // fallback their Arabic text rendered in the OS monospace font.
        'sans': ['Inter', 'Cairo', 'Tajawal', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        'space': ['"Space Grotesk"', 'Cairo', 'Tajawal', 'sans-serif'],
        'inter': ['Inter', 'Cairo', 'Tajawal', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'Cairo', 'Tajawal', 'monospace'],
        // `font-arabic` puts Cairo first where a surface is Arabic-only by
        // design (e.g. alongside `dir="ltr"` math, where the surrounding text
        // should stay Arabic even if a parent's default font were ever Latin).
        'arabic': ['Cairo', 'Tajawal', '"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        accent: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
        },
        /* THE NINE COLOURS of the navigation and of its pages (NAVIGATION_REBUILD_PLAN.md §6bis). Colour is meaning:
           `now` = the next step, `done` = finished, `alert` = needs you. No other colour, no gradient, in the menus.
           `ink` is for TEXT only; every filled or outlined shape (button, lit door, avatar) is `accent`, the brand blue. */
        nav: {
          ink: '#0B1B3F',
          accent: '#3B5BDB',
          'accent-soft': '#EAEFFF',
          now: '#F59E0B',
          'now-soft': '#FFF5DB',
          done: '#12A36B',
          'done-soft': '#E3F7EE',
          alert: '#D6455D',
          'alert-soft': '#FDE8EC',
          muted: '#5B6785',
          line: '#E3E8F2',
          page: '#F6F8FC',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'count-up': 'countUp 2s ease-out forwards',
        // Bouton de commande d'un livre : 3 battements quand le formulaire devient
        // valide, puis repos (WCAG 2.2.2 — rien qui bouge plus de 5 s) ; jamais sous
        // prefers-reduced-motion (utilisé avec `motion-safe:`).
        'cta-ready': 'ctaReady 1.2s ease-out 3',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        ctaReady: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.55)' },
          '35%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 16px rgba(37, 99, 235, 0)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
