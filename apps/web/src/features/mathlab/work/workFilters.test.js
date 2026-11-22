import { describe, it, expect } from 'vitest';
import {
  normalizeSearchText, searchableText, selectWorks, sortWorks, periodStart,
  activeWorkFilterCount, duplicateTitle, DEFAULT_WORK_FILTERS, WORK_SORTS, WORK_PERIODS,
} from './workFilters.js';

const NOW = new Date('2026-09-23T12:00:00Z').getTime();
const ago = (ms) => new Date(NOW - ms).toISOString();
const DAY = 86_400_000;

const toolLabel = (id) => ({ functionGrapher: 'راسم الدوال', whiteboard: 'السبّورة', algebra: 'مختبر الجبر' }[id] ?? id);

const works = [
  {
    id: 1, tool: 'functionGrapher', title: 'دراسة الدالة f', isFavorite: true,
    createdAt: ago(10 * DAY), updatedAt: ago(2 * 3600_000),
    summary: { kind: 'curve', text: ['f(x) = x^2'] },
  },
  {
    id: 2, tool: 'whiteboard', title: 'Étude du triangle', isFavorite: false,
    createdAt: ago(40 * DAY), updatedAt: ago(40 * DAY),
    summary: { kind: 'strokes', text: ['المثلث ABC'] },
  },
  {
    id: 3, tool: 'algebra', title: 'حل المعادلة', isFavorite: false,
    createdAt: ago(1 * DAY), updatedAt: ago(3 * DAY),
    summary: { kind: 'equation', text: ['2x + 3 = 11'] },
  },
  {
    id: 4, tool: 'functionGrapher', title: 'بدون عنوان', isFavorite: false,
    createdAt: ago(30 * 60_000), updatedAt: ago(30 * 60_000), summary: null,
  },
];

const pick = (options) => selectWorks(works, { toolLabel, now: NOW, ...options }).map((w) => w.id);

describe('normalizeSearchText — une recherche indulgente, pas un moteur arabe', () => {
  it('ignore la casse et les accents latins', () => {
    expect(normalizeSearchText('Étude')).toBe('etude');
    expect(normalizeSearchText('FONCTION')).toBe('fonction');
  });

  it('ignore le تشكيل et la tatweel — on ne les tape pas', () => {
    expect(normalizeSearchText('الدَّالَّة')).toBe(normalizeSearchText('الدالة'));
    expect(normalizeSearchText('مـــثلث')).toBe('مثلث');
  });

  it('unifie les variantes d’alif, de ya et de ta marbouta', () => {
    expect(normalizeSearchText('أحمد')).toBe(normalizeSearchText('احمد'));
    expect(normalizeSearchText('إشارة')).toBe(normalizeSearchText('اشاره'));
    expect(normalizeSearchText('على')).toBe(normalizeSearchText('علي'));
  });

  it('ramène les chiffres arabo-hindis aux chiffres latins', () => {
    expect(normalizeSearchText('تمرين ٣')).toBe('تمرين 3');
  });
});

describe('searchableText — le titre, l’instrument et le résumé', () => {
  it('cherche dans le titre', () => {
    expect(searchableText(works[0], toolLabel)).toContain('دراسه');
  });

  it('cherche dans le NOM de l’instrument, tel que l’élève le voit', () => {
    expect(searchableText(works[0], toolLabel)).toContain(normalizeSearchText('راسم الدوال'));
  });

  it('cherche dans le texte que l’instrument a mis dans son résumé', () => {
    expect(searchableText(works[2], toolLabel)).toContain('2x + 3 = 11');
  });

  it('ne casse pas sur un travail sans résumé', () => {
    expect(() => searchableText(works[3], toolLabel)).not.toThrow();
  });
});

describe('la recherche', () => {
  it('trouve en arabe, sur une partie du titre', () => {
    expect(pick({ q: 'دالة' })).toEqual([1]);
  });

  it('trouve en français, sans accent ni casse', () => {
    expect(pick({ q: 'etude' })).toEqual([2]);
  });

  it('trouve par le NOM de l’instrument', () => {
    expect(pick({ q: 'السبورة' })).toEqual([2]);
  });

  it('trouve par le contenu du résumé — une expression, une équation', () => {
    expect(pick({ q: 'x^2' })).toEqual([1]);
    expect(pick({ q: '2x + 3' })).toEqual([3]);
  });

  it('une recherche vide ne filtre rien', () => {
    expect(pick({ q: '   ' })).toHaveLength(works.length);
  });

  it('ne trouve rien quand rien ne correspond', () => {
    expect(pick({ q: 'zzzz' })).toEqual([]);
  });
});

describe('les filtres', () => {
  it('filtre par instrument', () => {
    expect(pick({ filters: { ...DEFAULT_WORK_FILTERS, tool: 'functionGrapher' } })).toEqual([4, 1]);
  });

  it('filtre par période — « اليوم » ne garde que ce qui date d’aujourd’hui', () => {
    expect(pick({ filters: { ...DEFAULT_WORK_FILTERS, period: 'today' } })).toEqual([4, 1]);
  });

  it('« هذا الأسبوع » garde sept jours glissants', () => {
    expect(pick({ filters: { ...DEFAULT_WORK_FILTERS, period: 'week' } })).toEqual([4, 1, 3]);
  });

  it('« هذا الشهر » laisse tomber ce qui a quarante jours', () => {
    expect(pick({ filters: { ...DEFAULT_WORK_FILTERS, period: 'month' } })).not.toContain(2);
  });

  it('filtre par favori', () => {
    expect(pick({ filters: { ...DEFAULT_WORK_FILTERS, favorite: true } })).toEqual([1]);
  });

  it('« كل الأوقات » ne borne rien', () => {
    expect(periodStart('all', NOW)).toBeNull();
    expect(WORK_PERIODS).toContain('all');
  });

  it('compte les filtres actifs — la pastille du bouton', () => {
    expect(activeWorkFilterCount(DEFAULT_WORK_FILTERS)).toBe(0);
    expect(activeWorkFilterCount({ tool: 'algebra', period: 'week', favorite: true })).toBe(3);
  });
});

describe('le tri', () => {
  it('par défaut : le plus récemment modifié d’abord', () => {
    expect(pick({})).toEqual([4, 1, 3, 2]);
  });

  it('le plus récemment CRÉÉ n’est pas le plus récemment modifié', () => {
    expect(pick({ sort: 'created' })).toEqual([4, 3, 1, 2]);
  });

  it('du plus ancien', () => {
    expect(pick({ sort: 'oldest' })).toEqual([2, 1, 3, 4]);
  });

  it('par nom, dans les deux sens', () => {
    const asc = pick({ sort: 'titleAsc' });
    expect(asc).toEqual([...pick({ sort: 'titleDesc' })].reverse());
  });

  it('ne modifie pas la liste d’origine', () => {
    const original = [...works];
    sortWorks(works, 'titleAsc');
    expect(works).toEqual(original);
  });

  it('chaque tri offert est compris', () => {
    for (const sort of WORK_SORTS) {
      expect(sortWorks(works, sort)).toHaveLength(works.length);
    }
  });
});

describe('la recherche ET les filtres se combinent, sans se réinitialiser (§47, §48)', () => {
  it('« دالة » + instrument = l’intersection', () => {
    expect(pick({ q: 'دالة', filters: { ...DEFAULT_WORK_FILTERS, tool: 'functionGrapher' } })).toEqual([1]);
    expect(pick({ q: 'دالة', filters: { ...DEFAULT_WORK_FILTERS, tool: 'whiteboard' } })).toEqual([]);
  });

  it('changer le tri ne touche pas aux filtres', () => {
    const filters = { ...DEFAULT_WORK_FILTERS, tool: 'functionGrapher' };
    expect(pick({ filters, sort: 'oldest' })).toEqual([1, 4]);
    expect(filters.tool).toBe('functionGrapher');
  });
});

describe('duplicateTitle', () => {
  it('préfixe le titre', () => {
    expect(duplicateTitle('دراسة الدالة', 'نسخة من ', [])).toBe('نسخة من دراسة الدالة');
  });

  it('ne fait JAMAIS « نسخة من نسخة من » : la copie d’une copie est numérotée', () => {
    const existing = ['نسخة من دراسة'];
    expect(duplicateTitle('نسخة من دراسة', 'نسخة من ', existing)).toBe('نسخة من دراسة (2)');
  });

  it('évite un titre déjà pris', () => {
    const existing = ['نسخة من أ', 'نسخة من أ (2)'];
    expect(duplicateTitle('أ', 'نسخة من ', existing)).toBe('نسخة من أ (3)');
  });

  it('reste dans les 160 caractères que le serveur accepte', () => {
    expect(duplicateTitle('x'.repeat(200), 'نسخة من ', []).length).toBeLessThanOrEqual(160);
  });
});
