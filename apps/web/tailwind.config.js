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
        'space': ['"Space Grotesk"', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        accent: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'count-up': 'countUp 2s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
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
